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
      val rolesThatCanViewResponsesString =
        data.getArray("rolesThatCanViewResponses")?.toArrayList() as? ArrayList<String>
      val encodedTargetedRoles =
        HMSHelper.getRolesFromRoleNames(rolesThatCanViewResponsesString, roles)
      pollBuilder.withRolesThatCanViewResponses(encodedTargetedRoles)
    }

    if (data.hasKey("rolesThatCanVote")) {
      val rolesThatCanVoteString =
        data.getArray("rolesThatCanVote")?.toArrayList() as? ArrayList<String>
      val encodedRolesThatCanVote = HMSHelper.getRolesFromRoleNames(rolesThatCanVoteString, roles)
      pollBuilder.withRolesThatCanVote(encodedRolesThatCanVote)
    }

    if (data.hasKey("questions")) {
      val questions = data.getArray("questions")?.toArrayList() as? ArrayList<HashMap<String, Any>>
      Log.e("HMSInteractivityHelper", questions.toString())

      if (questions != null) {
        for (item in questions) {
          Log.e("HMSInteractivityHelper", item.toString())

          val questionType = item["rnType"] as? String
          if (questionType != null) {
            when (questionType) {
              "singleChoice" -> {
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

              "multipleChoice" -> {
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

              "shortAnswer" -> {
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

              "longAnswer" -> {
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

              "HMSPollQuestionBuilder" -> {
                if (item["type"] != null) {
                  val type = item["type"] as? Int

                  if (type != null) {
                    val questionBuilder = HMSPollQuestionBuilder.Builder(getQuestionType(type))

                    if (item["answerHidden"] != null) {
                      val answerHidden = item["answerHidden"] as? Boolean
                      if (answerHidden != null) {
                        questionBuilder.withAnswerHidden(answerHidden)
                      }
                    }

                    if (item["canBeSkipped"] != null) {
                      val canBeSkipped = item["canBeSkipped"] as? Boolean
                      if (canBeSkipped != null) {
                        questionBuilder.withCanBeSkipped(canBeSkipped)
                      }
                    }

                    if (item["canChangeResponse"] != null) {
                      val canChangeResponse = item["canChangeResponse"] as? Boolean
                      if (canChangeResponse != null) {
                        questionBuilder.withCanChangeResponse(canChangeResponse)
                      }
                    }

                    if (item["duration"] != null) {
                      val duration = item["duration"] as? Int
                      if (duration != null) {
                        questionBuilder.withDuration(duration.toLong())
                      }
                    }

                    if (item["maxLength"] != null) {
                      val maxLength = item["maxLength"] as? Int
                      if (maxLength != null) {
                        questionBuilder.withMaxLength(maxLength.toLong())
                      }
                    }

                    if (item["minLength"] != null) {
                      val minLength = item["minLength"] as? Int
                      if (minLength != null) {
                        questionBuilder.withMinLength(minLength.toLong())
                      }
                    }

                    if (item["title"] != null) {
                      val title = item["title"] as? String
                      if (title != null) {
                        questionBuilder.withTitle(title)
                      }
                    }

                    if (item["weight"] != null) {
                      val weight = item["weight"] as? Int
                      if (weight != null) {
                        questionBuilder.withWeight(weight)
                      }
                    }

                    if (item["options"] != null) {
                      val options = item["options"] as? ArrayList<HashMap<String, Any>>
                      if (options != null) {
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
                    }

                    questionBuilder.build().let {
                      pollBuilder.addQuestion(it)
                    }
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
    }

    return pollBuilder.build()
  }

  private fun getQuestionType(type: Int): HMSPollQuestionType {
    return when (type) {
      1 -> HMSPollQuestionType.singleChoice
      2 -> HMSPollQuestionType.multiChoice
      3 -> HMSPollQuestionType.shortAnswer
      4 -> HMSPollQuestionType.longAnswer
      else -> HMSPollQuestionType.singleChoice
    }
  }

  // endregion

  // region Poll Builder Helpers
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
  // endregion
}
