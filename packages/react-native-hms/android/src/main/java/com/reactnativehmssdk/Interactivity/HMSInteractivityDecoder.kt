package com.reactnativehmssdk.Interactivity

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.reactnativehmssdk.HMSDecoder
import live.hms.video.polls.models.*
import live.hms.video.polls.models.answer.HMSPollQuestionAnswer
import live.hms.video.polls.models.answer.HmsPollAnswer
import live.hms.video.polls.models.answer.PollAnswerItem
import live.hms.video.polls.models.answer.PollAnswerResponse
import live.hms.video.polls.models.network.HMSPollResponsePeerInfo
import live.hms.video.polls.models.question.HMSPollQuestion
import live.hms.video.polls.models.question.HMSPollQuestionOption
import live.hms.video.polls.network.HMSPollLeaderboardEntry
import live.hms.video.polls.network.HMSPollLeaderboardSummary
import live.hms.video.polls.network.PollLeaderboardResponse
import live.hms.video.polls.network.PollResultsDisplay

object HMSInteractivityDecoder {
  fun getPollUpdateType(hmsPollUpdateType: HMSPollUpdateType): Int {
    return when (hmsPollUpdateType) {
      HMSPollUpdateType.started -> 0
      HMSPollUpdateType.resultsupdated -> 1
      HMSPollUpdateType.stopped -> 2
      else -> {
        0
      }
    }
  }

  fun getPoll(poll: HmsPoll): WritableMap {
    val data = Arguments.createMap()

    data.putBoolean("anonymous", poll.anonymous)
    data.putInt("type", poll.category.ordinal)
    poll.duration?.let { data.putDouble("duration", it.toDouble()) }
    data.putString("pollId", poll.pollId)
    data.putArray("rolesThatCanViewResponses", HMSDecoder.getAllRoles(poll.rolesThatCanViewResponses))
    data.putArray("rolesThatCanVote", HMSDecoder.getAllRoles(poll.rolesThatCanVote))
    data.putInt("state", getPollStateOrdinal(poll.state))
    data.putString("title", poll.title)

    poll.createdBy?.let {
      data.putMap("createdBy", HMSDecoder.getHmsPeerSubset(it))
    }

    poll.mode?.let {
      data.putInt("mode", getPollMode(poll))
    }

    poll.questionCount?.let {
      data.putInt("questionCount", it)
    }

    poll.questions?.let {
      data.putArray("questions", getPollQuestions(it))
    }

    poll.result?.let {
      data.putMap("result", getPollResult(it))
    }

    data.putString("startedAt", poll.startedAt.toString())

    poll.stoppedAt?.let {
      data.putString("stoppedAt", it.toString())
    }

    poll.startedBy?.let {
      data.putMap("startedBy", HMSDecoder.getHmsPeerSubset(it))
    }

    return data
  }

  private fun getPollStateOrdinal(pollState: HmsPollState): Int {
    return when (pollState) {
      HmsPollState.CREATED -> 0
      HmsPollState.STARTED -> 1
      HmsPollState.STOPPED -> 2
      else -> 0
    }
  }

  private fun getPollMode(poll: HmsPoll): Int {
    return when (poll.mode) {
      HmsPollUserTrackingMode.PEER_ID -> 0
      HmsPollUserTrackingMode.USER_ID -> 1
      HmsPollUserTrackingMode.USERNAME -> 2
      else -> {
        0
      }
    }
  }

  private fun getPollQuestions(questions: List<HMSPollQuestion>): WritableArray {
    val data = Arguments.createArray()

    for (question in questions) {
      data.pushMap(getPollQuestion(question))
    }

    return data
  }

