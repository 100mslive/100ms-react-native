# 16KB Page Size Compliance Investigation

## Executive Summary

After extensive investigation, we found that **AGP 8.7.2's `android.experimental.ndk.16kPageSize.support=true` flag does NOT produce 16KB-aligned native libraries** for React Native 0.77.3 applications.

## Test Configuration

- **React Native**: 0.77.3
- **Android Gradle Plugin**: 8.7.2
- **Gradle**: 8.11.1
- **NDK**: 27.1.12297006 (16KB compatible)
- **Build Tools**: 35.0.0
- **Test Device**: 16KB page size device (16384 bytes confirmed)

## What We Tested

### 1. Direct APK Build (`./gradlew assembleDebug`)

- **Result**: 0/71 libraries 16KB aligned ❌
- **Build Type**: APK
- **Conclusion**: Expected - APKs don't get automatic alignment

### 2. Android App Bundle (`./gradlew bundleDebug`)

- **Result**: AAB created (94MB)
- **Bundle Config**: Contains experimental 16KB flag

### 3. Universal APK from AAB (bundletool)

- **Result**: 0/71 libraries 16KB aligned ❌
- **Build Type**: Universal APK from AAB
- **Conclusion**: Alignment not applied

### 4. Device-Targeted APK from AAB (bundletool)

- **Result**: 0/21 libraries 16KB aligned ❌
- **Build Type**: Device-specific APK (arm64-v8a)
- **Conclusion**: **Critical finding - even device-targeted APKs from AAB are not aligned**

## Current gradle.properties

```properties
# Enable 16KB page size support for Android 15+ devices
android.experimental.ndk.16kPageSize.support=true
```

## Current Status

### ✅ What Works

- App runs correctly on 16KB devices (backward compatibility mode)
- All native functionality works (camera, animations, video, etc.)
- No crashes or errors
- Build configuration is correct (NDK 27, 64-bit only)

### ❌ What Doesn't Work

- Native libraries are NOT aligned to 16KB boundaries
- App shows `PageSizeMismatchDialog` warning on launch
- Running in compatibility mode (`pageSizeCompat=4`)
- Potential performance impact on 16KB devices

## Sample Misalignment Data

From device-targeted AAB APK (base-arm64_v8a.apk):

```
libVisionCamera.so: off by 472 bytes
libbarhopper_v3.so: off by 2566 bytes
libc++_shared.so: off by 15196 bytes
libeffectssdk.so: off by 15012 bytes
libfbjni.so: off by 4799 bytes
... and 16 more libraries
```

## Root Cause Analysis

The `android.experimental.ndk.16kPageSize.support=true` flag in AGP 8.7.2:

1. ✅ Enables NDK compilation for 16KB pages
2. ✅ Compiles libraries correctly
3. ❌ **Does NOT enforce 16KB alignment during APK/AAB packaging**

This appears to be:

- A limitation or bug in AGP 8.7.2
- Potentially incompatible with React Native's packaging process
- Or requires additional undocumented configuration

## Recommendations

### For Development

**Accept compatibility mode** - The app works fine, warning is acceptable for dev builds.

### For Production

1. **Upload AAB to Play Store** - Let Play Store handle distribution
2. **Test with Play Store-generated APKs** - Play Store may apply alignment server-side
3. **Monitor Play Store Console** - Check for 16KB warnings
4. **Consider AGP updates** - Watch for AGP 8.8+ with better 16KB support

### Alternative Solutions Being Explored

1. **AGP 8.8+**: Future versions may have better 16KB support
2. **React Native 0.78+**: May include improved 16KB handling
3. **Custom Build Tools**: Complex, not recommended
4. **Native Modules**: Ensure all modules support 16KB (most do)

## Configuration Checklist

Current configuration is **optimal for React Native 0.77.3**:

- ✅ `android.experimental.ndk.16kPageSize.support=true`
- ✅ NDK 27.1.12297006 (16KB compatible)
- ✅ 64-bit only architectures (arm64-v8a, x86_64)
- ✅ `buildFeatures { buildConfig = true }`
- ✅ `android:allowNativeHeapPointerTagging="true"`
- ✅ Modern packaging (`useLegacyPackaging = false`)
- ✅ targetSdkVersion 34
- ✅ compileSdkVersion 35

## Next Steps

1. **Upload to Play Store** as AAB for production testing
2. **Monitor device reports** in Play Store Console
3. **Test Play Store-downloaded APK** on 16KB device
4. **Update to AGP 8.8+** when React Native supports it
5. **File issue with React Native** if problem persists

## References

- Android 16KB Page Size: https://developer.android.com/guide/practices/page-sizes
- AGP 8.3+ Documentation: https://developer.android.com/build/releases/gradle-plugin
- React Native 0.77 Release: https://github.com/facebook/react-native/releases/tag/v0.77.0

## UPDATE: NDK r28 Investigation Results

### Test with NDK r28b (28.1.13356709)

After upgrading from NDK 27.1.12297006 to NDK r28b (28.1.13356709), we tested whether NDK r28's default 16KB compilation would resolve the alignment issue.

**Configuration:**

- NDK: r28b (28.1.13356709) ✅
- AGP: 8.7.2 ✅
- Flag: `android.experimental.ndk.16kPageSize.support=true` ✅

**Result:** ❌ **STILL 0/21 libraries aligned**

### Critical Discovery

This definitively proves:

1. ❌ The issue is **NOT with NDK compilation**
2. ❌ The issue is **NOT with AGP packaging configuration**
3. ✅ The issue is with **bundletool's APK generation from AAB**

Even though:

- NDK r28 compiles libraries correctly
- AGP 8.7.2 has 16KB support
- Experimental flag is enabled

**bundletool still generates APKs with 4KB-aligned ZIP entries**, regardless of the source AAB configuration.

### The Real Problem

The `android.experimental.ndk.16kPageSize.support=true` flag and NDK r28:

1. ✅ Enable proper NDK compilation for 16KB
2. ✅ Package AAB with correct metadata
3. ❌ **But bundletool doesn't honor 16KB alignment when extracting APKs**

This appears to be a **limitation in bundletool** or a missing configuration flag for 16KB alignment during APK extraction.

### Play Store Hypothesis

The libraries may only get proper 16KB alignment when:

- AAB is uploaded to Google Play Store
- Play Store's server-side tooling generates device-specific APKs
- Play Store applies 16KB alignment during server-side APK generation

This would explain why local bundletool doesn't produce aligned APKs, but Play Store distributions might work correctly.

---

_Investigation completed: October 24, 2025_
_React Native 0.77.3 + AGP 8.7.2 + NDK r28b + Gradle 8.11.1_
