//
//  HMSInteractivityHelper.swift
//  react-native-hms
//
//  Created by Jatin Nagar on 09/01/24.
//

import Foundation
import HMSSDK

class HMSInteractivityHelper {
    static func getPollBuilder(_ data: NSDictionary) -> HMSPollBuilder {
        let pollBuilder = HMSPollBuilder().addSingleChoiceQuestion(with: "How is the weather today?", options: ["hot", "warm", "cold"])

        return pollBuilder
    }
}