  private fun getPollQuestion(question: HMSPollQuestion): WritableMap {
    val data = Arguments.createMap()

    data.putInt("index", question.questionID)

    question.duration.let { data.putDouble("duration", it.toDouble()) }

    question.myResponses.let {
      data.putArray("myResponses", getPollAnswers(it))
    }

    data.putBoolean("skippable", question.canSkip)

    data.putString("text", question.text)

    data.putInt("type", question.type.ordinal)

    data.putBoolean("voted", question.voted)

    data.putInt("weight", question.weight)

    question.correctAnswer?.let {
      data.putMap("answer", getPollQuestionAnswer(it))
    }

    question.answerLongMinLength?.let {
      data.putDouble("answerMaxLen", it.toDouble())
    }

    question.answerShortMinLength?.let {
      data.putDouble("answerMinLen", it.toDouble())
    }

    question.options?.let {
      data.putArray("options", getPollQuestionOptions(it))
    }

    return data
  }

  private fun getPollQuestionOptions(options: List<HMSPollQuestionOption>): WritableArray {
    val data = Arguments.createArray()

    for (option in options) {
      data.pushMap(getPollQuestionOption(option))
    }

    return data
  }

  private fun getPollQuestionOption(option: HMSPollQuestionOption): WritableMap {
    val data = Arguments.createMap()

    data.putString("text", option.text)
    data.putInt("index", option.index)
    data.putInt("voteCount", option.voteCount.toInt())
    option.weight?.let { data.putInt("weight", it) }

    return data
  }

  private fun getPollQuestionAnswer(answer: HMSPollQuestionAnswer): WritableMap {
    val data = Arguments.createMap()

    answer.option?.let { data.putInt("option", it) }

    answer.options?.let { data.putArray("options", convertListToReadableArray(it)) }

    data.putBoolean("hidden", answer.hidden)

    return data
  }

  private fun getPollAnswers(answers: List<HmsPollAnswer>): WritableArray {
    val data = Arguments.createArray()

    for (answer in answers) {
      data.pushMap(getPollAnswer(answer))
    }

    return data
  }

  private fun getPollAnswer(answer: HmsPollAnswer): WritableMap {
    val data = Arguments.createMap()

    answer.durationMillis.let { data.putDouble("duration", (it * 1000).toDouble()) }

    data.putInt("option", answer.selectedOption)

    data.putInt("questionId", answer.questionId)

    data.putBoolean("skipped", answer.skipped)

    data.putString("text", answer.answerText)

    data.putInt("type", answer.questionType.ordinal)

    data.putBoolean("update", answer.update)

    answer.selectedOptions?.let {
      data.putArray("options", convertListToReadableArray(it))
    }

    return data
  }

  private fun getPollResult(result: PollResultsDisplay): WritableMap {
    val data = Arguments.createMap()

    result.totalResponses?.let {
      data.putDouble("totalResponse", it.toDouble())
    }

    result.votingUsers?.let {
      data.putDouble("userCount", it.toDouble())
    }

    result.totalDistinctUsers?.let {
      data.putDouble("maxUserCount", it.toDouble())
    }

    result.questions.let {
      data.putArray("questions", getPollStatsQuestion(it))
    }

    return data
  }

  private fun getPollStatsQuestion(questions: List<PollStatsQuestions>): WritableArray {
    val data = Arguments.createArray()

    for (question in questions) {
      data.pushMap(getPollStatsQuestion(question))
    }

    return data
  }

  private fun getPollStatsQuestion(question: PollStatsQuestions): WritableMap {
    val data = Arguments.createMap()

    data.putInt("question", question.index)

    data.putInt("type", question.questionType.ordinal)

    question.correct?.let { data.putDouble("correctVotes", it.toDouble()) }

    data.putDouble("skippedVotes", question.skipped.toDouble())

    data.putInt("totalVotes", question.attemptedTimes)

    question.options?.let {
      data.putArray("optionVoteCounts", convertLongListToReadableArray(it))
    }

    return data
  }

  private fun convertLongListToReadableArray(list: List<Long>): ReadableArray {
    val readableArray = Arguments.createArray()
    list.forEach {
      readableArray.pushInt(it.toInt())
    }
    return readableArray
  }

