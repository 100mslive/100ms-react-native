import actionTypes from '../actionTypes';

export const addMessage = (data) => ({
  type: actionTypes.ADD_MESSAGE.REQUEST,
  payload: data,
});
