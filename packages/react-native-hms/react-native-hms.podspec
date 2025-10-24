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
