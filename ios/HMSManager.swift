import HMSSDK

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
        return [ON_JOIN, ON_PREVIEW, ON_ROOM_UPDATE, ON_PEER_UPDATE, ON_TRACK_UPDATE, ON_ERROR, ON_MESSAGE, ON_SPEAKER, RECONNECTING, RECONNECTED, ON_ROLE_CHANGE_REQUEST, ON_CHANGE_TRACK_STATE_REQUEST, ON_REMOVED_FROM_ROOM, ON_RTC_STATS, ON_LOCAL_AUDIO_STATS, ON_LOCAL_VIDEO_STATS, ON_REMOTE_AUDIO_STATS, ON_REMOTE_VIDEO_STATS, ON_AUDIO_DEVICE_CHANGED]
    }

    // MARK: - HMS SDK Actions

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
    func cancelPreview(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.cancelPreview()
    }

    @objc
    func join(_ credentials: NSDictionary) {
        let hms = HMSHelper.getHms(credentials, hmsCollection)
        hms?.join(credentials)
    }

    @objc
    func setLocalMute(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setLocalMute(data)
    }

    @objc
    func setLocalVideoMute(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setLocalVideoMute(data)
    }

    @objc
    func switchCamera(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.switchCamera()
    }

    @objc
    func leave(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.leave(resolve, reject)
    }

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

    @objc
    func acceptRoleChange(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.acceptRoleChange(resolve, reject)
    }

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
    func removePeer(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.removePeer(data, resolve, reject)
    }

    @objc
    func endRoom(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.endRoom(data, resolve, reject)
    }

    @objc
    func setPlaybackAllowed(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setPlaybackAllowed(data)
    }

    @objc
    func isPlaybackAllowed(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.isPlaybackAllowed(data, resolve, reject)
    }

    @objc
    func setPlaybackForAllAudio(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setPlaybackForAllAudio(data)
    }

    @objc
    func remoteMuteAllAudio(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.remoteMuteAllAudio(resolve, reject)
    }

    @objc
    func changeMetadata(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeMetadata(data, resolve, reject)
    }

    @objc
    func setVolume(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setVolume(data)
    }

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

    @objc
    func changeName(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.changeName(data, resolve, reject)
    }

    @objc
    func destroy(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let id = data.value(forKey: "id") as? String ?? "12345"
        hmsCollection.removeValue(forKey: id)
        resolve?(["success": id + " removed"])
    }

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

    @objc
    func playAudioShare(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.playAudioShare(data, resolve, reject)
    }

    @objc
    func setAudioShareVolume(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setAudioShareVolume(data)
    }

    @objc
    func stopAudioShare(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.stopAudioShare(data)
    }

    @objc
    func resumeAudioShare(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.resumeAudioShare(data)
    }

    @objc
    func pauseAudioShare(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.pauseAudioShare(data)
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

    @objc
    func setSessionMetaData(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.setSessionMetaData(data, resolve, reject)
    }

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

    @objc
    func restrictData(_ data: NSDictionary) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.restrictData(data)
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
    func getSessionMetaData(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HMSHelper.getHms(data, hmsCollection)

        hms?.getSessionMetaData(resolve, reject)
    }

    // MARK: - HMS SDK Delegate Callbacks
    func emitEvent(_ name: String, _ data: [String: Any]) {
        self.sendEvent(withName: name, body: data)
    }
}
