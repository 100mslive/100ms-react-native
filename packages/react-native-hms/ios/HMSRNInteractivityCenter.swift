//
//  HMSRNInteractivityCenter.swift
//  react-native-hms
//
//  Created by Jatin Nagar on 09/01/24.
//

import Foundation
import HMSSDK

class HMSRNInteractivityCenter {
    var center: HMSInteractivityCenter?

    init(center: HMSInteractivityCenter?) {
        self.center = center
        center?.addPollUpdateListner { [weak self] updatedPoll, update in
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
      }
    }

    func quickStartPoll(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {

//        guard 
            let pollBuilder = HMSInteractivityHelper.getPollBuilder(data)
//        else {
//            reject?("6004", "", nil)
//            return
//        }

        self.center?.quickStartPoll(with: pollBuilder) { success, error in
            if let nonnilError = error {
                reject?("6004", nonnilError.localizedDescription, nil)
                return
            }
            resolve?(success)
        }
    }
}
