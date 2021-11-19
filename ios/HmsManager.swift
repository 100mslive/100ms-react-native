
import HMSSDK

@objc(HmsManager)
class HmsManager: RCTEventEmitter{
    
    var hmsCollection: [String: HmsSDK] = [:]
    
    let ON_PREVIEW = "ON_PREVIEW"
    let ON_JOIN = "ON_JOIN"
    let ON_ROOM_UPDATE = "ON_ROOM_UPDATE"
    let ON_PEER_UPDATE = "ON_PEER_UPDATE"
    let ON_TRACK_UPDATE = "ON_TRACK_UPDATE"
    let ON_ROLE_CHANGE_REQUEST = "ON_ROLE_CHANGE_REQUEST"
    let ON_CHANGE_TRACK_STATE_REQUEST = "ON_CHANGE_TRACK_STATE_REQUEST"
    let ON_REMOVED_FROM_ROOM = "ON_REMOVED_FROM_ROOM"
    let ON_ERROR = "ON_ERROR"
    let ON_MESSAGE = "ON_MESSAGE"
    let ON_SPEAKER = "ON_SPEAKER"
    let RECONNECTING = "RECONNECTING"
    let RECONNECTED = "RECONNECTED"
    
    // MARK: - Setup
    
    override init() {
        super.init()
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        true
    }
    
    override func supportedEvents() -> [String]! {
        return [ON_JOIN, ON_PREVIEW, ON_ROOM_UPDATE, ON_PEER_UPDATE, ON_TRACK_UPDATE, ON_ERROR, ON_MESSAGE, ON_SPEAKER, RECONNECTING, RECONNECTED, ON_ROLE_CHANGE_REQUEST, ON_CHANGE_TRACK_STATE_REQUEST, ON_REMOVED_FROM_ROOM]
    }
    
    
    // MARK: - HMS SDK Actions
    
    @objc
    func build(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        DispatchQueue.main.async { [weak self] in
            let hasItem = self?.hmsCollection.index(forKey: "12345")
            
            if let _ = hasItem {
                let id = UUID().uuidString
                let hms = HmsSDK(delegate: self, uid: id)
                self?.hmsCollection[id] = hms
                
                resolve?(id)
            } else {
                let id = "12345"
                let hms = HmsSDK(delegate: self, uid: id)
                self?.hmsCollection[id] = hms
                
                resolve?(id)
            }
        }
    }
    
    @objc
    func preview(_ credentials: NSDictionary) {
        let hms = HmsHelper.getHms(credentials, hmsCollection)
        hms?.preview(credentials)
    }
    
    @objc
    func join(_ credentials: NSDictionary) {
        let hms = HmsHelper.getHms(credentials, hmsCollection)
        hms?.join(credentials)
    }
    
    @objc
    func setLocalMute(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.setLocalMute(data)
    }
    
    @objc
    func setLocalVideoMute(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.setLocalVideoMute(data)
    }
    
    @objc
    func switchCamera(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.switchCamera()
    }
    
    @objc
    func leave(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.leave(resolve, reject)
    }
    
    @objc
    func sendBroadcastMessage(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.sendBroadcastMessage(data)
    }
    
    @objc
    func sendGroupMessage(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.sendGroupMessage(data)
    }
    
    @objc
    func sendDirectMessage(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.sendDirectMessage(data)
    }
    
    @objc
    func acceptRoleChange(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.acceptRoleChange()
    }
    
    @objc
    func changeRole(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.changeRole(data)
    }
    
    @objc
    func changeTrackState(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.changeTrackState(data)
    }
    
    @objc
    func changeTrackStateRoles(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.changeTrackStateRoles(data)
    }
    
    @objc
    func isMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        if let hmsInstance = hms {
            hmsInstance.isMute(data, resolve, reject)
        } else {
            reject?(nil, "NO_INSTANCE", nil)
            return
        } 
    }
    
    
    @objc
    func removePeer(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.removePeer(data)
    }
    
    
    @objc
    func endRoom(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.endRoom(data)
    }

    @objc
    func setPlaybackAllowed(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.setPlaybackAllowed(data)
    }
    
    @objc
    func isPlaybackAllowed(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.isPlaybackAllowed(data, resolve, reject)
    }
    
    @objc
    func getRoom(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.getRoom(data, resolve, reject)
    }
    
    // MARK: - HMS SDK Delegate Callbacks
    func emitEvent(_ name: String, _ data: [String: Any]) {
        self.sendEvent(withName: name, body: data)
    }
    
    // MARK: Helper Functions
    
    @objc
    func muteAllPeersAudio(_ data: NSDictionary) {
        let hms = HmsHelper.getHms(data, hmsCollection)
        
        hms?.muteAllPeersAudio(data)
    }
}
