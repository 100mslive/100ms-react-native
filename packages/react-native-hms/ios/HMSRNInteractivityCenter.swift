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

        self.hmssdk?.interactivityCenter.quickStartPoll(with: pollBuilder) { _, error in
            if let nonnilError = error {
                reject?("6004", nonnilError.localizedDescription, nil)
                return
            }
            resolve?(nil)
        }
    }

    func add(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let pollId = data["pollId"] as? String,
              let poll = self.hmssdk?.interactivityCenter.polls.first(where: {poll in poll.pollID == pollId}) else {
            reject?("6004", "Unable to find HMSPoll with given pollId", nil)
            return
        }
        guard let pollQuestionIndex = data["pollQuestionIndex"] as? Int,
              let pollQuestion = poll.questions?.first(where: {question in question.index == pollQuestionIndex}) else {
            reject?("6004", "Unable to find HMSPollQuestion in poll with given question index", nil)
            return
        }
        guard let responses = data["responses"] as? NSDictionary else {
            reject?("6004", "responses field is required", nil)
            return
        }

        let pollResponseBuilder = HMSInteractivityHelper.getPollResponseBuilder(responses, poll: poll, pollQuestion: pollQuestion)

        self.hmssdk?.interactivityCenter.add(response: pollResponseBuilder) { pollQuestionResponseResult, error in
            if let nonnilError = error {
                reject?("6004", nonnilError.localizedDescription, nil)
                return
            }
            if let pollQuestionResponseResult = pollQuestionResponseResult {
                resolve?(HMSInteractivityDecoder.getHMSPollQuestionResponseResults(pollQuestionResponseResult))
            } else {
                resolve?(nil)
            }
        }
    }

    func stop(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let pollId = data["pollId"] as? String,
              let poll = self.hmssdk?.interactivityCenter.polls.first(where: {poll in poll.pollID == pollId}) else {
            reject?("6004", "Unable to find HMSPoll with given pollId", nil)
            return
        }
        self.hmssdk?.interactivityCenter.stop(poll: poll, completion: {success, error in
            if let nonnilError = error {
                reject?("6004", nonnilError.localizedDescription, nil)
                return
            }
            resolve?(success)
        })
    }

    func fetchLeaderboard(_ data: NSDictionary, _ resolve: RCTPromiseResolveBlock?, _ reject: RCTPromiseRejectBlock?) {
        guard let pollId = data["pollId"] as? String,
              let poll = self.hmssdk?.interactivityCenter.polls.first(where: {poll in poll.pollID == pollId}) else {
            reject?("6004", "Unable to find HMSPoll with given pollId", nil)
            return
        }

        guard let count = data["count"] as? Int,
            let startIndex = data["startIndex"] as? Int
        else {
            reject?("6004", "Unable to find required parameters", nil)
            return
        }

        let includeCurrentPeer = data["includeCurrentPeer"] as? Bool ?? false

        self.hmssdk?.interactivityCenter.fetchLeaderboard(for: poll, offset: startIndex, count: count, includeCurrentPeer: includeCurrentPeer) { response, error in

            if let nonnilError = error {
                reject?("6004", nonnilError.localizedDescription, nil)
                return
            }

            if let response = response {
                resolve?(HMSInteractivityDecoder.getLeaderboardResponse(response))
            } else {
                reject?("6004", "Could not fetch leaderboard response", nil)
            }
        }
    }
}
