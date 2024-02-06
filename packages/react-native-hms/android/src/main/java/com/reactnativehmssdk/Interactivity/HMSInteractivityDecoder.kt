package com.reactnativehmssdk.Interactivity

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.reactnativehmssdk.HMSDecoder
import live.hms.video.polls.models.HMSPollUpdateType
import live.hms.video.polls.models.HmsPoll
import live.hms.video.polls.models.HmsPollUserTrackingMode
import live.hms.video.polls.models.PollStatsQuestions
import live.hms.video.polls.models.answer.HMSPollQuestionAnswer
import live.hms.video.polls.models.answer.HmsPollAnswer
import live.hms.video.polls.models.question.HMSPollQuestion
import live.hms.video.polls.models.question.HMSPollQuestionOption
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
    data.putInt("state", poll.state.ordinal)
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

    data.putDouble("startedAt", poll.startedAt.toDouble())

    poll.stoppedAt?.let {
      data.putDouble("stoppedAt", it.toDouble())
    }

    poll.startedBy?.let {
      data.putMap("startedBy", HMSDecoder.getHmsPeerSubset(it))
    }

    return data
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
}
