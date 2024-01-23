//
//  HMSRNInteractivityCenter.swift
//  react-native-hms
//
//  Created by Jatin Nagar on 09/01/24.
//

import Foundation
import HMSSDK

class HMSRNInteractivityCenter {
    weak var hmssdk: HMSSDK?
    weak var hmsrnsdk: HMSRNSDK?

    init(hmssdk: HMSSDK, hmsrnsdk: HMSRNSDK?) {
        self.hmssdk = hmssdk
        self.hmsrnsdk = hmsrnsdk

        hmssdk.interactivityCenter.addPollUpdateListner { [weak self] updatedPoll, update in
            guard let self = self else { return }
            switch update {
            case .started:
                print("***** poll started")
//              self.showPollStartedToast()
            case .resultsUpdated:
                print("***** poll resultsUpdated")
//              self.updateResultsScreen()
            case .stopped:
                print("***** poll stopped")
//              self.loadResultsSummaryIfNeeded()
            @unknown default:
            break
            }
            guard let enabledEvents = self.hmsrnsdk?.eventsEnableStatus, enabledEvents[HMSConstants.ON_POLL_UPDATE] == true else {
                print("HMSConstants.ON_POLL_UPDATE event is not enabled")
                return
            }
            self.hmsrnsdk?.delegate?.emitEvent(
                HMSConstants.ON_POLL_UPDATE,
                ["update": update.rawValue, "updatedPoll": HMSInteractivityDecoder.getHMSPoll(updatedPoll)]
            )
      }
    }

    func quickStartPoll(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        let pollBuilder = HMSInteractivityHelper.getPollBuilderFromDict(data, sdkRoles: hmssdk?.roles)

        self.hmssdk?.interactivityCenter.quickStartPoll(with: pollBuilder) { success, error in
            if let nonnilError = error {
                reject?("6004", nonnilError.localizedDescription, nil)
                return
            }
            resolve?(nil)
        }
    }
}
