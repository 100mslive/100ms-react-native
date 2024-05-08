//
//  HMSInteractivityDecoder.swift
//  react-native-hms
//
//  Created by Jatin Nagar on 18/01/24.
//

import Foundation
import HMSSDK

class HMSInteractivityDecoder {
    static func getHMSPoll(_ poll: HMSPoll) -> [String: Any] {
        var dict: [String: Any] = [
            "anonymous": poll.anonymous,
            "type": poll.category.rawValue,
            "duration": poll.duration,
            "pollId": poll.pollID,
            "rolesThatCanViewResponses": HMSDecoder.getAllRoles(poll.rolesThatCanViewResponses),
            "rolesThatCanVote": HMSDecoder.getAllRoles(poll.rolesThatCanVote),
            "state": poll.state.rawValue,
            "title": poll.title
        ]
        if let createdBy = poll.createdBy {
            dict["createdBy"] = HMSDecoder.getHmsPeerSubset(createdBy)
        }
        if let mode = poll.mode {
            dict["mode"] = mode.rawValue
        }
        if let questionCount = poll.questionCount {
            dict["questionCount"] = questionCount
        }
        if let questions = poll.questions {
            dict["questions"] = getHMSPollQuestions(questions)
        }
        if let result = poll.result {
            dict["result"] = getHMSPollResult(result)
        }
        if let startedAt = poll.startedAt {
            dict["startedAt"] = startedAt.timeIntervalSince1970 * 1000
        }
        if let startedBy = poll.startedBy {
            dict["startedBy"] = HMSDecoder.getHmsPeerSubset(startedBy)
        }
        if let stoppedAt = poll.stoppedAt {
            dict["stoppedAt"] = stoppedAt.timeIntervalSince1970 * 1000
        }
        if let stoppedBy = poll.stoppedBy {
            dict["stoppedBy"] = HMSDecoder.getHmsPeerSubset(stoppedBy)
        }
        return dict
    }

    static func getHMSPollQuestions(_ hmsPollQuestions: [HMSPollQuestion]) -> [[String: AnyHashable]] {
        var questions = [[String: AnyHashable]]()

        hmsPollQuestions.forEach { question in
            questions.append(getHMSPollQuestion(question))
        }
        return questions
    }

    static func getHMSPollQuestion(_ hmsPollQuestion: HMSPollQuestion) -> [String: AnyHashable] {
        var dict: [String: AnyHashable] = [
            "duration": hmsPollQuestion.duration,
            "index": hmsPollQuestion.index,
            "myResponses": getHMSPollQuestionResponses(hmsPollQuestion.myResponses),
            "once": hmsPollQuestion.once,
            "skippable": hmsPollQuestion.skippable,
            "text": hmsPollQuestion.text,
            "type": hmsPollQuestion.type.rawValue,
            "voted": hmsPollQuestion.voted,
            "weight": hmsPollQuestion.weight
        ]
        if let answer = hmsPollQuestion.answer {
            dict["answer"] = getHMSPollQuestionAnswer(answer)
        }
        if let answerMaxLen = hmsPollQuestion.answerMaxLen {
            dict["answerMaxLen"] = answerMaxLen
        }
        if let answerMinLen = hmsPollQuestion.answerMinLen {
            dict["answerMinLen"] = answerMinLen
        }
        if let options = hmsPollQuestion.options {
            dict["options"] = getHMSPollQuestionOptions(options)
        }
        if let responses = hmsPollQuestion.responses {
            dict["responses"] = getHMSPollQuestionResponses(responses)
        }
        return dict
    }

    static func getHMSPollQuestionAnswer(_ hmsPollQuestionAnswer: HMSPollQuestionAnswer) -> [String: AnyHashable] {
        var dict: [String: AnyHashable] = [
            "hidden": hmsPollQuestionAnswer.hidden
        ]
        if let option = hmsPollQuestionAnswer.option {
            dict["option"] = option
        }
        if let options = hmsPollQuestionAnswer.options {
            dict["options"] = options
        }
        return dict
    }

