#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const PATHS = {
  sdkVersions: path.join(ROOT, 'packages/react-native-hms/sdk-versions.json'),
  hmsPkg: path.join(ROOT, 'packages/react-native-hms/package.json'),
  hmsExamplePkg: path.join(ROOT, 'packages/react-native-hms/example/package.json'),
  roomKitPkg: path.join(ROOT, 'packages/react-native-room-kit/package.json'),
  roomKitExamplePkg: path.join(ROOT, 'packages/react-native-room-kit/example/package.json'),
};

const INSTALL_DIRS = [
  'packages/react-native-hms',
  'packages/react-native-hms/example',
  'packages/react-native-room-kit',
  'packages/react-native-room-kit/example',
];

const SDK_FIELDS = ['ios', 'android', 'iOSBroadcastExtension', 'iOSHMSHLSPlayer', 'iOSNoiseCancellationModels'];
const SDK_FLAG_TO_FIELD = {
  'ios-sdk': 'ios',
  'android-sdk': 'android',
  'ios-broadcast': 'iOSBroadcastExtension',
  'ios-hls': 'iOSHMSHLSPlayer',
  'ios-noise-cancel': 'iOSNoiseCancellationModels',
};
const SDK_FIELD_TO_PROMPT = {
  ios: 'iOS HMSSDK version',
  android: 'Android HMSSDK version',
  iOSBroadcastExtension: 'iOSBroadcastExtension version',
  iOSHMSHLSPlayer: 'iOSHMSHLSPlayer version',
  iOSNoiseCancellationModels: 'iOSNoiseCancellationModels version',
};

const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const BUMP_KINDS = ['skip', 'patch', 'minor', 'major'];
const BOOL_FLAGS = new Set(['no-install', 'yes', 'force', 'help', 'dry-run']);

function printHelp() {
  console.log(`Usage: node scripts/update-sdk-versions.js [options]

Bumps native SDK versions and npm package versions in lock-step across the
monorepo. With no flags it prompts interactively (Enter to keep current value).

Native SDK version overrides (semver, e.g. 1.17.2):
  --ios-sdk <ver>            iOS HMSSDK version
  --android-sdk <ver>        Android HMSSDK version
  --ios-broadcast <ver>      iOSBroadcastExtension version
  --ios-hls <ver>            iOSHMSHLSPlayer version
  --ios-noise-cancel <ver>   iOSNoiseCancellationModels version

npm package bumps (skip|patch|minor|major):
  --hms-bump <kind>          Bump @100mslive/react-native-hms
  --room-kit-bump <kind>     Bump @100mslive/react-native-room-kit

Behavior:
  --dry-run                  Print proposed changes and exit (no writes,
                             no npm install, no changelog refresh)
  --no-install               Skip 'npm install' in the four affected dirs
  --yes                      Skip the apply confirmation
  --force                    Allow running with a dirty working tree
  --help                     Show this message

Side-effects:
  - room-kit's peerDependencies['@100mslive/react-native-hms'] is always
    synced to the resolved hms version (auto-corrects drift).
  - Validates iOS native versions by HEAD-checking each pod against the
    CocoaPods CDN; aborts on any 404 (only when iOS native fields changed).
  - Validates the Android native version by HEAD-checking the live.100ms
    artifacts on Maven Central (only when --android-sdk changed).
  - After validation passes, runs npm install in 4 dirs (parallel) to
    refresh lock files. Uses --legacy-peer-deps to tolerate pre-existing
    peer-dep mismatches in the monorepo.
  - Then runs 'pod install --repo-update' in both iOS example dirs and
    './gradlew :app:dependencies --refresh-dependencies' in both Android
    example dirs to refresh lock files. These are side-effect refreshes;
    the HTTP HEAD checks above are the actual validators.
  - All native validation/refresh skipped with --no-install. On validation
    failure the script aborts; revert with 'git checkout .' since the
    dirty-tree guard ensures the working tree was clean on entry.
  - Then runs scripts/update-changelog-versions.js to refresh the version
    block at the bottom of ExampleAppChangelog.txt.
`);
}

