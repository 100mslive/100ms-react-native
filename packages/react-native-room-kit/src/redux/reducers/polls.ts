import { HMSPollQuestionType, HMSPollType } from '@100mslive/react-native-hms';
import type {
  HMSPoll,
  PollLeaderboardResponse,
} from '@100mslive/react-native-hms';

import {
  PollsStateActionTypes,
  CreatePollStages,
  HmsStateActionTypes,
} from '../actionTypes';
import type {
  PollConfig,
  PollQuestionUI,
  PollsActionType,
} from '../actionTypes';

function getDefaultQuestionObj(): PollQuestionUI {
  return {
    title: '',
    responseEditable: false,
    saved: false,
    skippable: false,
    pointWeightage: '10',
    type: HMSPollQuestionType.singleChoice,
    options: [
      [false, ''],
      [false, ''],
    ],
  };
}

type IntialStateType = {
  pollName: string;
  pollConfig: PollConfig;
  navigationStack: CreatePollStages[];
  questions: PollQuestionUI[];
  deleteConfirmationVisible: boolean;
  selectedPollQuestionIndex: number | null;
  launchingPoll: boolean;
  selectedPollId: string | null;
  cuedPollIds: HMSPoll['pollId'][]; // In case of HLSViewer, pollIds should be aligned with onCue event
  polls: Record<string, HMSPoll>;
  pollsResponses: Record<string, Record<number, number | number[]>>;
  leaderboards: Record<string, PollLeaderboardResponse>;
};

const INITIAL_STATE: IntialStateType = {
  pollName: '',
  pollConfig: {
    type: HMSPollType.poll,
    voteCountHidden: false,
    resultsAnonymous: false,
  },
  navigationStack: [CreatePollStages.POLL_CONFIG],
  questions: [getDefaultQuestionObj()],
  deleteConfirmationVisible: false,
  selectedPollQuestionIndex: null,
  launchingPoll: false,
  selectedPollId: null,
  cuedPollIds: [],
  polls: {},
  pollsResponses: {},
  leaderboards: {},
};

