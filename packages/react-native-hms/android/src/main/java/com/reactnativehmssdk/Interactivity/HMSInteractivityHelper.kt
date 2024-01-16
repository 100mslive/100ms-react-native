package com.reactnativehmssdk

import android.util.Log
import com.facebook.react.bridge.ReadableMap
import live.hms.video.polls.HMSPollBuilder
import live.hms.video.polls.HMSPollQuestionBuilder
import live.hms.video.polls.models.HmsPollCategory
import live.hms.video.polls.models.HmsPollUserTrackingMode
import live.hms.video.polls.models.question.HMSPollQuestionType
import live.hms.video.sdk.models.role.HMSRole

object HMSInteractivityHelper {
  // region Create a poll
  fun getPollBuilder(
    data: ReadableMap,
    roles: List<HMSRole>,
  ): HMSPollBuilder {
    val pollBuilder = HMSPollBuilder.Builder()

    if (data.hasKey("isAnonymous")) {
      pollBuilder.withAnonymous(data.getBoolean("isAnonymous"))
    }

    if (data.hasKey("duration")) {
      pollBuilder.withDuration(data.getInt("duration").toLong())
    }

    if (data.hasKey("userTrackingMode")) {
      pollBuilder.withUserTrackingMode(getUserTrackingMode(data))
    }

    if (data.hasKey("category")) {
      pollBuilder.withCategory(getPollCategory(data))
    } else {
      pollBuilder.withCategory(HmsPollCategory.POLL)
    }

    data.getString("pollId")?.let {
      pollBuilder.withPollId(it)
    }
    data.getString("title")?.let {
      pollBuilder.withTitle(it)
    }

    if (data.hasKey("rolesThatCanViewResponses")) {
      pollBuilder.withRolesThatCanViewResponses(getRolesThatCanViewResponses(data, roles))
    }

    if (data.hasKey("rolesThatCanVote")) {
      pollBuilder.withRolesThatCanVote(getRolesThatCanVote(data, roles))
    }

    if (data.hasKey("questions")) {
      val questions = data.getArray("questions")?.toArrayList() as? ArrayList<HashMap<String, Any>>

      if (questions != null) {
        addQuestions(questions, pollBuilder)
      }
    }

    return pollBuilder.build()
  }

  // endregion

  // region Poll Builder Helpers
  private fun getQuestionType(type: Int): HMSPollQuestionType {
    return when (type) {
      0 -> HMSPollQuestionType.singleChoice
      1 -> HMSPollQuestionType.multiChoice
      2 -> HMSPollQuestionType.shortAnswer
      3 -> HMSPollQuestionType.longAnswer
      else -> HMSPollQuestionType.singleChoice
    }
  }

  private fun getUserTrackingMode(data: ReadableMap): HmsPollUserTrackingMode {
    return when (data.getInt("userTrackingMode")) {
      0 -> HmsPollUserTrackingMode.USER_ID
      1 -> HmsPollUserTrackingMode.PEER_ID
      2 -> HmsPollUserTrackingMode.USERNAME
      else -> HmsPollUserTrackingMode.USER_ID
    }
  }

  private fun getPollCategory(data: ReadableMap): HmsPollCategory {
    return when (data.getInt("category")) {
      0 -> HmsPollCategory.POLL
      1 -> HmsPollCategory.QUIZ
      else -> HmsPollCategory.POLL
    }
  }

  private fun getRolesThatCanViewResponses(
    data: ReadableMap,
    roles: List<HMSRole>,
  ): List<HMSRole> {
    val rolesThatCanViewResponsesString =
      data.getArray("rolesThatCanViewResponses")?.toArrayList() as? ArrayList<String>
    val encodedTargetedRoles =
      return HMSHelper.getRolesFromRoleNames(rolesThatCanViewResponsesString, roles)
  }

  private fun getRolesThatCanVote(
    data: ReadableMap,
    roles: List<HMSRole>,
  ): List<HMSRole> {
    val rolesThatCanVoteString =
      data.getArray("rolesThatCanVote")?.toArrayList() as? ArrayList<String>
    return HMSHelper.getRolesFromRoleNames(rolesThatCanVoteString, roles)
  }

  private fun addQuestions(
    questions: ArrayList<HashMap<String, Any>>,
    pollBuilder: HMSPollBuilder.Builder,
  ) {
    for (item in questions) {
      val questionType = item["rntype"] as? String
      if (questionType != null) {
        when (questionType) {
          "singleChoice" -> {
            addSingleChoiceQuestion(item, pollBuilder)
          }

          "multipleChoice" -> {
            addMultipleChoiceQuestion(item, pollBuilder)
          }

          "shortAnswer" -> {
            addShortAnswerQuestion(item, pollBuilder)
          }

          "longAnswer" -> {
            addLongAnswerQuestion(item, pollBuilder)
          }

          "HMSPollQuestionBuilder" -> {
            if (item["type"] != null) {
              val type = item["type"] as? Double
              type?.let {
                addPollBuilderQuestion(getQuestionType(type.toInt()), item, pollBuilder)
              }
            }
          }

          else -> {
            Log.e("HMSInteractivityHelper", "Unknown question type")
          }
        }
      }
    }
  }

