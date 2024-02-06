import {
  HMSPollQuestionType,
  type HMSPoll,
  HMSPollType,
  HMSPollState,
} from '@100mslive/react-native-hms';

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
  launchingPoll: boolean;
  selectedPollId: string | null;
  polls: Record<string, HMSPoll>;
  pollsResponses: Record<string, Record<number, number | number[]>>;
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
  launchingPoll: false,
  selectedPollId: 'abcdc',
  polls: {
    hbac: { pollId: 'hbac', title: 'Poll', type: HMSPollType.poll },
    khsdbkvs: {
      pollId: 'khsdbkvs',
      title: 'Quiz 2024',
      type: HMSPollType.poll,
      state: HMSPollState.stopped,
    },
    abcdc: {
      pollId: 'abcdc',
      title: 'Quiz 2023',
      type: HMSPollType.poll,
      state: HMSPollState.started,
      questions: [
        {
          duration: -1,
          index: 2,
          myResponses: [],
          once: true,
          skippable: false,
          text: 'What is your name?',
          type: HMSPollQuestionType.singleChoice,
          weight: 1,
          options: [
            {
              index: 4,
              text: 'John 4',
              weight: 1,
              voteCount: 0,
            },
            {
              index: 3,
              text: 'Jitu 3',
              weight: 1,
              voteCount: 0,
            },
            {
              index: 1,
              text: 'Jatin 1',
              weight: 1,
              voteCount: 0,
            },
            {
              index: 2,
              text: 'Bhanu 2',
              weight: 1,
              voteCount: 0,
            },
          ],
        },
        {
          duration: -1,
          index: 1,
          myResponses: [],
          once: true,
          skippable: false,
          text: 'What kind of bear is best?',
          type: HMSPollQuestionType.multipleChoice,
          weight: 1,
          options: [
            {
              index: 4,
              text: 'Black Bear',
              weight: 1,
              voteCount: 0,
            },
            {
              index: 3,
              text: 'Brown Bear',
              weight: 1,
              voteCount: 0,
            },
            {
              index: 1,
              text: 'White Bear',
              weight: 1,
              voteCount: 0,
            },
            {
              index: 2,
              text: 'Polar Bear',
              weight: 1,
              voteCount: 0,
            },
          ],
        },
      ],
    },
  },
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
    case PollsStateActionTypes.ADD_POLL_QUESTION_RESPONSE:
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
    case PollsStateActionTypes.CLEAR_POLLS_STATE:
      return INITIAL_STATE;
    default:
      return state;
  }
};

export default hmsStatesReducer;
