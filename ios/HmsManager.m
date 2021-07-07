#import <React/RCTEventEmitter.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HmsManager, RCTEventEmitter)

RCT_EXTERN_METHOD(join: (NSDictionary) credentials)
RCT_EXTERN_METHOD(getTrackIds: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(setLocalMute: (BOOL) isMute)
RCT_EXTERN_METHOD(setLocalVideoMute: (BOOL) isMute)
RCT_EXTERN_METHOD(switchCamera)
RCT_EXTERN_METHOD(build)

@end
