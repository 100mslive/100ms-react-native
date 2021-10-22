
import HMSSDK

@objc(HmsManager)
class HmsManager: RCTEventEmitter{
    
    var hmsCollection: [String: HmsSDK]
    
    let ON_PREVIEW = "ON_PREVIEW"
    let ON_JOIN = "ON_JOIN"
    let ON_ROOM_UPDATE = "ON_ROOM_UPDATE"
    let ON_PEER_UPDATE = "ON_PEER_UPDATE"
    let ON_TRACK_UPDATE = "ON_TRACK_UPDATE"
    let ON_ROLE_CHANGE_REQUEST = "ON_ROLE_CHANGE_REQUEST"
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
        return [ON_JOIN, ON_PREVIEW, ON_ROOM_UPDATE, ON_PEER_UPDATE, ON_TRACK_UPDATE, ON_ERROR, ON_MESSAGE, ON_SPEAKER, RECONNECTING, RECONNECTED, ON_ROLE_CHANGE_REQUEST, ON_REMOVED_FROM_ROOM]
    }
    
    
    // MARK: - HMS SDK Actions
    
    @objc
    func build(_ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        DispatchQueue.main.async { [weak self] in
//            var id = UUID().uuidString
            var id = "12345"
            var hms = HmsSDK(delegate: self, uid: id)
            self?.hmsCollection[id] = hms
            
            resolve(id)
        }
    }
    
    @objc
    func preview(_ credentials: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        hms.preview(credentials)
    }
    
    @objc
    func join(_ credentials: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        hms.join(credentials)
    }
    
    @objc
    func setLocalMute(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.setLocalMute(data)
    }
    
    @objc
    func setLocalVideoMute(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.setLocalVideoMute(data)
    }
    
    @objc
    func switchCamera() {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.switchCamera()
    }
    
    @objc
    func leave() {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.leave()
    }
    
    @objc
    func sendBroadcastMessage(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.sendBroadcastMessage(data)
    }
    
    @objc
    func sendGroupMessage(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.sendGroupMessage(data)
    }
    
    @objc
    func sendDirectMessage(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.sendGroupMessage(data)
    }
    
    @objc
    func acceptRoleChange() {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.acceptRoleChange()
    }
    
    @objc
    func changeRole(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.changeRole(data)
    }
    
    @objc
    func changeTrackState(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.changeTrackState(data)
    }
    
    @objc
    func isMute(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.isMute(data, resolve, reject)
    }
    
    @objc
    func removePeer(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.removePeer(data)
    }
    
    
    @objc
    func endRoom(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.endRoom(data)
    }
    
    // MARK: - HMS SDK Delegate Callbacks
    func emitEvent(_ name: String, _ data: [String: Any]) {
        self.sendEvent(withName: name, body: data)
    }
    
    // MARK: Helper Functions
    
    @objc
    func muteAllPeersAudio(_ data: NSDictionary) {
        var hms = HmsHelper.getHms(credentials, hmsCollection)
        
        hms.muteAllPeersAudio(data)
    }
}
