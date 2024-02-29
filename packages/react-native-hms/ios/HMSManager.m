#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE (HMSManager, RCTEventEmitter)

RCT_EXTERN_METHOD(join : (NSDictionary)credentials)
RCT_EXTERN_METHOD(preview : (NSDictionary)credentials)
RCT_EXTERN_METHOD(previewForRole
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(cancelPreview : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setLocalMute
                  : (NSDictionary)isMute
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setLocalVideoMute
                  : (NSDictionary)isMute
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendBroadcastMessage
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendGroupMessage
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendDirectMessage
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setPlaybackAllowed
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(removePeer
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(endRoom
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(changeTrackState
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(changeTrackStateForRoles
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isMute
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getRoom
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(switchCamera : (NSDictionary)data)
RCT_EXTERN_METHOD(setVolume
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(build
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(leave
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setPlaybackForAllAudio
                  : (NSDictionary)mute
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(remoteMuteAllAudio
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isPlaybackAllowed
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(changeMetadata
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startRTMPOrRecording
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopRtmpAndRecording
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startHLSStreaming
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopHLSStreaming
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(sendHLSTimedMetadata
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(changeName
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(raiseLocalPeerHand
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(lowerLocalPeerHand
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(lowerRemotePeerHand
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(destroy
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(startScreenshare
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopScreenshare
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isScreenShared
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(switchAudioOutputUsingIOSUI
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(playAudioShare
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setAudioShareVolume
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stopAudioShare
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(resumeAudioShare
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(pauseAudioShare
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(audioShareIsPlaying
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(audioShareCurrentTime
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(audioShareDuration
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getLocalPeer
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getRemotePeers
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getRoles
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(enableNetworkQualityUpdates : (NSDictionary)data)
RCT_EXTERN_METHOD(disableNetworkQualityUpdates : (NSDictionary)data)
RCT_EXTERN_METHOD(changeRoleOfPeer
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(changeRoleOfPeersWithRoles
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getPeerProperty : (NSDictionary)data)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getRoomProperty : (NSDictionary)data)

RCT_EXTERN_METHOD(enableEvent
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(disableEvent
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(restrictData
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getAuthTokenByRoomCode
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getRemoteVideoTrackFromTrackId
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getRemoteAudioTrackFromTrackId
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getVideoTrackLayerDefinition
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getVideoTrackLayer
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setVideoTrackLayer
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

#pragma mark - Advanced Camera Controls

RCT_EXTERN_METHOD(captureImageAtMaxSupportedResolution
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

#pragma mark - Session Store

RCT_EXTERN_METHOD(getSessionMetadataForKey
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setSessionMetadataForKey
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(addKeyChangeListener
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(removeKeyChangeListener
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

#pragma mark - Prebuilt

RCT_EXTERN_METHOD(getRoomLayout
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

#pragma mark - Role Change

RCT_EXTERN_METHOD(changeRole
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(acceptRoleChange
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

#pragma mark - Peer List Iterator

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getPeerListIterator : (NSDictionary)data)

RCT_EXTERN_METHOD(peerListIteratorHasNext
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(peerListIteratorNext
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

#pragma mark - Interactivity Center - Polls/Quiz

RCT_EXTERN_METHOD(quickStartPoll
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(addResponseOnPollQuestion
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopPoll
                  : (NSDictionary)data
                  : (RCTPromiseResolveBlock)resolve
                  : (RCTPromiseRejectBlock)reject)

@end