function parseArgs(argv) {
  const flags = {};
  const bool = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${a}`);
    }
    const key = a.slice(2);
    if (BOOL_FLAGS.has(key)) {
      bool[key] = true;
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      throw new Error(`Flag --${key} requires a value`);
    }
    flags[key] = next;
    i++;
  }
  return { flags, bool };
}

function assertSemver(label, v) {
  if (!SEMVER_RE.test(v)) {
    throw new Error(`Invalid semver for ${label}: "${v}" (expected MAJOR.MINOR.PATCH)`);
  }
}

function bumpSemver(v, kind) {
  if (kind === 'skip') return v;
  assertSemver('current package version', v);
  const [maj, min, pat] = v.split('.').map(Number);
  if (kind === 'patch') return `${maj}.${min}.${pat + 1}`;
  if (kind === 'minor') return `${maj}.${min + 1}.0`;
  if (kind === 'major') return `${maj + 1}.0.0`;
  throw new Error(`Unknown bump kind: ${kind}`);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
}

function ask(rl, question, defaultValue) {
  return new Promise((resolve) => {
    const prompt = defaultValue !== undefined && defaultValue !== ''
      ? `${question} [${defaultValue}]: `
      : `${question}: `;
    rl.question(prompt, (answer) => {
      const trimmed = answer.trim();
      resolve(trimmed === '' ? defaultValue : trimmed);
    });
  });
}

function checkDirtyTree(force) {
  if (force) return;
  const r = spawnSync('git', ['status', '--porcelain', '--', ...Object.values(PATHS)], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (r.error || r.status !== 0) return;
  const out = r.stdout.trim();
  if (out) {
    console.error('Working tree has uncommitted changes in version files:');
    console.error(out);
    console.error('Commit/stash first, or rerun with --force.');
    process.exit(1);
  }
}

function npmInstallParallel(dirs) {
  console.log('\nRunning npm install in 4 directories in parallel...');
  const procs = dirs.map((dir) => {
    const cwd = path.join(ROOT, dir);
    return new Promise((resolve, reject) => {
      // --legacy-peer-deps tolerates the pre-existing peer-dep mismatches in
      // this monorepo (e.g. react-native-video-plugin pinning an older
      // react-native-hms peer). Without it, every bump that touches the peer
      // dep auto-correction would fail npm install on otherwise-fine state.
      const child = spawn('npm', ['install', '--no-audit', '--no-fund', '--legacy-peer-deps'], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let stderr = '';
      child.stderr.on('data', (d) => (stderr += d.toString()));
      child.stdout.on('data', () => {}); // drain
      child.on('close', (code) => {
        if (code === 0) {
          console.log(`  ✓ ${dir}`);
          resolve();
        } else {
          console.error(`  ✗ ${dir} (exit ${code})\n${stderr}`);
          reject(new Error(`npm install failed in ${dir}`));
        }
      });
    });
  });
  return Promise.all(procs);
}

// ----------------------------------------------------------------------------
// NATIVE VERSION VALIDATION
// ----------------------------------------------------------------------------
//
// Two stages when iOS or Android native fields change:
//
// 1. PRIMARY VALIDATOR: registry-existence check via HTTPS HEAD against the
//    CocoaPods CDN / Maven Central. Fast (~200ms each) and catches the
//    most common failure mode: a typo'd version that doesn't exist (e.g.
//    1.17.2 when the latest published is 1.17.1).
//
//    Why not just rely on `pod install`? `pod install` reuses Podfile.lock
//    when the lockfile is satisfiable, so a Podspec change pointing at a
//    non-existent version can be silently swallowed. The HTTP HEAD check
//    is the source of truth.
//
// 2. SIDE-EFFECT REFRESH: after the HTTP check passes, run
//    `pod install --repo-update` and `./gradlew :app:dependencies
//    --refresh-dependencies`. These don't reliably re-validate the
//    HMSSDK version (see (1)) but they DO refresh other lock entries
//    (Firebase, transitive deps).
//
// Both stages are skipped entirely with --no-install. Validation runs
// BEFORE npm install in the main flow so a wrong version aborts in
// ~200ms instead of waiting for pkg manager resolution.

async function httpExists(url) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
      return res.ok;
    } finally {
      clearTimeout(t);
    }
  } catch {
    return false;
  }
}

