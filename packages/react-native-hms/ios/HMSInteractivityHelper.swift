//
//  HMSInteractivityHelper.swift
//  react-native-hms
//
//  Created by Jatin Nagar on 09/01/24.
//

import Foundation
import HMSSDK

class HMSInteractivityHelper {
    static func getPollBuilderFromDict(_ data: NSDictionary, sdkRoles: [HMSRole]?) -> HMSPollBuilder {
        let pollBuilder = HMSPollBuilder()

        if let title = data["title"] as? String {
            _ = pollBuilder.withTitle(title)
        }

        if let anonymous = data["anonymous"] as? Bool {
            _ = pollBuilder.withAnonymous(anonymous)
        }

        if let duration = data["duration"] as? Int {
            _ = pollBuilder.withDuration(duration)
        }

        if let category = data["type"] as? Int {
            if let pollCategory = HMSPollCategory.init(rawValue: category) {
                _ = pollBuilder.withCategory(pollCategory)
            } else {
                print("unable to create `HMSPollCategory` instance from given `type` value: \(category)")
            }
        }

        if let pollID = data["pollId"] as? String {
            _ = pollBuilder.withPollID(pollID)
        }

        if let rolesStrThatCanViewResponses = data["rolesThatCanViewResponses"] as? [String] {
            let roles = HMSHelper.getRolesFromRoleNames(rolesStrThatCanViewResponses, roles: sdkRoles)
            _ = pollBuilder.withRolesThatCanViewResponses(roles)
        }

        if let rolesStrThatCanVote = data["rolesThatCanVote"] as? [String] {
            let roles = HMSHelper.getRolesFromRoleNames(rolesStrThatCanVote, roles: sdkRoles)
            _ = pollBuilder.withRolesThatCanVote(roles)
        }

        if let userTrackingMode = data["mode"] as? Int {
            if let pollUserTrackingMode = HMSPollUserTrackingMode.init(rawValue: userTrackingMode) {
                _ = pollBuilder.withUserTrackingMode(pollUserTrackingMode)
            } else {
                print("unable to create `HMSPollUserTrackingMode` instance from given `userTrackingMode` value: \(userTrackingMode)")
            }
        }

        if let questions = data["questions"] as? [NSDictionary] {
            addQuestionsToPollBuilder(questions: questions, pollBuilder: pollBuilder)
        }

        return pollBuilder
    }

    static func addQuestionsToPollBuilder(questions: [NSDictionary], pollBuilder: HMSPollBuilder) {
        questions.forEach { question in
            let pollQuestionBuilder = self.getPollQuestionBuilderFromDict(question)
            _ = pollBuilder.addQuestion(with: pollQuestionBuilder)
        }
    }

    static func getPollQuestionBuilderFromDict(_ data: NSDictionary) -> HMSPollQuestionBuilder {
        let pollQuestionBuilder = HMSPollQuestionBuilder()

        // // Commented because as of now, not passing any field from JS to use `withAnswerHidden` method of `HMSPollQuestionBuilder`
        // if let answerHidden = data["answerHidden"] as? Bool {
        //     _ = pollQuestionBuilder.withAnswerHidden(answerHidden: answerHidden)
        // }

        if let canBeSkipped = data["skippable"] as? Bool {
            _ = pollQuestionBuilder.withCanBeSkipped(canBeSkipped)
        }

        if let once = data["once"] as? Bool {
            _ = pollQuestionBuilder.withCanChangeResponse(canChangeResponse: !once)
        }

        if let duration = data["duration"] as? Int {
            _ = pollQuestionBuilder.withDuration(duration)
        }

        if let index = data["index"] as? Int {
            _ = pollQuestionBuilder.withIndex(index)
        }

        if let maxLength = data["answerMaxLen"] as? Int {
            _ = pollQuestionBuilder.withMaxLength(maxLength: maxLength)
        }

        if let minLength = data["answerMinLen"] as? Int {
            _ = pollQuestionBuilder.withMinLength(minLength: minLength)
        }

        if let title = data["text"] as? String {
            _ = pollQuestionBuilder.withTitle(title)
        }

        if let type = data["type"] as? Int {
            if let questionType = HMSPollQuestionType.init(rawValue: type) {
                _ = pollQuestionBuilder.withType(questionType)
            } else {
                print("unable to create `HMSPollQuestionType` instance from given `type` value: \(type)")
            }
        }

        if let weight = data["weight"] as? Int {
            _ = pollQuestionBuilder.withWeight(weight: weight)
        }

        if let options = data["options"] as? [NSDictionary] {
            addOptionsToPollQuestionBuilder(options: options, pollQuestionBuilder: pollQuestionBuilder)
        }

        return pollQuestionBuilder
    }

    static func addOptionsToPollQuestionBuilder(options: [NSDictionary], pollQuestionBuilder: HMSPollQuestionBuilder) {
        options.forEach { option in
            guard let optionTitle = option["text"] as? String else {
                print("\(#function) option title field not available!")
                return
            }

            if let isCorrect = option["isCorrectAnswer"] as? Bool {
                _ = pollQuestionBuilder.addQuizOption(with: optionTitle, isCorrect: isCorrect)
            } else {
                _ = pollQuestionBuilder.addOption(with: optionTitle)
            }
        }
    }
}