  private fun addSingleChoiceQuestion(
    item: HashMap<String, Any>,
    pollBuilder: HMSPollBuilder.Builder,
  ) {
    if (item["title"] != null && item["options"] != null) {
      val title = item["title"] as? String
      val options = item["options"] as? ArrayList<String>

      if (title != null && options != null) {
        val questionBuilder =
          HMSPollQuestionBuilder.Builder(HMSPollQuestionType.singleChoice)
            .withTitle(title)

        for (i in 0 until options.size) {
          questionBuilder.addOption(options[i])
        }
        pollBuilder.addQuestion(questionBuilder.build())
      }
    }
  }

  private fun addMultipleChoiceQuestion(
    item: HashMap<String, Any>,
    pollBuilder: HMSPollBuilder.Builder,
  ) {
    if (item["title"] != null && item["options"] != null) {
      val title = item["title"] as? String
      val options = item["options"] as? ArrayList<String>

      if (title != null && options != null) {
        val questionBuilder =
          HMSPollQuestionBuilder.Builder(HMSPollQuestionType.multiChoice)
            .withTitle(title)

        for (i in 0 until options.size) {
          questionBuilder.addOption(options[i])
        }
        pollBuilder.addQuestion(questionBuilder.build())
      }
    }
  }

  private fun addShortAnswerQuestion(
    item: HashMap<String, Any>,
    pollBuilder: HMSPollBuilder.Builder,
  ) {
    if (item["title"] != null) {
      val title = item["title"] as? String

      if (title != null) {
        val questionBuilder =
          HMSPollQuestionBuilder.Builder(HMSPollQuestionType.shortAnswer)
            .withTitle(title)
        pollBuilder.addQuestion(questionBuilder.build())
      }
    }
  }

  private fun addLongAnswerQuestion(
    item: HashMap<String, Any>,
    pollBuilder: HMSPollBuilder.Builder,
  ) {
    if (item["title"] != null) {
      val title = item["title"] as? String

      if (title != null) {
        val questionBuilder =
          HMSPollQuestionBuilder.Builder(HMSPollQuestionType.longAnswer)
            .withTitle(title)
        pollBuilder.addQuestion(questionBuilder.build())
      }
    }
  }

  private fun addPollBuilderQuestion(
    type: HMSPollQuestionType,
    item: HashMap<String, Any>,
    pollBuilder: HMSPollBuilder.Builder,
  ) {
    val questionBuilder = HMSPollQuestionBuilder.Builder(type)

    val answerHidden = item["answerHidden"] as? Boolean
    if (answerHidden != null) {
      questionBuilder.withAnswerHidden(answerHidden)
    }

    val canBeSkipped = item["canBeSkipped"] as? Boolean
    if (canBeSkipped != null) {
      questionBuilder.withCanBeSkipped(canBeSkipped)
    }

    val canChangeResponse = item["canChangeResponse"] as? Boolean
    if (canChangeResponse != null) {
      questionBuilder.withCanChangeResponse(canChangeResponse)
    }

    val duration = item["duration"] as? Int
    if (duration != null) {
      questionBuilder.withDuration(duration.toLong())
    }

    val maxLength = item["maxLength"] as? Int
    if (maxLength != null) {
      questionBuilder.withMaxLength(maxLength.toLong())
    }

    val minLength = item["minLength"] as? Int
    if (minLength != null) {
      questionBuilder.withMinLength(minLength.toLong())
    }

    val title = item["title"] as? String
    if (title != null) {
      questionBuilder.withTitle(title)
    }

    val weight = item["weight"] as? Int
    if (weight != null) {
      questionBuilder.withWeight(weight)
    }

    val options = item["options"] as? ArrayList<HashMap<String, Any>>
    options?.let {
      addOptions(it, questionBuilder)
    }

    questionBuilder.build().let {
      pollBuilder.addQuestion(it)
    }
  }

  private fun addOptions(
    options: ArrayList<HashMap<String, Any>>,
    questionBuilder: HMSPollQuestionBuilder.Builder,
  ) {
    for (i in 0 until options.size) {
      val option = options[i]

      if (option["isCorrect"] != null) {
        val isCorrect = option["isCorrect"] as? Boolean
        if (isCorrect != null) {
          questionBuilder.addQuizOption(
            option["title"] as? String ?: "",
            isCorrect,
          )
        }
      } else {
        questionBuilder.addOption(option["title"] as? String ?: "")
      }
    }
  }

  // endregion
}
