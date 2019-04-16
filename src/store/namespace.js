import { TYPE } from '../common/config'
let ROOT = {};

TYPE.forEach(value => {
  ROOT = Object.assign(ROOT, {
    [`${value}_REQ_WAIT`]: `${value}_REQ_WAIT`,
    [`${value}_REQ_SUCCESS`]: `${value}_REQ_SUCCESS`,
    [`${value}_REQ_FAIL`]: `${value}_REQ_FAIL`
  })
});
// vuex-saga namespace > mutation에 접근
export default {
  ...ROOT,
  SET_AUTH: 'SET_AUTH',
  SESSION_AUTH: 'SESSION_AUTH',
  SESSION_OUT: 'SESSION_OUT',
  SET_INVITE: 'SET_INVITE',
  POPUP_ALERT: 'POPUP_ALERT',
  POPUP_CONFIRM: 'POPUP_CONFIRM',
  ALARM_ON: 'ALARM_ON'
}

export const MEMBER = {
  GET_MEMBER: 'member/GET_MEMBER',
  SET_JOIN: 'member/SET_JOIN',
  SET_FILTER: 'member/SET_FILTER'
}

export const CHAT = {
  GET_ROOMLIST: 'chat/GET_ROOMLIST',
  GET_MESSAGE: 'chat/GET_MESSAGE',
  GET_OLD_MESSAGE: 'chat/GET_OLD_MESSAGE',
  SEND_MESSAGE: 'chat/SEND_MESSAGE',
  ADD_IMAGE: 'chat/ADD_IMAGE',
  SET_PROGRESS: 'chat/SET_PROGRESS',
  GET_CHAT_MEMBER: 'chat/GET_CHAT_MEMBER',
  GET_CHAT_DATE: 'chat/GET_CHAT_DATE',
  ROOMOUT: 'chat/ROOMOUT',
  SET_LATEST: 'chat/SET_LATEST',
  REMOVE_LATEST: 'chat/REMOVE_LATEST'
}


export const ERROR = {
  'auth/wrong-password': '비밀번호가 잘못 되었습니다',
  'auth/user-not-found': '아이디가 잘못 되었습니다.',
  'auth/email-already-in-use': '해당 이메일 사용되고 있습니다.',
  'auth/popup-closed-by-user': '계정선택 팝업창을 닫아 로그인 화면으로 돌아갑니다.'
}
