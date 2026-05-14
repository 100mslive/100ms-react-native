#import "React/RCTViewManager.h"
#import <Foundation/Foundation.h>

// Under the New Architecture, `<HMSView />` is rendered via the Fabric
// component view in HMSViewComponentView.mm. The legacy paper
// `RCT_EXTERN_MODULE` + `RCT_EXPORT_VIEW_PROPERTY` declarations below
// are only used in old-arch / interop mode, so we guard the whole
// block with `#if !RCT_NEW_ARCH_ENABLED` to prevent double-registration.
#if !RCT_NEW_ARCH_ENABLED

@interface RCT_EXTERN_MODULE(HMSView, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(data, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(scaleType, NSString)
RCT_EXPORT_VIEW_PROPERTY(onDataReturned, RCTDirectEventBlock)
RCT_EXTERN_METHOD(capture:(nonnull NSNumber *)node requestId:(nonnull NSNumber *)requestId)
RCT_EXPORT_VIEW_PROPERTY(autoSimulcast, BOOL);

@end

#endif  // !RCT_NEW_ARCH_ENABLED
