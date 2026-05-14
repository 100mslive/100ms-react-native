require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
sdkVersions = JSON.parse(File.read(File.join(__dir__, "sdk-versions.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-hms"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "16.0" }
  s.source       = { :git => "https://github.com/100mslive/100ms-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true
  s.swift_version = "5.0"

  # ---------------------------------------------------------------------------
  # Workaround for upstream CocoaPods bug (open since 2016):
  #   https://github.com/CocoaPods/CocoaPods/issues/5351
  #   https://github.com/CocoaPods/CocoaPods/issues/9432
  #
  # Because this pod has a Swift bridging header (`Hmssdk-Bridging-Header.h`),
  # CocoaPods adds `-import-underlying-module` to the Swift compile flags. That
  # flag makes `swiftc -emit-objc-header` inject this line near the top of the
  # auto-generated `react_native_hms-Swift.h`:
  #
  #     #import <react_native_hms/react_native_hms.h>     ← Xcode expects this
  #
  # But CocoaPods names the actual umbrella header verbatim with the pod name:
  #
  #     react-native-hms-umbrella.h                       ← CocoaPods creates this
  #
  # Same content, different name — and our `.mm` files fail to compile because
  # `react_native_hms.h` doesn't exist on disk.
  #
  # The script below runs before every compile and creates `react_native_hms.h`
  # as a copy of the existing umbrella. Self-contained in this podspec — zero
  # changes required on the consumer side.
  #
  # Long-term fix: drop `Hmssdk-Bridging-Header.h` and use `import React` in
  # each Swift file. That removes `-import-underlying-module` from the Swift
  # flags entirely and makes this workaround unnecessary. Tracked for Phase 2.
  # ---------------------------------------------------------------------------
  s.script_phases = [
    {
      :name => "[react-native-hms] Create Swift umbrella header alias",
      :execution_position => :before_compile,
      :script => <<~SCRIPT,
        set -e
        UMBRELLA_DIR="${PODS_ROOT:-${SRCROOT}/Pods}/Headers/Public/react_native_hms"
        SRC="${UMBRELLA_DIR}/react-native-hms-umbrella.h"
        DST="${UMBRELLA_DIR}/react_native_hms.h"
        if [ -f "${SRC}" ] && [ ! -f "${DST}" ]; then
          cp "${SRC}" "${DST}"
        fi
      SCRIPT
    },
  ]

  # Use modern dependency installation if available, otherwise fallback to React-Core
  if defined?(install_modules_dependencies()) != nil
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end

  # 100ms SDK dependencies
  s.dependency "HMSSDK", sdkVersions["ios"]
  s.dependency 'HMSBroadcastExtensionSDK', sdkVersions["iOSBroadcastExtension"]
  s.dependency 'HMSHLSPlayerSDK', sdkVersions["iOSHMSHLSPlayer"]
  s.dependency 'HMSNoiseCancellationModels', sdkVersions["iOSNoiseCancellationModels"]
end