function cocoapodsCdnUrl(podName, version) {
  const md5hex = require('crypto').createHash('md5').update(podName).digest('hex');
  const a = md5hex[0], b = md5hex[1], c = md5hex[2];
  return `https://cdn.cocoapods.org/Specs/${a}/${b}/${c}/${podName}/${version}/${podName}.podspec.json`;
}

function mavenCentralPomUrl(groupPath, artifact, version) {
  return `https://repo1.maven.org/maven2/${groupPath}/${artifact}/${version}/${artifact}-${version}.pom`;
}

async function validateIosNativeVersions(targets) {
  const pods = [
    ['HMSSDK', targets.ios],
    ['HMSBroadcastExtensionSDK', targets.iOSBroadcastExtension],
    ['HMSHLSPlayerSDK', targets.iOSHMSHLSPlayer],
    ['HMSNoiseCancellationModels', targets.iOSNoiseCancellationModels],
  ];
  console.log('\nVerifying iOS native versions exist on CocoaPods CDN...');
  const results = await Promise.all(
    pods.map(async ([name, version]) => ({
      name, version, ok: await httpExists(cocoapodsCdnUrl(name, version)),
    }))
  );
  let failed = false;
  for (const r of results) {
    if (r.ok) console.log(`  ✓ ${r.name} ${r.version}`);
    else { console.log(`  ✗ ${r.name} ${r.version} — not found on CocoaPods CDN`); failed = true; }
  }
  if (failed) {
    throw new Error(
      'One or more iOS native versions don\'t exist on CocoaPods. ' +
      'Check the latest available versions on https://cocoapods.org'
    );
  }
}

async function validateAndroidNativeVersion(targets) {
  const artifacts = ['android-sdk', 'video-view', 'hls-player'];
  console.log('\nVerifying Android native version exists on Maven Central...');
  const results = await Promise.all(
    artifacts.map(async (a) => ({
      a, ok: await httpExists(mavenCentralPomUrl('live/100ms', a, targets.android)),
    }))
  );
  let failed = false;
  for (const r of results) {
    if (r.ok) console.log(`  ✓ live.100ms:${r.a}:${targets.android}`);
    else { console.log(`  ✗ live.100ms:${r.a}:${targets.android} — not found on Maven Central`); failed = true; }
  }
  if (failed) {
    throw new Error(
      'One or more Android native artifacts don\'t exist on Maven Central. ' +
      'Check https://central.sonatype.com/artifact/live.100ms/android-sdk'
    );
  }
}

