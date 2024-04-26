
#import "React/RCTViewManager.h"
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HMSHLSPlayerManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(url, NSString);
RCT_EXPORT_VIEW_PROPERTY(enableStats, BOOL);
RCT_EXPORT_VIEW_PROPERTY(enableControls, BOOL);
RCT_EXPORT_VIEW_PROPERTY(onDataReturned, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onHmsHlsPlaybackEvent, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onHmsHlsStatsEvent, RCTDirectEventBlock);

RCT_EXTERN_METHOD(play:(nonnull NSNumber *)node url:(nullable NSString *)url)
RCT_EXTERN_METHOD(stop:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(pause:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(resume:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(seekToLivePosition:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(seekForward:(nonnull NSNumber *)node seconds:(nonnull NSNumber *)seconds)
RCT_EXTERN_METHOD(seekBackward:(nonnull NSNumber *)node seconds:(nonnull NSNumber *)seconds)
RCT_EXTERN_METHOD(setVolume:(nonnull NSNumber *)node level:(nonnull NSNumber *)level)
RCT_EXTERN_METHOD(areClosedCaptionSupported:(nonnull NSNumber *)node requestId:(nonnull NSNumber *)requestId)
RCT_EXTERN_METHOD(isClosedCaptionEnabled:(nonnull NSNumber *)node requestId:(nonnull NSNumber *)requestId)
RCT_EXTERN_METHOD(enableClosedCaption:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(disableClosedCaption:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(getPlayerDurationDetails:(nonnull NSNumber *)node requestId:(nonnull NSNumber *)requestId)

@end
