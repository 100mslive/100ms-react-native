import HMSSDK
import AVKit.AVRoutePickerView

@objc(HMSManager)
class HMSManager: RCTEventEmitter {

    var hmsCollection = [String: HMSRNSDK]()

    let ON_PREVIEW = "ON_PREVIEW"
    let ON_JOIN = "ON_JOIN"
    let ON_ROOM_UPDATE = "ON_ROOM_UPDATE"
    let ON_PEER_UPDATE = "3"
    let ON_TRACK_UPDATE = "ON_TRACK_UPDATE"
    let ON_ROLE_CHANGE_REQUEST = "ON_ROLE_CHANGE_REQUEST"
    let ON_CHANGE_TRACK_STATE_REQUEST = "ON_CHANGE_TRACK_STATE_REQUEST"
    let ON_REMOVED_FROM_ROOM = "ON_REMOVED_FROM_ROOM"
    let ON_ERROR = "ON_ERROR"
    let ON_MESSAGE = "ON_MESSAGE"
    let ON_SPEAKER = "ON_SPEAKER"
    let RECONNECTING = "RECONNECTING"
    let RECONNECTED = "RECONNECTED"
    let ON_RTC_STATS = "ON_RTC_STATS"
    let ON_LOCAL_AUDIO_STATS = "ON_LOCAL_AUDIO_STATS"
    let ON_LOCAL_VIDEO_STATS = "ON_LOCAL_VIDEO_STATS"
    let ON_REMOTE_AUDIO_STATS = "ON_REMOTE_AUDIO_STATS"
    let ON_REMOTE_VIDEO_STATS = "ON_REMOTE_VIDEO_STATS"
    let ON_AUDIO_DEVICE_CHANGED = "ON_AUDIO_DEVICE_CHANGED"

    // MARK: - Setup

    override init() {
        super.init()
    }

    override class func requiresMainQueueSetup() -> Bool {
        true
    }

    override func supportedEvents() -> [String]! {
        return [ON_JOIN, ON_PREVIEW, ON_ROOM_UPDATE, ON_PEER_UPDATE, ON_TRACK_UPDATE, ON_ERROR, ON_MESSAGE, ON_SPEAKER, RECONNECTING, RECONNECTED, ON_ROLE_CHANGE_REQUEST, ON_CHANGE_TRACK_STATE_REQUEST, ON_REMOVED_FROM_ROOM, ON_RTC_STATS, ON_LOCAL_AUDIO_STATS, ON_LOCAL_VIDEO_STATS, ON_REMOTE_AUDIO_STATS, ON_REMOTE_VIDEO_STATS, ON_AUDIO_DEVICE_CHANGED, HMSConstants.ON_SESSION_STORE_AVAILABLE, HMSConstants.ON_SESSION_STORE_CHANGED, HMSConstants.ON_PEER_LIST_UPDATED]
    }

    // MARK: - HMS SDK Delegate Callbacks
    func emitEvent(_ name: String, _ data: [String: Any]) {
        self.sendEvent(withName: name, body: data)
    }

    // MARK: - Setup HMSSDK

    @objc
    func build(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        DispatchQueue.main.async { [weak self] in
            let hasItem = self?.hmsCollection.index(forKey: "12345")

            if let _ = hasItem {
                let id = UUID().uuidString
                let hms = HMSRNSDK(data: data, delegate: self, uid: id)
                self?.hmsCollection[id] = hms

                resolve?(id)
            } else {
                let id = "12345"
                let hms = HMSRNSDK(data: data, delegate: self, uid: id)
                self?.hmsCollection[id] = hms

                resolve?(id)
            }
        }
    }

    @objc
    func destroy(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let id = data.value(forKey: "id") as? String ?? "12345"
        hmsCollection.removeValue(forKey: id)
        resolve?(["success": id + " removed"])
    }

    // MARK: - Prebuilt