    static func getHMSPollQuestionOptions(_ hmsPollQuestionOptions: [HMSPollQuestionOption]) -> [[String: AnyHashable]] {
        var dict = [[String: AnyHashable]]()
        hmsPollQuestionOptions.forEach { hmsPollQuestionOption in
            dict.append(getHMSPollQuestionOption(hmsPollQuestionOption))
        }
        return dict
    }

    static func getHMSPollQuestionOption(_ hmsPollQuestionOption: HMSPollQuestionOption) -> [String: AnyHashable] {
        return [
            "text": hmsPollQuestionOption.text,
            "index": hmsPollQuestionOption.index,
            "voteCount": hmsPollQuestionOption.voteCount,
            "weight": hmsPollQuestionOption.weight
        ]
    }

    static func getHMSPollQuestionResponses(_ hmsPollQuestionResponses: [HMSPollQuestionResponse]) -> [[String: AnyHashable]] {
        var dict = [[String: AnyHashable]]()
        hmsPollQuestionResponses.forEach { hmsPollQuestionResponse in
            dict.append(getHMSPollQuestionResponse(hmsPollQuestionResponse))
        }
        return dict
    }

    static func getHMSPollQuestionResponse(_ hmsPollQuestionResponse: HMSPollQuestionResponse) -> [String: AnyHashable] {
        var dict: [String: AnyHashable] = [
            "duration": hmsPollQuestionResponse.duration,
            "option": hmsPollQuestionResponse.option,
            "questionId": hmsPollQuestionResponse.questionID,
            "skipped": hmsPollQuestionResponse.skipped,
            "text": hmsPollQuestionResponse.text,
            "type": hmsPollQuestionResponse.type.rawValue,
            "update": hmsPollQuestionResponse.update
        ]
        if let options = hmsPollQuestionResponse.options {
            dict["options"] = options
        }
        if let peerInfo = hmsPollQuestionResponse.peer {
            dict["peer"] = getHMSPollResponsePeerInfo(peerInfo)
        }
        if let responseFinal = hmsPollQuestionResponse.responseFinal {
            dict["responseFinal"] = responseFinal
        }
        return dict
    }

    static func getHMSPollResponsePeerInfo(_ hmsPollResponsePeerInfo: HMSPollResponsePeerInfo) -> [String: AnyHashable] {
        var dict = [String: AnyHashable]()

        if let customerUserID = hmsPollResponsePeerInfo.customerUserID {
            dict["customerUserId"] = customerUserID
        }
        if let peerID = hmsPollResponsePeerInfo.peerID {
            dict["peerId"] = peerID
        }
        if let userHash = hmsPollResponsePeerInfo.userHash {
            dict["userHash"] = userHash
        }
        if let userName = hmsPollResponsePeerInfo.userName {
            dict["userName"] = userName
        }
        return dict
    }

    static func getHMSPollResult(_ hmsPollResult: HMSPollResult) -> [String: AnyHashable] {
        return [
            "maxUserCount": hmsPollResult.maxUserCount,
            "questions": getHMSPollQuestionResults(hmsPollResult.questions),
            "totalResponse": hmsPollResult.totalResponse,
            "userCount": hmsPollResult.userCount
        ]
    }

    static func getHMSPollQuestionResults(_ hmsPollQuestionResults: [HMSPollQuestionResult]) -> [[String: AnyHashable]] {
        var results = [[String: AnyHashable]]()

        hmsPollQuestionResults.forEach { result in
            results.append(getHMSPollQuestionResult(result))
        }
        return results
    }

    static func getHMSPollQuestionResult(_ hmsPollQuestionResult: HMSPollQuestionResult) -> [String: AnyHashable] {
        var result: [String: AnyHashable] = [
            "type": hmsPollQuestionResult.type,
            "correctVotes": hmsPollQuestionResult.correctVotes,
            "question": hmsPollQuestionResult.question,
            "skippedVotes": hmsPollQuestionResult.skippedVotes,
            "totalVotes": hmsPollQuestionResult.totalVotes
        ]
        if let optionVoteCounts = hmsPollQuestionResult.optionVoteCounts {
            result["optionVoteCounts"] = optionVoteCounts
        }
        return result
    }

