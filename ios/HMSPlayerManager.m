
#import "React/RCTViewManager.h"
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HMSPlayerManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(url, NSString);
RCT_EXPORT_VIEW_PROPERTY(enableStats, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enableControls, BOOL);
RCT_EXPORT_VIEW_PROPERTY(onHmsHlsPlaybackEvent, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onHmsHlsStatsEvent, RCTDirectEventBlock);

@end
