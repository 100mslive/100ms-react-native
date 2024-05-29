@objc(ReactNativeVideoPlugin)
class ReactNativeVideoPlugin: NSObject {

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(a*b)
  }
}