    static func getHMSPollQuestionResponseResults(_ hmsPollQuestionResponseResults: [HMSPollQuestionResponseResult]) -> [[String: AnyHashable]] {
        var results = [[String: AnyHashable]]()

        hmsPollQuestionResponseResults.forEach { result in
            results.append(getHMSPollQuestionResponseResult(result))
        }
        return results
    }

    static func getHMSPollQuestionResponseResult(_ hmsPollQuestionResponseResult: HMSPollQuestionResponseResult) -> [String: AnyHashable] {
        var result: [String: AnyHashable] = [
            "question": hmsPollQuestionResponseResult.question
        ]
        if let correct = hmsPollQuestionResponseResult.correct {
            result["correct"] = correct
        }
        if let error = hmsPollQuestionResponseResult.error {
            result["error"] = error.localizedDescription
        }
        return result
    }

    static func getLeaderboardResponse(_ response: HMSPollLeaderboardResponse) -> [String: AnyHashable] {
        var result = [String: AnyHashable]()

        result["hasNext"] = response.hasNext

        result["summary"] = getLeaderboardSummary(response.summary)

        result["entries"] = getLeaderboardEntries(response.entries)

        return result
    }

    static func getLeaderboardSummary(_ summary: HMSPollLeaderboardSummary) -> [String: AnyHashable] {
        var result = [String: AnyHashable]()

        result["averageScore"] = summary.averageScore
        result["averageTime"] = summary.averageTime
        result["totalPeersCount"] = summary.totalPeersCount
        result["respondedCorrectlyPeersCount"] = summary.respondedCorrectlyPeersCount
        result["respondedPeersCount"] = summary.respondedPeersCount

        return result
    }

    static func getLeaderboardEntries(_ entries: [HMSPollLeaderboardEntry]) -> [[String: AnyHashable]] {
        var result = [[String: AnyHashable]]()

        for entry in entries {
            result.append(getLeaderboardEntry(entry))
        }

        return result
    }

    static func getLeaderboardEntry(_ entry: HMSPollLeaderboardEntry) -> [String: AnyHashable] {
        var result = [String: AnyHashable]()

        result["duration"] = entry.duration
        result["totalResponses"] = entry.totalResponses
        result["correctResponses"] = entry.correctResponses
        result["position"] = entry.position
        result["score"] = entry.score

        if let peer = entry.peer {
            result["peer"] = getHMSPollResponsePeerInfo(peer)
        }

        return result
    }

    static func getHMSWhiteboard(_ hmsWhiteboard: HMSWhiteboard) -> [String: Any] {
        var result: [String: Any] = [
            "id": hmsWhiteboard.id,
        ]
        if let owner = hmsWhiteboard.owner {
            result["owner"] = HMSDecoder.getHmsPeerSubset(owner)
        }
        if let title = hmsWhiteboard.title {
            result["title"] = title
        }
        if let urlString = hmsWhiteboard.url?.absoluteString {
            result["url"] = urlString
        }
        return result
    }

    static func getWhiteboardState(_ state: HMSWhiteboard.WhiteboardState) -> String {
        switch state {
        case .started:
            return "STARTED"
        case .stopped:
            return "STOPPED"
        @unknown default:
            print("@unknown default case: Invalid HMSWhiteboardUpdateType")
            return "STOPPED"
        }
    }

    static func getWhiteboardUpdateType(_ type: HMSWhiteboardUpdateType) -> String {
        switch type {
        case .started:
            return "STARTED"
        case .stopped:
            return "STOPPED"
        @unknown default:
            print("@unknown default case: Invalid HMSWhiteboardUpdateType")
            return "STOPPED"
        }
    }
}
