#import "React/RCTViewManager.h"
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HmsView, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(data, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(scaleType, NSString)

@end
