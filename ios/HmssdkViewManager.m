#import "React/RCTViewManager.h"
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HmssdkViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(color, NSString);
RCT_EXPORT_VIEW_PROPERTY(userId, NSString);
RCT_EXPORT_VIEW_PROPERTY(authToken, NSString);
RCT_EXPORT_VIEW_PROPERTY(roomId, NSString);
RCT_EXPORT_VIEW_PROPERTY(isMute, BOOL);
RCT_EXPORT_VIEW_PROPERTY(switchCamera, BOOL);
RCT_EXPORT_VIEW_PROPERTY(layout, NSDictionary);
RCT_EXPORT_VIEW_PROPERTY(muteVideo, BOOL);

@end