  private fun convertListToReadableArray(list: List<Int>): ReadableArray {
    val readableArray = Arguments.createArray()
    list.forEach {
      readableArray.pushInt(it.toInt())
    }
    return readableArray
  }

/*

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

 */
  fun getHMSPollQuestionResponseResults(hmsPollQuestionResponseResults: PollAnswerResponse): WritableArray {
    val results = Arguments.createArray()

    hmsPollQuestionResponseResults.result.forEach { result ->
      results.pushMap(getHMSPollQuestionResponseResult(result))
    }
    return results
  }

  fun getPollLeaderboardResponse(pollLeaderboardResponse: PollLeaderboardResponse): WritableMap {
    val results = Arguments.createMap()

    pollLeaderboardResponse.hasNext?.let {
      results.putBoolean("hasNext", it)
    }
    pollLeaderboardResponse.summary?.let {
      results.putMap("summary", getHMSPollLeaderboardSummary(it))
    }
    pollLeaderboardResponse.entries?.let {
      results.putArray("entries", getHMSPollLeaderboardEntries(it))
    }
    return results
  }

  private fun getHMSPollLeaderboardSummary(pollLeaderboardSummary: HMSPollLeaderboardSummary): WritableMap {
    val summary = Arguments.createMap()
    pollLeaderboardSummary.averageScore?.let {
      summary.putDouble("averageScore", it.toDouble())
    }
    pollLeaderboardSummary.averageTime?.let {
      summary.putString("averageTime", it.toString())
    }
    pollLeaderboardSummary.totalPeersCount?.let {
      summary.putInt("totalPeersCount", it)
    }
    pollLeaderboardSummary.respondedCorrectlyPeersCount?.let {
      summary.putInt("respondedCorrectlyPeersCount", it)
    }
    pollLeaderboardSummary.respondedPeersCount?.let {
      summary.putInt("respondedPeersCount", it)
    }
    return summary
  }

  private fun getHMSPollLeaderboardEntries(pollLeaderboardEntries: List<HMSPollLeaderboardEntry>): WritableArray {
    val list = Arguments.createArray()
    pollLeaderboardEntries.forEach {
      list.pushMap(getHMSPollLeaderboardEntry(it))
    }
    return list
  }

  private fun getHMSPollLeaderboardEntry(pollLeaderboardEntry: HMSPollLeaderboardEntry): WritableMap {
    val entry = Arguments.createMap()
    pollLeaderboardEntry.duration?.let {
      entry.putString("duration", it.toString())
    }
    pollLeaderboardEntry.peer?.let {
      entry.putMap("peer", getHMSPollResponsePeerInfo(it))
    }
    pollLeaderboardEntry.totalResponses?.let {
      entry.putString("totalResponses", it.toString())
    }
    pollLeaderboardEntry.correctResponses?.let {
      entry.putString("correctResponses", it.toString())
    }
    pollLeaderboardEntry.position?.let {
      entry.putString("position", it.toString())
    }
    pollLeaderboardEntry.score?.let {
      entry.putString("score", it.toString())
    }
    return entry
  }

  private fun getHMSPollResponsePeerInfo(pollResponsePeerInfo: HMSPollResponsePeerInfo): WritableMap {
    val peerInfo = Arguments.createMap()
    peerInfo.putString("userHash", pollResponsePeerInfo.hash)
    pollResponsePeerInfo.peerid?.let {
      peerInfo.putString("peerId", it)
    }
    pollResponsePeerInfo.userid?.let {
      peerInfo.putString("customerUserId", it)
    }
    pollResponsePeerInfo.username?.let {
      peerInfo.putString("userName", it)
    }
    return peerInfo
  }

  private fun getHMSPollQuestionResponseResult(hmsPollQuestionResponseResult: PollAnswerItem): WritableMap {
    val result = Arguments.createMap()

    result.putInt("question", hmsPollQuestionResponseResult.questionIndex)

    hmsPollQuestionResponseResult.correct.let {
      result.putBoolean("correct", it)
    }

    hmsPollQuestionResponseResult.error?.let {
      result.putString("error", it.localizedMessage)
    }

    return result
  }
}
