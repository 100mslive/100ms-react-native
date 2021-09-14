#import "React/RCTViewManager.h"
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HmsView, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(trackId, NSString);
RCT_EXPORT_VIEW_PROPERTY(sink, BOOL);

@end