// Side-effect lock-file refresh (NOT a validator — see big comment above).
async function refreshPodLockfiles(iosDirs) {
  for (const rel of iosDirs) {
    const cwd = path.join(ROOT, rel);
    if (!fs.existsSync(cwd)) {
      console.log(`  (skip) ${rel} — directory missing`);
      continue;
    }
    console.log(`\nRefreshing Podfile.lock in ${rel} via pod install --repo-update (this can take a few minutes)...`);
    await new Promise((resolve) => {
      const child = spawn('pod', ['install', '--repo-update'], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
      child.stdout.on('data', () => {});
      let stderr = '';
      child.stderr.on('data', (d) => (stderr += d.toString()));
      child.on('close', (code) => {
        if (code === 0) console.log(`  ✓ ${rel}`);
        else { console.warn(`  ⚠ pod install in ${rel} exited ${code}; review manually.`); if (stderr) console.warn(stderr.slice(-500)); }
        resolve();
      });
      child.on('error', (e) => { console.warn(`  ⚠ pod CLI not available or failed: ${e.message}`); resolve(); });
    });
  }
}

async function refreshGradleDependencies(androidDirs) {
  for (const rel of androidDirs) {
    const cwd = path.join(ROOT, rel);
    const gradlew = path.join(cwd, 'gradlew');
    if (!fs.existsSync(cwd) || !fs.existsSync(gradlew)) {
      console.log(`  (skip) ${rel} — directory or gradlew missing`);
      continue;
    }
    console.log(`\nRefreshing Android dependencies in ${rel} via gradle (this can take a few minutes)...`);
    await new Promise((resolve) => {
      const child = spawn('./gradlew', [':app:dependencies', '--refresh-dependencies', '--quiet'], {
        cwd, stdio: ['ignore', 'pipe', 'pipe'],
      });
      child.stdout.on('data', () => {});
      let stderr = '';
      child.stderr.on('data', (d) => (stderr += d.toString()));
      child.on('close', (code) => {
        if (code === 0) console.log(`  ✓ ${rel}`);
        else { console.warn(`  ⚠ gradle :app:dependencies in ${rel} exited ${code}; review manually.`); if (stderr) console.warn(stderr.slice(-500)); }
        resolve();
      });
      child.on('error', (e) => { console.warn(`  ⚠ gradlew not executable or failed: ${e.message}`); resolve(); });
    });
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.bool.help) {
    printHelp();
    return;
  }

  // Validate flag values up front (before any prompts).
  for (const flag of Object.keys(SDK_FLAG_TO_FIELD)) {
    if (args.flags[flag] !== undefined) assertSemver(`--${flag}`, args.flags[flag]);
  }
  for (const flag of ['hms-bump', 'room-kit-bump']) {
    if (args.flags[flag] !== undefined && !BUMP_KINDS.includes(args.flags[flag])) {
      throw new Error(`Invalid value for --${flag}: ${args.flags[flag]} (expected ${BUMP_KINDS.join('|')})`);
    }
  }

  const current = {
    sdk: readJson(PATHS.sdkVersions),
    hmsPkg: readJson(PATHS.hmsPkg),
    hmsExamplePkg: readJson(PATHS.hmsExamplePkg),
    roomKitPkg: readJson(PATHS.roomKitPkg),
    roomKitExamplePkg: readJson(PATHS.roomKitExamplePkg),
  };
  const originalHmsVersion = current.hmsPkg.version;
  const originalRoomKitVersion = current.roomKitPkg.version;
  const originalPeerDep = current.roomKitPkg.peerDependencies?.['@100mslive/react-native-hms'];

  const targetSdk = {};
  let hmsBump;
  let roomKitBump;
  let rl;

  const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
  if (isInteractive) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  }

  for (const [flag, field] of Object.entries(SDK_FLAG_TO_FIELD)) {
    if (args.flags[flag] !== undefined) {
      targetSdk[field] = args.flags[flag];
    } else if (rl) {
      targetSdk[field] = await ask(rl, SDK_FIELD_TO_PROMPT[field], current.sdk[field]);
    } else {
      targetSdk[field] = current.sdk[field];
    }
  }
  if (args.flags['hms-bump'] !== undefined) {
    hmsBump = args.flags['hms-bump'];
  } else if (rl) {
    hmsBump = await ask(rl, `Bump @100mslive/react-native-hms (current ${originalHmsVersion})? [${BUMP_KINDS.join('/')}]`, 'patch');
  } else {
    hmsBump = 'skip';
  }
  if (args.flags['room-kit-bump'] !== undefined) {
    roomKitBump = args.flags['room-kit-bump'];
  } else if (rl) {
    roomKitBump = await ask(rl, `Bump @100mslive/react-native-room-kit (current ${originalRoomKitVersion})? [${BUMP_KINDS.join('/')}]`, 'patch');
  } else {
    roomKitBump = 'skip';
  }

  // Re-validate (interactive answers might be malformed).
  for (const field of SDK_FIELDS) assertSemver(field, targetSdk[field]);
  if (!BUMP_KINDS.includes(hmsBump)) throw new Error(`Invalid hms bump: ${hmsBump}`);
  if (!BUMP_KINDS.includes(roomKitBump)) throw new Error(`Invalid room-kit bump: ${roomKitBump}`);

  const newHmsVersion = bumpSemver(originalHmsVersion, hmsBump);
  const newRoomKitVersion = bumpSemver(originalRoomKitVersion, roomKitBump);

  // Build the change manifest used for both preview and write.
  const sdkDiff = {};
  for (const field of SDK_FIELDS) {
    if (current.sdk[field] !== targetSdk[field]) {
      sdkDiff[field] = [current.sdk[field], targetSdk[field]];
    }
  }
  const hmsPkgChanged = newHmsVersion !== originalHmsVersion;
  const hmsExampleChanged = newHmsVersion !== current.hmsExamplePkg.version;
  const roomKitPkgChanged = newRoomKitVersion !== originalRoomKitVersion;
  const peerDepChanged = originalPeerDep !== newHmsVersion;
  const roomKitExampleChanged = newRoomKitVersion !== current.roomKitExamplePkg.version;

  const anyChange =
    Object.keys(sdkDiff).length > 0 ||
    hmsPkgChanged ||
    hmsExampleChanged ||
    roomKitPkgChanged ||
    peerDepChanged ||
    roomKitExampleChanged;

  if (!anyChange) {
    if (rl) rl.close();
    console.log('\n✅ Nothing to do — all versions already match the requested values.');
    return;
  }

  // Preview.
  console.log('\nProposed changes:');
  if (Object.keys(sdkDiff).length) {
    console.log(`\n  ${path.relative(ROOT, PATHS.sdkVersions)}`);
    for (const [field, [from, to]] of Object.entries(sdkDiff)) {
      console.log(`    ${field}: ${from} -> ${to}`);
    }
  }
  if (hmsPkgChanged) {
    console.log(`\n  ${path.relative(ROOT, PATHS.hmsPkg)}`);
    console.log(`    version: ${originalHmsVersion} -> ${newHmsVersion}`);
  }
  if (hmsExampleChanged) {
    console.log(`\n  ${path.relative(ROOT, PATHS.hmsExamplePkg)}`);
    console.log(`    version: ${current.hmsExamplePkg.version} -> ${newHmsVersion}`);
  }
  if (roomKitPkgChanged || peerDepChanged) {
    console.log(`\n  ${path.relative(ROOT, PATHS.roomKitPkg)}`);
    if (roomKitPkgChanged) console.log(`    version: ${originalRoomKitVersion} -> ${newRoomKitVersion}`);
    if (peerDepChanged) console.log(`    peerDependencies['@100mslive/react-native-hms']: ${originalPeerDep} -> ${newHmsVersion}`);
  }
  if (roomKitExampleChanged) {
    console.log(`\n  ${path.relative(ROOT, PATHS.roomKitExamplePkg)}`);
    console.log(`    version: ${current.roomKitExamplePkg.version} -> ${newRoomKitVersion}`);
  }

  if (args.bool['dry-run']) {
    if (rl) rl.close();
    console.log('\n(dry-run — no files written, npm install skipped, changelog not refreshed)');
    return;
  }

  // Confirm.
  if (!args.bool.yes) {
    if (!rl) {
      console.error('\nRefusing to apply non-interactively without --yes.');
      process.exit(1);
    }
    const confirm = await ask(rl, '\nApply these changes? [y/N]', 'N');
    if (!/^[yY]/.test(confirm)) {
      rl.close();
      console.log('Aborted.');
      return;
    }
  }
  if (rl) rl.close();

  checkDirtyTree(args.bool.force);

  // Apply writes.
  console.log();
  if (Object.keys(sdkDiff).length) {
    for (const field of SDK_FIELDS) current.sdk[field] = targetSdk[field];
    writeJson(PATHS.sdkVersions, current.sdk);
    console.log(`✓ wrote ${path.relative(ROOT, PATHS.sdkVersions)}`);
  }
  if (hmsPkgChanged) {
    current.hmsPkg.version = newHmsVersion;
    writeJson(PATHS.hmsPkg, current.hmsPkg);
    console.log(`✓ wrote ${path.relative(ROOT, PATHS.hmsPkg)}`);
  }
  if (hmsExampleChanged) {
    current.hmsExamplePkg.version = newHmsVersion;
    writeJson(PATHS.hmsExamplePkg, current.hmsExamplePkg);
    console.log(`✓ wrote ${path.relative(ROOT, PATHS.hmsExamplePkg)}`);
  }
  if (roomKitPkgChanged || peerDepChanged) {
    if (roomKitPkgChanged) current.roomKitPkg.version = newRoomKitVersion;
    if (peerDepChanged) {
      current.roomKitPkg.peerDependencies = current.roomKitPkg.peerDependencies || {};
      current.roomKitPkg.peerDependencies['@100mslive/react-native-hms'] = newHmsVersion;
    }
    writeJson(PATHS.roomKitPkg, current.roomKitPkg);
    console.log(`✓ wrote ${path.relative(ROOT, PATHS.roomKitPkg)}`);
  }
  if (roomKitExampleChanged) {
    current.roomKitExamplePkg.version = newRoomKitVersion;
    writeJson(PATHS.roomKitExamplePkg, current.roomKitExamplePkg);
    console.log(`✓ wrote ${path.relative(ROOT, PATHS.roomKitExamplePkg)}`);
  }

  // Native version validation runs BEFORE npm install so a wrong version
  // aborts in ~200ms instead of waiting for the (potentially slow / flaky)
  // npm peer-dep resolution. Skipped entirely with --no-install.
  const iosNativeChanged =
    !!sdkDiff.ios ||
    !!sdkDiff.iOSBroadcastExtension ||
    !!sdkDiff.iOSHMSHLSPlayer ||
    !!sdkDiff.iOSNoiseCancellationModels;
  const androidNativeChanged = !!sdkDiff.android;

  if (!args.bool['no-install'] && iosNativeChanged) {
    await validateIosNativeVersions(targetSdk);
  }
  if (!args.bool['no-install'] && androidNativeChanged) {
    await validateAndroidNativeVersion(targetSdk);
  }

  if (!args.bool['no-install']) {
    await npmInstallParallel(INSTALL_DIRS);
  } else {
    console.log('\n(skipped npm install — lock files not refreshed)');
  }

  // Side-effect lock refresh (after HTTP validation has already passed).
  if (!args.bool['no-install'] && iosNativeChanged) {
    await refreshPodLockfiles([
      'packages/react-native-hms/example/ios',
      'packages/react-native-room-kit/example/ios',
    ]);
  }
  if (!args.bool['no-install'] && androidNativeChanged) {
    await refreshGradleDependencies([
      'packages/react-native-hms/example/android',
      'packages/react-native-room-kit/example/android',
    ]);
  }

  console.log('\nUpdating ExampleAppChangelog.txt version block...');
  const r = spawnSync('node', [path.join(__dirname, 'update-changelog-versions.js')], {
    stdio: 'inherit',
    cwd: ROOT,
  });
  if (r.status !== 0) {
    throw new Error('update-changelog-versions.js failed');
  }

  // Summary.
  console.log('\n✅ Done.\n');
  console.log('Suggested commit message:');
  console.log('-----');
  const summaryLines = ['chore: bump native SDK versions and tooling', ''];
  if (sdkDiff.ios) summaryLines.push(`- HMSSDK iOS: ${sdkDiff.ios[0]} -> ${sdkDiff.ios[1]}`);
  if (sdkDiff.android) summaryLines.push(`- HMSSDK Android: ${sdkDiff.android[0]} -> ${sdkDiff.android[1]}`);
  if (sdkDiff.iOSBroadcastExtension) summaryLines.push(`- iOSBroadcastExtension: ${sdkDiff.iOSBroadcastExtension[0]} -> ${sdkDiff.iOSBroadcastExtension[1]}`);
  if (sdkDiff.iOSHMSHLSPlayer) summaryLines.push(`- iOSHMSHLSPlayer: ${sdkDiff.iOSHMSHLSPlayer[0]} -> ${sdkDiff.iOSHMSHLSPlayer[1]}`);
  if (sdkDiff.iOSNoiseCancellationModels) summaryLines.push(`- iOSNoiseCancellationModels: ${sdkDiff.iOSNoiseCancellationModels[0]} -> ${sdkDiff.iOSNoiseCancellationModels[1]}`);
  if (hmsPkgChanged) summaryLines.push(`- @100mslive/react-native-hms: ${originalHmsVersion} -> ${newHmsVersion}`);
  if (roomKitPkgChanged) summaryLines.push(`- @100mslive/react-native-room-kit: ${originalRoomKitVersion} -> ${newRoomKitVersion}`);
  if (peerDepChanged && !hmsPkgChanged) {
    summaryLines.push(`- room-kit peerDependency on react-native-hms: ${originalPeerDep} -> ${newHmsVersion}`);
  }
  console.log(summaryLines.join('\n'));
  console.log('-----');

  if (sdkDiff.ios || sdkDiff.iOSBroadcastExtension || sdkDiff.iOSHMSHLSPlayer || sdkDiff.iOSNoiseCancellationModels) {
    console.log('\nReminder: iOS native version changed. Refresh CocoaPods before any iOS build:');
    console.log('  cd packages/react-native-room-kit/example/ios && pod install');
    console.log('  cd packages/react-native-hms/example/ios && pod install');
  }
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
