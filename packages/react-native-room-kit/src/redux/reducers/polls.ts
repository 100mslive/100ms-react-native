import { HMSPollQuestionType, HMSPollType } from '@100mslive/react-native-hms';
import type { HMSPoll } from '@100mslive/react-native-hms';

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
  stage: CreatePollStages;
  questions: PollQuestionUI[];
  deleteConfirmationVisible: boolean;
  selectedPollQuestionIndex: number | null;
  launchingPoll: boolean;
  selectedPollId: string | null;
  cuedPollIds: HMSPoll['pollId'][]; // In case of HLSViewer, pollIds should be aligned with onCue event
  polls: Record<string, HMSPoll>;
  pollsResponses: Record<string, Record<number, number | number[]>>;
};

const INITIAL_STATE: IntialStateType = {
  pollName: '',
  pollConfig: {
    type: HMSPollType.poll,
    voteCountHidden: false,
    resultsAnonymous: false,
  },
  stage: CreatePollStages.POLL_CONFIG,
  questions: [getDefaultQuestionObj()],
  deleteConfirmationVisible: false,
  selectedPollQuestionIndex: null,
  launchingPoll: false,
  selectedPollId: null,
  cuedPollIds: [],
  polls: {},
  pollsResponses: {},
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
    case PollsStateActionTypes.SET_POLL_STAGE:
      return {
        ...state,
        stage: action.pollStage,
        selectedPollQuestionIndex: null,
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
