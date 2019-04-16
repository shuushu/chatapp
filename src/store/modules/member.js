import firebase from 'firebase'
import rootMutations from '@/store/mutations'
import { put, call } from "vuex-saga";
import ROOT, { MEMBER } from '@/store/namespace'
import { yyyymm } from '@/common/util'

let state = {
  memberList: null
};

const mutations = {
  GET_MEMBER: (state, data) => {
    state.memberList = data
  }
};

const getters = {
  SET_FILTER: () => (member, chatMember) => {
    let data = JSON.parse(JSON.stringify(member));

    for (let i = 0, size = chatMember.length; i < size; i += 1) {
      data[chatMember[i]].disabled = true;
    }
    return data
  }
}


const actions = {
  *GET_MEMBER() {
    if (this.state.member.memberList) {
       return false;
    }

    yield put(ROOT.GET_MEMBER_REQ_WAIT)

    return yield call(() => {
      return new Promise(resolve => {
        firebase.database().ref('myChat/users').on('value', (res) => {
          let result = res.val(),
              memberList = {};


          for (let key in result) {
            memberList[key] = result[key]
          }


          if (result) {
            this.commit(MEMBER.GET_MEMBER, memberList);
            this.commit(ROOT.GET_MEMBER_REQ_SUCCESS)
            resolve(memberList)
          } else {
            this.commit(ROOT.GET_MEMBER_REQ_FAIL);
            resolve(null)
          }
        })
      })
    });
  },
  /*
    @uids 나와 상대방 uids { type: Array }
   */
  *SET_JOIN() {
      let uids = arguments[1],
          size = uids.length,
          roomData = {}; // 챗 리스트와 룸을 연결하는 PK

      yield put(ROOT.SET_JOIN_REQ_WAIT)

      roomData = yield call(() => {
          return new Promise(resolve => {
              // 1:1 대화일때만 다음 대화시에도 이전 대화를 이끌어 간다.
              if (size === 2) {
                  // 이전에 대화한 기록이 있나? 조사한다
                  firebase.database().ref(`myChat/private/${uids[1]}`).child(uids[0]).once('value').then(res => {
                      // 있다면 룸키를 가져 오고 없으면 신규로 만듬
                      if (res.val()) {
                          roomData = {
                              hasRoom: true,
                              key: res.val()
                          };
                      } else {
                          roomData.hasRoom = false;
                          roomData.key = firebase.database().ref(`myChat/private/${uids[1]}`).push().key;
                          firebase.database().ref(`myChat/private/${uids[1]}`).child(uids[0]).set(roomData.key);
                          firebase.database().ref(`myChat/private/${uids[0]}`).child(uids[1]).set(roomData.key);
                      }

                      resolve(roomData)
                  })
              } else {
                  // 여러명 대화시
                  roomData.hasRoom = false;
                  roomData.key = firebase.database().ref().push().key;
                  resolve(roomData)
              }
          })
      })

      if (roomData.hasRoom) {
          // 룸으로 보낸다.
          yield put(ROOT.SET_JOIN_REQ_SUCCESS)
          return roomData.key
      } else {
          // 방 만든다.
          yield put(ROOT.SET_JOIN_REQ_SUCCESS)
          return yield call(() => {
              return new Promise(resolve => {
                  // 내 계정 대화 목록 만들기
                  let data = {
                          // 상태: 0 읽음, 1 읽지않음, 2 공지
                          state: 0,
                          join: uids,
                          text: '방이 개설됨'
                      },
                      date = new Date();

                  date = yyyymm(date);
                  // 룸리스트 생성
                  for (let i = 0; i < size; i += 1) {
                      firebase.database().ref(`myChat/list/${uids[i]}`).child(roomData.key).update(data);
                  }                  
                  //crateRoomList(uids, roomData.key, data)
                  // 작성자 uid
                  // 작성내용
                  // 메세지타입: 0 일반 1 이미지 2 파일 3공지
                  let path = {};
                  path.members = uids
                  path.item = [{
                      write: 'admin',
                      text: '방이 개설됨',
                      type: 3
                  }]
                  path.date = date

                  firebase.database().ref(`myChat/room/${roomData.key}`).set(path)

                  resolve(roomData.key)
              })
          })
      }


  }
};


export default {
  namespaced: true,
  state,
  actions,
  getters,
  rootMutations,
  mutations
}