    @objc
    func getRoomLayout(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)
        hms?.getRoomLayout(data, resolve, reject)
    }

    // MARK: - Preview

    @objc
    func preview(_ credentials: NSDictionary) {
        let hms = HMSHelper.getHms(credentials, hmsCollection)
        hms?.preview(credentials)
    }

    @objc
    func previewForRole(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.previewForRole(data, resolve, reject)
    }

    @objc
    func cancelPreview(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.cancelPreview(resolve, reject)
    }

    // MARK: - Join Room

    @objc
    func join(_ credentials: NSDictionary) {
        let hms = HMSHelper.getHms(credentials, hmsCollection)
        hms?.join(credentials)
    }

    // MARK: - Leave Room Actions

    @objc
    func leave(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.leave(resolve, reject)
    }

    // MARK: - Audio & Video Actions

    @objc
    func setLocalMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setLocalMute(data, resolve, reject)
    }

    @objc
    func setLocalVideoMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setLocalVideoMute(data, resolve, reject)
    }

    @objc
    func switchCamera(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.switchCamera()
    }

    @objc
    func isMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)
        if let hmsInstance = hms {
            hmsInstance.isMute(data, resolve, reject)
        } else {
            reject?(nil, "NO_INSTANCE", nil)
            return
        }
    }

    @objc
    func setPlaybackAllowed(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setPlaybackAllowed(data, resolve, reject)
    }

    @objc
    func isPlaybackAllowed(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.isPlaybackAllowed(data, resolve, reject)
    }

    @objc
    func setPlaybackForAllAudio(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setPlaybackForAllAudio(data, resolve, reject)
    }

    @objc
    func remoteMuteAllAudio(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.remoteMuteAllAudio(resolve, reject)
    }

    @objc
    func setVolume(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setVolume(data, resolve, reject)
    }

    @objc
    func switchAudioOutputUsingIOSUI(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        DispatchQueue.main.async {
            // Creating RoutePickerView
            // Note:- We will trigger tap event on it without rendering this view in UI.
            let routePickerView = AVRoutePickerView()

            // Iterating over subviews of AVRoutePickerView
            for view in routePickerView.subviews {
                // Checking if the current subview is UIButton
                if let button = view as? UIButton {
                    // Trigger tap event on the button
                    // so, that Picker View is shown
                    button.sendActions(for: .touchUpInside)
                    break
                }
            }
            resolve?(true)
        }
    }

    // MARK: - Messaging

    @objc
    func sendBroadcastMessage(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.sendBroadcastMessage(data, resolve, reject)
    }

    @objc
    func sendGroupMessage(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.sendGroupMessage(data, resolve, reject)
    }

    @objc
    func sendDirectMessage(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.sendDirectMessage(data, resolve, reject)
    }

    // MARK: - Change Role

    @available(*, deprecated, message: "Use changeRoleOfPeer function")
    @objc
    func changeRole(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeRole(data, resolve, reject)
    }

    @objc
    func changeRoleOfPeer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeRole(data, resolve, reject)
    }

    @objc
    func changeRoleOfPeersWithRoles(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeRolesOfAllPeers(data, resolve, reject)
    }

    @objc
    func acceptRoleChange(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.acceptRoleChange(resolve, reject)
    }

    // MARK: - Role Based Actions

    @objc
    func changeTrackState(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeTrackState(data, resolve, reject)
    }

    @objc
    func changeTrackStateForRoles(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeTrackStateForRoles(data, resolve, reject)
    }

    @objc
    func removePeer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.removePeer(data, resolve, reject)
    }

    @objc
    func endRoom(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.endRoom(data, resolve, reject)
    }

    // MARK: - Peer Actions

    @objc
    func changeMetadata(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeMetadata(data, resolve, reject)
    }

    @objc
    func changeName(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeName(data, resolve, reject)
    }

    @objc
    func raiseLocalPeerHand(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.raiseLocalPeerHand(resolve, reject)
    }

    @objc
    func lowerLocalPeerHand(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.lowerLocalPeerHand(resolve, reject)
    }

    @objc
    func lowerRemotePeerHand(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.lowerRemotePeerHand(data, resolve, reject)
    }

    // MARK: - RTMP Streaming & Recording

    @objc
    func startRTMPOrRecording(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.startRTMPOrRecording(data, resolve, reject)
    }

    @objc
    func stopRtmpAndRecording(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.stopRtmpAndRecording(resolve, reject)
    }

    // MARK: - HLS Streaming & Recording

    @objc
    func startHLSStreaming(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.startHLSStreaming(data, resolve, reject)
    }

    @objc
    func stopHLSStreaming(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.stopHLSStreaming(resolve, reject)
    }

    // MARK: - Screen Share

    @objc
    func startScreenshare(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.startScreenshare(resolve, reject)
    }

    @objc
    func stopScreenshare(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.stopScreenshare(resolve, reject)
    }

    @objc
    func isScreenShared(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.isScreenShared(resolve, reject)
    }

    // MARK: - Audio Playback

    @objc
    func playAudioShare(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.playAudioShare(data, resolve, reject)
    }

    @objc
    func setAudioShareVolume(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setAudioShareVolume(data, resolve, reject)
    }

    @objc
    func stopAudioShare(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.stopAudioShare(data, resolve, reject)
    }

    @objc
    func resumeAudioShare(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.resumeAudioShare(data, resolve, reject)
    }

    @objc
    func pauseAudioShare(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.pauseAudioShare(data, resolve, reject)
    }

    @objc
    func audioShareIsPlaying(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.audioShareIsPlaying(data, resolve, reject)
    }

    @objc
    func audioShareCurrentTime(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.audioShareCurrentTime(data, resolve, reject)
    }

    @objc
    func audioShareDuration(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.audioShareDuration(data, resolve, reject)
    }

    // MARK: - Network Quality Updates

    @objc
    func enableNetworkQualityUpdates(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.enableNetworkQualityUpdates()
    }

    @objc
    func disableNetworkQualityUpdates(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.disableNetworkQualityUpdates()
    }

    // MARK: - Peer & Room Property Getter Functions

    @objc
    func getPeerProperty(_ data: NSDictionary) -> [AnyHashable: Any]? {
        let hms = HMSHelper.getHms(data, hmsCollection)

        return hms?.getPeerProperty(data)
    }

    @objc
    func getRoomProperty(_ data: NSDictionary) -> [AnyHashable: Any]? {
        let hms = HMSHelper.getHms(data, hmsCollection)

        return hms?.getRoomProperty(data)
    }

    // MARK: - Enable/Disable HMS Events Emitting to JS

    @objc
    func enableEvent(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.enableEvent(data, resolve, reject)
    }

    @objc
    func disableEvent(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.disableEvent(data, resolve, reject)
    }

    // MARK: - Restrict sending whole HMSRole object

    @objc
    func restrictData(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.restrictData(data, resolve, reject)
    }

    // MARK: - Room Code Auth Token API

    @objc
    func getAuthTokenByRoomCode(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getAuthTokenByRoomCode(data, resolve, reject)
    }

    // MARK: - HMS SDK Get APIs
    @objc
    func getRoom(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getRoom(resolve)
    }

    @objc
    func getLocalPeer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getLocalPeer(resolve)
    }

    @objc
    func getRemotePeers(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getRemotePeers(resolve)
    }

    @objc
    func getRoles(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getRoles(resolve)
    }

    @objc
    func getRemoteVideoTrackFromTrackId(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getRemoteVideoTrackFromTrackId(data, resolve, reject)
    }

    @objc
    func getRemoteAudioTrackFromTrackId(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getRemoteAudioTrackFromTrackId(data, resolve, reject)
    }

    // MARK: - Simulcast

    @objc
    func getVideoTrackLayerDefinition(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getVideoTrackLayerDefinition(data, resolve, reject)
    }

    @objc
    func getVideoTrackLayer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getVideoTrackLayer(data, resolve, reject)
    }

    @objc
    func setVideoTrackLayer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setVideoTrackLayer(data, resolve, reject)
    }

    // MARK: - Advanced Camera Controls

    @objc
    func captureImageAtMaxSupportedResolution(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.captureImageAtMaxSupportedResolution(data, resolve, reject)
    }

    // MARK: - Session Store

    @objc
    func getSessionMetadataForKey(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getSessionMetadataForKey(data, resolve, reject)
    }

    @objc
    func setSessionMetadataForKey(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setSessionMetadataForKey(data, resolve, reject)
    }

    @objc
    func addKeyChangeListener(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.addKeyChangeListener(data, resolve, reject)
    }

    @objc
    func removeKeyChangeListener(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.removeKeyChangeListener(data, resolve, reject)
    }

    // MARK: - Peer List Iterator

    @objc
    func getPeerListIterator(_ data: NSDictionary) -> [AnyHashable: Any]? {
        let hms = HMSHelper.getHms(data, hmsCollection)

        return hms?.getPeerListIterator(data)
    }

    @objc
    func peerListIteratorHasNext(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.peerListIteratorHasNext(data, resolve, reject)
    }

    @objc
    func peerListIteratorNext(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.peerListIteratorNext(data, resolve, reject)
    }

    // MARK: - Interactivity Center - Polls/Quiz

    @objc
    func quickStartPoll(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let rnsdk = HMSHelper.getHms(data, hmsCollection), let interactivity = rnsdk.interactivity else {
            reject?("6004", "HMSRNSDK instance not found!", nil)
            return
        }

        interactivity.quickStartPoll(data, resolve, reject)
    }
}
