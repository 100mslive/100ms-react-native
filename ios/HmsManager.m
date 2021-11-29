#import <React/RCTEventEmitter.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(HmsManager, RCTEventEmitter)

RCT_EXTERN_METHOD(join: (NSDictionary) credentials)
RCT_EXTERN_METHOD(preview: (NSDictionary) credentials)
RCT_EXTERN_METHOD(setLocalMute: (NSDictionary) isMute)
RCT_EXTERN_METHOD(setLocalVideoMute: (NSDictionary) isMute)
RCT_EXTERN_METHOD(sendBroadcastMessage: (NSDictionary) data)
RCT_EXTERN_METHOD(sendGroupMessage: (NSDictionary) data)
RCT_EXTERN_METHOD(sendDirectMessage: (NSDictionary) data)
RCT_EXTERN_METHOD(setPlaybackAllowed: (NSDictionary) data)
RCT_EXTERN_METHOD(removePeer: (NSDictionary) data)
RCT_EXTERN_METHOD(endRoom: (NSDictionary) data)
RCT_EXTERN_METHOD(changeRole: (NSDictionary) data)
RCT_EXTERN_METHOD(changeTrackState: (NSDictionary) data)
RCT_EXTERN_METHOD(changeTrackStateRoles: (NSDictionary) data)
RCT_EXTERN_METHOD(acceptRoleChange: (NSDictionary) data)
RCT_EXTERN_METHOD(isMute: (NSDictionary) data :(RCTPromiseResolveBlock) resolve :(RCTPromiseRejectBlock) reject)
RCT_EXTERN_METHOD(getRoom: (NSDictionary) data :(RCTPromiseResolveBlock) resolve :(RCTPromiseRejectBlock) reject)
RCT_EXTERN_METHOD(switchCamera: (NSDictionary) data)
RCT_EXTERN_METHOD(setVolume: (NSDictionary) data)
RCT_EXTERN_METHOD(build : (NSDictionary) data :(RCTPromiseResolveBlock) resolve :(RCTPromiseRejectBlock) reject)
RCT_EXTERN_METHOD(leave: (NSDictionary) data :(RCTPromiseResolveBlock) resolve :(RCTPromiseRejectBlock) reject)
RCT_EXTERN_METHOD(muteAllPeersAudio: (NSDictionary) mute)
RCT_EXTERN_METHOD(isPlaybackAllowed: (NSDictionary) data :(RCTPromiseResolveBlock) resolve :(RCTPromiseRejectBlock) reject)
@end