const hmsStatesReducer = (
  state = INITIAL_STATE,
  action: PollsActionType
): IntialStateType => {
  switch (action.type) {
    case PollsStateActionTypes.SET_DELETE_CONFIRMATION_VISIBLE:
      return {
        ...state,
        deleteConfirmationVisible: action.deleteConfirmationVisible,
      };
    case PollsStateActionTypes.SET_POLL_NAME:
      return {
        ...state,
        pollName: action.pollName,
      };
    case PollsStateActionTypes.SET_POLL_CONFIG:
      return {
        ...state,
        pollConfig: {
          ...state.pollConfig,
          ...action.pollConfig,
        },
        questions:
          'type' in action.pollConfig
            ? state.questions.map((ques) => ({ ...ques, saved: false }))
            : state.questions,
        selectedPollQuestionIndex: null,
      };
    case PollsStateActionTypes.PUSH_TO_NAVIGATION_STACK:
      return {
        ...state,
        navigationStack: [...state.navigationStack, action.screen],
      };
    case PollsStateActionTypes.RESET_NAVIGATION_STACK:
      return {
        ...state,
        navigationStack: INITIAL_STATE.navigationStack,
      };
    case PollsStateActionTypes.POP_FROM_NAVIGATION_STACK: {
      const updatedNavigationStack = [...state.navigationStack];
      updatedNavigationStack.pop();
      return {
        ...state,
        navigationStack: updatedNavigationStack,
      };
    }
    case PollsStateActionTypes.REPLACE_TOP_OF_NAVIGATION_STACK:
      const updatedNavigationStack = [...state.navigationStack];
      updatedNavigationStack[updatedNavigationStack.length - 1] = action.screen;
      return {
        ...state,
        navigationStack: updatedNavigationStack,
      };
    case PollsStateActionTypes.ADD_POLL_QUESTION:
      return {
        ...state,
        questions: [...state.questions, getDefaultQuestionObj()],
        selectedPollQuestionIndex: null,
      };
    case PollsStateActionTypes.DELETE_POLL_QUESTION:
      let updatedQuestions = state.questions;

      if (state.selectedPollQuestionIndex === null) {
        return state;
      }

      if (updatedQuestions.length > state.selectedPollQuestionIndex) {
        updatedQuestions = updatedQuestions.filter(
          (_, idx) => idx !== state.selectedPollQuestionIndex
        );
      }
      if (updatedQuestions === state.questions) {
        return state;
      }
      return {
        ...state,
        questions: updatedQuestions,
        selectedPollQuestionIndex: null,
      };
    case PollsStateActionTypes.SET_SELECTED_QUESTION_INDEX:
      return {
        ...state,
        selectedPollQuestionIndex: action.index,
      };
    case PollsStateActionTypes.SET_QUESTION_TYPE:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                options:
                  action.questionType === HMSPollQuestionType.shortAnswer ||
                  action.questionType === HMSPollQuestionType.longAnswer
                    ? undefined
                    : question.options,
                type: action.questionType,
              }
            : question
        ),
      };
    case PollsStateActionTypes.SET_QUESTION_TITLE:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                title: action.title,
              }
            : question
        ),
      };
    case PollsStateActionTypes.SET_POINT_WEIGHTAGE:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                pointWeightage: action.pointWeightage,
              }
            : question
        ),
      };
    case PollsStateActionTypes.ADD_QUESTION_OPTION:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                options: [...(question.options || []), [false, '']],
              }
            : question
        ),
      };
    case PollsStateActionTypes.DELETE_QUESTION_OPTION:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                options:
                  question.options &&
                  question.options.filter((_, idx) => idx !== action.index),
              }
            : question
        ),
      };
    case PollsStateActionTypes.EDIT_QUESTION_OPTION:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                options:
                  question.options &&
                  question.options.map((option, idx) =>
                    idx === action.optionIndex
                      ? [option[0], action.option]
                      : option
                  ),
              }
            : question
        ),
      };
    case PollsStateActionTypes.SET_QUESTION_CORRECT_OPTION:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                options:
                  question.options &&
                  question.options.map((option, idx) => {
                    if (
                      action.correctOption === false ||
                      question.type === HMSPollQuestionType.multipleChoice
                    ) {
                      return idx === action.optionIndex
                        ? [action.correctOption, option[1]]
                        : option;
                    }
                    return [
                      idx === action.optionIndex ? true : false,
                      option[1],
                    ];
                  }),
              }
            : question
        ),
      };
    case PollsStateActionTypes.SET_QUESTION_SKIPPABLE:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                skippable: action.skippable,
              }
            : question
        ),
      };
    case PollsStateActionTypes.SET_QUESTION_RES_EDITABLE:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                responseEditable: action.responseEditable,
              }
            : question
        ),
      };
    case PollsStateActionTypes.SET_QUESTION_SAVED:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                saved: action.saved,
              }
            : question
        ),
      };
    case PollsStateActionTypes.SET_LAUNCHING_POLL:
      return {
        ...state,
        launchingPoll: action.launching,
        questions: action.launching
          ? state.questions.map((question) => ({ ...question, saved: true }))
          : state.questions,
      };
    case PollsStateActionTypes.SET_SELECTED_POLL_ID:
      return {
        ...state,
        selectedPollId: action.pollId,
      };
    case PollsStateActionTypes.ADD_POLL:
      const prevPoll = state.polls[action.poll.pollId];

      // Hack: Restore previous state of poll if current poll has missing myResponses and voteCount
      if (
        prevPoll &&
        Array.isArray(prevPoll.questions) &&
        prevPoll.questions.length > 0
      ) {
        action.poll.questions?.forEach((question) => {
          const prevQuestion = prevPoll.questions?.find(
            (prevQuestion) => prevQuestion.index === question.index
          );

          //#region Restore previous responses on question if current question has no responses
          const prevResponsesOnQuestion = prevQuestion?.myResponses;
          if (
            Array.isArray(prevResponsesOnQuestion) &&
            prevResponsesOnQuestion.length > 0 &&
            (!question.myResponses || question.myResponses.length <= 0)
          ) {
            question.myResponses = prevResponsesOnQuestion;
          }
          //#endregion

          //#region Restore previous voteCount on question options if current question options has no voteCount
          const prevOptions = prevQuestion?.options;

          question.options?.forEach((option) => {
            const prevOption = prevOptions?.find(
              (prevOption) => prevOption.index === option.index
            );

            // Edge Case: User changes response on question, due to which new vountCount becomes 0, and we are treating as invalid value
            if (
              option.voteCount <= 0 &&
              prevOption &&
              prevOption?.voteCount > 0
            ) {
              option.voteCount = prevOption.voteCount;
            }
          });
          //#endregion
        });
      }

      return {
        ...state,
        polls: {
          ...state.polls,
          [action.poll.pollId]: action.poll,
        },
      };
    case PollsStateActionTypes.UPDATE_POLL:
      return {
        ...state,
        polls: {
          ...state.polls,
          [action.poll.pollId]: {
            ...state.polls[action.poll.pollId],
            ...action.poll,
          },
        },
      };
    case PollsStateActionTypes.SET_POLL_QUESTION_RESPONSE:
      return {
        ...state,
        pollsResponses: {
          ...state.pollsResponses,
          [action.pollId]: {
            ...state.pollsResponses[action.pollId],
            [action.questionIndex]: action.response,
          },
        },
      };
    case PollsStateActionTypes.ADD_POLL_QUESTION_RESPONSE:
      const prevResponses =
        state.pollsResponses[action.pollId]?.[action.questionIndex];
      const newResponses = prevResponses
        ? Array.isArray(prevResponses)
          ? [...prevResponses, action.response]
          : [prevResponses, action.response]
        : [action.response];
      return {
        ...state,
        pollsResponses: {
          ...state.pollsResponses,
          [action.pollId]: {
            ...state.pollsResponses[action.pollId],
            [action.questionIndex]: newResponses,
          },
        },
      };
    case PollsStateActionTypes.REMOVE_POLL_QUESTION_RESPONSE: {
      const prevResponses =
        state.pollsResponses[action.pollId]?.[action.questionIndex];
      const newResponses = prevResponses
        ? Array.isArray(prevResponses)
          ? prevResponses.filter((res) => res !== action.response)
          : prevResponses === action.response
            ? []
            : action.response
        : [];
      return {
        ...state,
        pollsResponses: {
          ...state.pollsResponses,
          [action.pollId]: {
            ...state.pollsResponses[action.pollId],
            [action.questionIndex]: newResponses,
          },
        },
      };
    }
    case PollsStateActionTypes.ADD_CUED_POLL_ID: {
      return {
        ...state,
        cuedPollIds: [...state.cuedPollIds, action.pollId],
      };
    }
    case PollsStateActionTypes.ADD_LEADERBOARD: {
      return {
        ...state,
        leaderboards: {
          ...state.leaderboards,
          [action.pollId]: action.leaderboard,
        },
      };
    }
    case PollsStateActionTypes.CLEAR_POLL_FORM_STATE: {
      return {
        ...INITIAL_STATE,
        polls: state.polls,
        selectedPollId: state.selectedPollId,
      };
    }
    case PollsStateActionTypes.CLEAR_POLLS_STATE:
    case HmsStateActionTypes.CLEAR_STATES:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default hmsStatesReducer;
