import * as React from 'react';
import { View } from 'react-native';
import { HMSPollType, type HMSPoll } from '@100mslive/react-native-hms';

import { PollAndQuizQuestionResponseCard } from './PollAndQuizQuestionResponseCard';
import type { PollAndQuizQuestionResponseCardProps } from './PollAndQuizQuestionResponseCard';

export interface PollAndQuizQuestionResponseCardsProps {
  poll: HMSPoll;
  onVote: PollAndQuizQuestionResponseCardProps['onSubmit'];
}

export const PollAndQuizQuestionResponseCards: React.FC<
  PollAndQuizQuestionResponseCardsProps
> = ({ poll, onVote }) => {
  if (!Array.isArray(poll.questions) || poll.questions.length <= 0) {
    return null;
  }

  const pollQuestions = poll.questions.sort((a, b) => a.index - b.index);

  // Show all question cards if the pollType is a `poll` OR if all questions have been answered
  if (
    poll.type === HMSPollType.poll ||
    pollQuestions.every((q) => q.myResponses.length > 0)
  ) {
    return (
      <View>
        {pollQuestions.map((question, _, arr) => (
          <PollAndQuizQuestionResponseCard
            key={question.index}
            pollState={poll.state}
            pollId={poll.pollId}
            totalQuestions={arr.length}
            pollQuestion={question}
            containerStyle={{ marginBottom: 16 }}
            onSubmit={onVote}
          />
        ))}
      </View>
    );
  }

  const unansweredQuestion = pollQuestions.find(
    (q) => !q.myResponses || q.myResponses.length <= 0
  );

  // Show question cards one at a time if the pollType is a `quiz` and not all questions have been answered
  if (unansweredQuestion) {
    return (
      <PollAndQuizQuestionResponseCard
        pollState={poll.state}
        pollId={poll.pollId}
        totalQuestions={pollQuestions.length}
        pollQuestion={unansweredQuestion}
        containerStyle={{ marginBottom: 16 }}
      />
    );
  }

  return null;
};
