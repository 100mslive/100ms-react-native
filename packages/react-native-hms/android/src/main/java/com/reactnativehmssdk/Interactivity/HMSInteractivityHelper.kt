package com.reactnativehmssdk

import com.facebook.react.bridge.ReadableMap
import live.hms.video.polls.HMSPollBuilder
import live.hms.video.polls.HMSPollQuestionBuilder
import live.hms.video.polls.models.question.HMSPollQuestionType

object HMSInteractivityHelper {
  // region Create a poll
  fun getPollBuilder(data: ReadableMap): HMSPollBuilder {
    return HMSPollBuilder.Builder()
      .addQuestion(
        HMSPollQuestionBuilder.Builder(HMSPollQuestionType.singleChoice)
          .addOption("hot")
          .addOption("warm")
          .addOption("cold")
          .build(),
      )
      .build()
  }
  // endregion
}
