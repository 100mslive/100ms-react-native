import { HMSPollQuestionType } from '@100mslive/react-native-hms';

import { PollsStateActionTypes, CreatePollStages } from '../actionTypes';
import type {
  PollConfig,
  PollQuestionUI,
  PollsActionType,
} from '../actionTypes';

function getDefaultQuestionObj() {
  return {
    title: '',
    responseEditable: false,
    saved: false,
    skippable: false,
    type: HMSPollQuestionType.singleChoice,
    options: ['', ''],
  };
}

type IntialStateType = {
  pollName: string;
  pollConfig: PollConfig;
  stage: CreatePollStages;
  questions: PollQuestionUI[];
  deleteConfirmationVisible: boolean;
  selectedPollQuestionIndex: number | null;
};

const INITIAL_STATE: IntialStateType = {
  pollName: '',
  pollConfig: {
    voteCountHidden: false,
    resultsAnonymous: false,
  },
  stage: CreatePollStages.POLL_CONFIG,
  questions: [getDefaultQuestionObj()],
  deleteConfirmationVisible: false,
  selectedPollQuestionIndex: null,
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
    case PollsStateActionTypes.ADD_QUESTION_OPTION:
      return {
        ...state,
        questions: state.questions.map((question, idx) =>
          idx === action.questionIndex
            ? {
                ...question,
                options: [...(question.options || []), ''],
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
                    idx === action.optionIndex ? action.option : option
                  ),
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
    default:
      return state;
  }
};

export default hmsStatesReducer;
