import firebase from 'firebase'
import rootMutations from '@/store/mutations'
import ROOT, { CHAT } from '@/store/namespace'

let state = {
  memberList: null
};

const mutations = {
  GET_MEMBER: (state, payload) => {
    state.memberList = payload
  }
};

const getters = {
  SET_FILTER: () => (member, chatMember) => {
    let temp = JSON.parse(JSON.stringify(member));
    
    for(let user in chatMember) {
      temp[user].disabled = true;
    }
    return temp;
  }
}


const actions = {
  // payload 유저UID
  getUserInfo({ dispatch }, payload) {
    return new Promise(resolve => {
      firebase.database().ref(`myChat/users/${payload}`).once('value').then(result => {
        if (result.val()) {
          resolve(result.val())
        } else {          
          dispatch('dialogAlert2', { message: '멤버정보 오류' })
          resolve(false)
        }
      })
    })
  },  
  GET_MEMBER({ commit, dispatch }, payload) {
    let { memberList } = this.state.member;

    if (memberList) {
      commit(ROOT.GET_MEMBER_REQ_SUCCESS, payload, { root: true })
    } else {
      commit(ROOT.GET_MEMBER_REQ_WAIT, payload, { root: true })

      return new Promise((resolve, reject) => {
        firebase.database().ref('myChat/users').on('value', res => {
            let result = res.val();
            if (result) {              
                commit('GET_MEMBER', result);
                commit(ROOT.GET_MEMBER_REQ_SUCCESS, payload, { root: true })
                resolve(result)
            } else {
                commit(ROOT.GET_MEMBER_REQ_FAIL, payload, { root: true });
                dispatch('dialogAlert2', { message: '멤버조회 오류' } , { root: true }) 
                reject('멤버조회 오류')
            }        
        })
      })
    }
  },
  /*
    @uids 나와 상대방 uids { type: Array }
   */
  async SET_JOIN({ commit, dispatch }, payload) {
                
      commit(ROOT.SET_JOIN_REQ_WAIT, null, { root: true })
      /*
        @roomData 나와 상대가 이전에 대화 이력이 있는지 조회 후 있으면 기존 방으로 다시 대화 없다면 새로 생성
                  그룹 대화는 이력과 관계없이 생성시킨다.
        @hasRoom 기존방이 있나 { Bolean }
        @key { 챗리트스 key }
      */
      const myHistory = await isPrivate(payload)
 
      if (myHistory) {
          // 1:1 대화 이력이 있는경우 return RoomKey
          commit(ROOT.SET_JOIN_REQ_SUCCESS, null, { root: true })
          return myHistory
      } else {
          // 챗방 키 생성
          let data = Object.assign({ member: payload }, { key: firebase.database().ref().push().key })
          commit(ROOT.SET_JOIN_REQ_SUCCESS, null, { root: true })    
          // 생성된 챗팅방 KEY
          return await dispatch(CHAT.CREATE_ROOM, data, { root: true })
      }
  }
};


function isPrivate(payload) {
  let uids = payload,
      size = uids.length,
      roomData = {}; // 챗 리스트와 룸을 연결하는 PK

  return new Promise(resolve => {
      // 1:1 대화일때만 다음 대화시에도 이전 대화를 이끌어 간다.
      if (size === 2) {
          // 이전에 대화한 기록이 있나? 조사한다
          // 내 uid를 나중에 push 했기때문에 
          // uids[0] = 상대방 uid, uids[1] = 내uid
          firebase.database().ref(`myChat/private/${uids[1]}`).child(uids[0]).once('value').then(res => {
              // 기존 방 검색
              if (res.val()) {
                  roomData = {
                      hasRoom: true,
                      key: res.val()
                  };
                  resolve(roomData.key)
              } else {  // 없으면 신규로 만듬                       
                  resolve(false)                  
              }
          })
      } else {
        resolve(false)
      }
  })
}

export default {
  namespaced: true,
  state,
  actions,
  getters,
  rootMutations,
  mutations
}
