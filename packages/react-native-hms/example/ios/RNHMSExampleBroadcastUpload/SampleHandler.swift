//
//  SampleHandler.swift
//  RNHMSExampleBroadcastUpload
//
//  Created by Yogesh Singh on 22/08/22.
//  Copyright © 2022 100ms. All rights reserved.
//

import ReplayKit
import HMSBroadcastExtensionSDK

class SampleHandler: RPBroadcastSampleHandler {

    let screenRenderer = HMSScreenRenderer(appGroup: "group.reactnativehms")

    override func broadcastStarted(withSetupInfo setupInfo: [String: NSObject]?) {
        // User has requested to start the broadcast. Setup info from the UI extension can be supplied but optional.
    }

    override func broadcastPaused() {
        // User has requested to pause the broadcast. Samples will stop being delivered.
    }

    override func broadcastResumed() {
        // User has requested to resume the broadcast. Samples delivery will resume.
    }

    override func broadcastFinished() {
        // User has requested to finish the broadcast.
        screenRenderer.invalidate()
    }

    override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
        switch sampleBufferType {
        case RPSampleBufferType.video:
            // Handle video sample buffer
            if let error = screenRenderer.process(sampleBuffer) {
                if error.code == .noActiveMeeting {
                    finishBroadcastWithError(NSError(domain: "ScreenShare",
                                                    code: error.code.rawValue,
                                                    userInfo: [NSLocalizedFailureReasonErrorKey: "You are not in a meeting."]))
                }
            }
            case RPSampleBufferType.audioApp:
            _ = self.screenRenderer.process(audioSampleBuffer: sampleBuffer)
        case RPSampleBufferType.audioMic:
            // Handle audio sample buffer for mic audio
            break
        @unknown default:
            // Handle other sample buffer types
            fatalError("Unknown type of sample buffer")
        }
    }
}
