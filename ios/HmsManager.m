#import <React/RCTEventEmitter.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HmsManager, RCTEventEmitter)

// RCT_EXPORT_VIEW_PROPERTY(color, NSString);
// RCT_EXPORT_VIEW_PROPERTY(isMute, BOOL);
// RCT_EXPORT_VIEW_PROPERTY(switchCamera, BOOL);
// RCT_EXPORT_VIEW_PROPERTY(layout, NSDictionary);
// RCT_EXPORT_VIEW_PROPERTY(muteVideo, BOOL);
// RCT_EXPORT_VIEW_PROPERTY(credentials, NSDictionary)

RCT_EXTERN_METHOD(join: (NSDictionary) credentials)
RCT_EXTERN_METHOD(getTrackIds: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(setLocalMute: (BOOL) isMute)
RCT_EXTERN_METHOD(setLocalVideoMute: (BOOL) credentials)
RCT_EXTERN_METHOD(switchCamera)

@end
