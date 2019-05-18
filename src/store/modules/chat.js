import firebase from 'firebase'
import rootMutations from '@/store/mutations'
import { put, call } from "vuex-saga";
import ROOT, { CHAT } from '@/store/namespace'
import { yyyymm, urlExp, urlify } from '@/common/util'
import { reject } from 'q';
// 다음은 live리스너 변수
let messageOn,
    chatDateKey, // 챗방 날짜
    currentMember, // 챗방에 접속된 멤버들
    latestLisner;

let state = {
  roomList: null,
  message: null,
  oldMsg: null,
  progress: 0,
  chatMember: null,
  chatDate: null,
  latest: false
};

const mutations = {
  GET_ROOMLIST: (state, data) => {
    state.roomList = data
  },
  GET_MESSAGE: (state, data) => {
    state.message = data
  },
  SET_LATEST: (state, data) => {
    state.latest = data
  },  
  GET_OLD_MESSAGE: (state, data) => {
    state.oldMsg = data
  },
  SET_PROGRESS: (state, data) => {
    state.progress = data
  },
  GET_CHAT_MEMBER: (state, data) => {
    state.chatMember = data
  },
  GET_CHAT_DATE: (state, data) => {
    state.chatDate = data
  }
};


const actions = {
  async GET_ROOMLIST({ commit, dispatch }) {
    let { auth, chat } = this.state;

    // vuex에 저장되면 다음부턴 실행하지 않음
    if (chat.roomList === null) {
      commit(ROOT.GET_ROOMLIST_REQ_WAIT, null, { root: true })  
      
      let getRoomData = await new Promise(resolve => {
        firebase.database().ref(`myChat/list/${auth.uid}`).on('value', res => {
            let result = res.val();
            if (result) {
              resolve(result)
            } else {
              resolve(false)
            }
        })
      })
      if (getRoomData) {
        for (let key in getRoomData) {
          await dispatch('GET_CURRENT_MEMBER', key).then(res => {
            getRoomData[key].join = res.data          
          })          
        }
        await commit('GET_ROOMLIST', getRoomData)
        await commit(ROOT.GET_ROOMLIST_REQ_SUCCESS, null, { root: true })
      } else {
        commit('GET_ROOMLIST', result)
        commit(ROOT.GET_ROOMLIST_REQ_FAIL, null, { root: true })
      }
    } else {
      commit(ROOT.GET_ROOMLIST_REQ_SUCCESS, null, { root: true })
    }
  },
  CREATE_ROOM({}, payload) {
      let { member, key } = payload,             
          roomListData = {                          
              state: 1, // 상태: 0 즐겨찾기, 1 일반
              text: '방이 개설됨'
          },
          myStorage = JSON.parse(localStorage.getItem('myChatMessage')),
          date = new Date();


      return new Promise(resolve => {
        date = yyyymm(date);

        // 1:1 대화이면 프라이빗방에 기록
        if (member.length === 2) {
          firebase.database().ref(`myChat/private/${member[1]}`).child(member[0]).set(key);
          firebase.database().ref(`myChat/private/${member[0]}`).child(member[1]).set(key);
        }

        // 각 멤버들에게 챗리스트 생성시킨다
        for (let i = 0; i < member.length; i += 1) {
            firebase.database().ref(`myChat/list/${member[i]}`).child(key).set(roomListData);
            // 챗방 초기 접속 상태 생성, 초기값 0은 비접속 1접속
            firebase.database().ref(`myChat/join/${key}/${member[i]}`).set(0)
            // 알람 초기 갯수 0설정
            firebase.database().ref(`myChat/alarm/${member[i]}`).child(key).set(0)
        }

        firebase.database().ref(`myChat/room/${key}`).set({
            date,
            item: [{
              write: 'admin',
              text: '방이 개설됨',
              unread: 0,
              type: 3 // 메세지타입: 0 일반 1 이미지 2 파일 3공지
          }]
        })


        // 캐쉬메세지가 없을떄       
        if (myStorage === null) {
          let obj = {
            [key]: {
              [date]: {}
            }
          };
          myStorage = obj
          localStorage.setItem('myChatMessage', JSON.stringify(myStorage));
        }

        resolve(key)
      })
  },
  async DELETE_ROOM({ commit, dispatch }, payload) {

  },
  // 슈퍼권한 > 관련된 멤버 모두 삭제됨
  async SUPER_DELETE_ROOM({ commit, dispatch }, payload) {
    let { key, join } = payload;
    
    for(let item in join) { // item: join userUID
      // #알람 삭제
      await firebase.database().ref(`myChat/alarm/${item}/${key}`).set(null)
      // #1:1대화 삭제: 룸리스트에 연관된 1:1대화 멤버 삭제
      // - 1:1대화 내역 조회
      await firebase.database().ref(`myChat/private/${item}`).once('value', res => {        
        let data = res.val() //  1:1 대화한 멤버 uid
        if (data) {
          for (let pmember in data) {            
            if (join[pmember]) {
              firebase.database().ref(`myChat/private/${item}/${join[pmember].uid}`).set(null)
            }            
          }
        }        
      })
      // #룸 리스트 삭제
      await firebase.database().ref(`myChat/list/${item}/${key}`).set(null)
    }
    // #룸 메세지 삭제
    await firebase.database().ref(`myChat/room/${key}`).set(null)

    await dispatch('dialogAlert', { message: '선택한 방 삭제 완료' }, { root: true })
  },
  /*
    @date client 오늘 날짜 { String }
   */
  // 현재 접속 멤버가 누구인지?
  GET_CURRENT_MEMBER({ commit }, payload) {
    if (currentMember) {
      currentMember.off('value')
    }

    currentMember = firebase.database().ref(`myChat/join/${payload}`)

    return new Promise(resolve => {
      currentMember.on('value', snap => {
        let data = snap.val()

        if (data) {      
          let cnt = 0;
          for (let userState in data) {
            // 현재 접속멤버 카운트 구하기
            if (data[userState] === 0) {
              cnt += 1 // 비접속 멤버 카운트
            }
          }
          commit('GET_CHAT_MEMBER', { data, total: cnt })
          resolve({ data, total: cnt })
        } else {
          resolve(false)
        }
      })
    })
  },
  async GET_MESSAGE({ commit, dispatch }, payload) {
      let { key, today } = payload,
          { uid } = this.state.auth,
          { chatDate } = this.state.chat,
          myStorage = JSON.parse(localStorage.getItem('myChatMessage'));

      if (messageOn) {
        messageOn.off('value')
      }
      // 캐쉬메세지가 없을떄       
      if (myStorage === null) {
        let obj = {
          [key]: {
            [today]: {}
          }
        };
        myStorage = obj        
      }
      // 캐쉬메세지는 있으나 새로운 방이 생성 될 경우
      if (!myStorage[key]) {
          let obj = {
            [key]: {
              [today]: {}
            }
          };
          myStorage = { ...obj, ...myStorage }
      }

      localStorage.setItem('myChatMessage', JSON.stringify(myStorage));

      // 챗방 접속 상태 감시
      await dispatch('GET_CURRENT_MEMBER', key)
      commit(ROOT.GET_MESSAGE_REQ_WAIT, null, { root: true })
      // [알람] 읽음으로 처리
      firebase.database().ref(`myChat/alarm/${uid}/${key}`).set(0)
      
      // 현재 날짜가 룸 날짜가 다르면 챗방 날짜 변경하고 날자 알림 메세지
      if (chatDate !== today) {
        firebase.database().ref(`myChat/room/${key}`).set({
          date: today,
          item: [{
            text: today,
            type: 3,
            unread: 0,
            write: 'admin'
          }]
        })
      }

      // 메세지 감시
      messageOn = firebase.database().ref(`myChat/room/${key}/item`)
      // 방 첫 진입시에만 읽음처리 실행
      messageOn.once('value', snap => {
        let result = snap.val();
        if (result) {          
          for(let key in result) {
            // 읽음상태가 0보다 크고, 내가 쓴 메세지만 아닐때만 실행
            if (result[key].unread !== 0 && result[key].write !== uid && result[key].read[uid] !== 1) {
              result[key].unread -= 1;              
              result[key].read[uid] = 1;
            }            
          }
          firebase.database().ref(`myChat/room/${key}/item`).set(result)
        }
      })
      // 메세지 리스닝
      messageOn.on('value', snap => {
          let result = snap.val();
          if (result) {
              //  로컬스토리지 재정의
              if (chatDate === today) {
                myStorage[key][today] = result;
              }
              
              commit('GET_MESSAGE', result)
              localStorage.setItem('myChatMessage', JSON.stringify(myStorage));              
          } else {
              commit(ROOT.GET_MESSAGE_REQ_FAIL, null, { root: true })
          }
      })
  },
  *ROOMOUT(){
    yield call(() => {
      return new Promise(() => {
          // 방나감
          firebase.database().ref(`myChat/room/${arguments[1]}/isLogin/${this.state.auth.uid}`).set(0)
          // 메세지 리스너 해제
          if (messageOn) {
            messageOn.off('value')
          }          
      })
    })
  },
  *GET_OLD_MESSAGE() {        
      yield put(ROOT.GET_OLD_MESSAGE_REQ_WAIT)

      let oldMsg = localStorage.getItem('myChatMessage'),
          data = arguments[1];
      
      if (oldMsg) {
          let parser = JSON.parse(oldMsg), 
              obj = {}
          

          for (let key in parser[data.key]) {
              // 오늘 데이터는 제외              
              if (key != data.today) {
                  obj[key] = parser[data.key][key]
              }
          }

          yield put(CHAT.GET_OLD_MESSAGE, obj)
          yield put(ROOT.GET_OLD_MESSAGE_REQ_SUCCESS)
      } else {
          yield put(ROOT.GET_OLD_MESSAGE_REQ_FAIL)
      }      
  },
  *SET_LATEST() {
    let { key } = arguments[1]

    yield call(() => {
      return new Promise(() => {
        if (latestLisner) {
          latestLisner.off('value')
        }

        latestLisner = firebase.database().ref(`myChat/room/${key}/latest`)
        latestLisner.on('value', snap => {
          if (snap.val()) {
            this.commit(CHAT.SET_LATEST, snap.val())
          }
        })
      })
    })
  },
  *REMOVE_LATEST() {
    yield call(() => {
      return new Promise(() => {        
        firebase.database().ref(`myChat/room/${arguments[1]}/latest`).set(false)
        this.commit(CHAT.SET_LATEST, false)
      })
    })
  },
  async SEND_MESSAGE2({ commit }, payload) {
    let { type, write, today, key, text, path } =  payload,
        { chatMember, chatDate, message } = this.state.chat,        
        result = null,
        messageID = firebase.database().ref('myChat/room').push();
   
    messageID = messageID.getKey();

    // 기존 메세지에 신규 메세지 업데이트(vuex)
    message[messageID] = { type, text, write, unread: chatMember.total, read: chatMember.data }

    // message가 url일 경우
    if (urlExp(text)) {
      message[messageID].text = urlify(text)
      message[messageID].vhtml = true
    }
    
    if (type === 1) {
      message[messageID].path = path
    }
    // 클라이언트화면에 먼저 보여줌
    commit(CHAT.GET_MESSAGE, message, { root: true })
    
    result = await new Promise(resolve => {
      // 자정이 될때 날짜가 변경하면서 이전 메세지는 old메세지로 보내고
      // 신규 메세지를 생성시킨다 
      if (chatDate !== today) {
        let noti = [{
              text: today,
              type: 3,
              unread: 0,              
              write: 'admin'
            }];                        

        firebase.database().ref(`myChat/room/${key}/date`).set(today)        
        firebase.database().ref(`myChat/room/${key}/item`).set({ ...noti, ...message })

        resolve(true);
      } else {
        // 서버 저장된 날짜와 메세지 전송시 날짜가 같을때
        // 메세지 저장
        firebase.database().ref(`myChat/room/${key}/item`).set(message, err => {
          if (err === null) {
            result = true;
            resolve(true);            
          } else {
            result = false;
            resolve(false);            
          }
        })
      }
    })
    
    // 챗목록 최근 메세지 1건 수정
    for (let user in chatMember.data) {
      await firebase.database().ref(`myChat/list/${user}/${key}/text`).set(text)  
      // 접속하지 않은 멤버에게 알림보내기
      if (chatMember.data[user] === 0) {
        let alarmRef = firebase.database().ref(`myChat/alarm/${user}/${key}`);
        await alarmRef.once('value', snap => {
          if (snap) {
            alarmRef.set(snap.val() + 1)
          }
        })
      }      
    }    
    
    return result;
  },
  ADD_IMAGE({ commit }, payload) {
      return new Promise(resolve => {
          let file = payload,
              storageRef = firebase.storage().ref(`myChat/${file.name}`),
              task = storageRef.put(file);

          task.on('state_changed', snapshot => {
              let pgr = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              commit(CHAT.SET_PROGRESS, pgr, { root: true })
          }, error => {
                resolve(error.message)
          }, () => {
              task.snapshot.ref.getDownloadURL().then(downloadURL => {
                resolve(downloadURL);
              });
          })  
      })
  },
  // 챗방접속 상태 변경
  SET_JOIN({}, payload) {
    let { type, key } = payload, myUID = this.state.auth.uid;
    firebase.database().ref(`myChat/join/${key}/${myUID}`).set(type === 'IN' ?  1 : 0)
    // 메세지 리스너 해제
    if (messageOn && type === 'OUT') {
      messageOn.off('value')
    }
  },
  GET_CHAT_DATE({ commit }, payload) {
    if (chatDateKey) {
      chatDateKey.off('value');
    }

    return new Promise(resolve => {
      chatDateKey = firebase.database().ref(`myChat/room/${payload.key}/date`)
      chatDateKey.on('value', res => {
        commit('GET_CHAT_DATE', res.val())
        resolve(true)
      })
    })
  }
};


export default {
  namespaced: true,
  state,
  actions,
  rootMutations,
  mutations
}
