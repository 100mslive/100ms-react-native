#import "React/RCTViewManager.h"
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HMSView, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(data, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(scaleType, NSString)
RCT_EXPORT_VIEW_PROPERTY(onDataReturned, RCTDirectEventBlock)
RCT_EXTERN_METHOD(capture:(nonnull NSNumber *)node requestId:(nonnull NSNumber *)requestId)

@end
