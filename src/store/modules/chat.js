import firebase from 'firebase'
import rootMutations from '@/store/mutations'
import { put, call } from "vuex-saga";
import ROOT, { CHAT } from '@/store/namespace'
import { yyyymm, urlExp, urlify } from '@/common/util'

let roomListOn, messageOn;

let state = {
  roomList: null,
  message: null,
  oldMsg: null,
  progress: 0,
  chatMember: null,
  chatDate: null
};

const mutations = {
  GET_ROOMLIST: (state, data) => {
    state.roomList = data
  },
  GET_MESSAGE: (state, data) => {
    state.message = data
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
  /*
    @members 유저 UID { Array }
  */
  *GET_ROOMLIST(store, members) {
    if (store.state.roomList) {
      return true
    }
    
    yield put(ROOT.GET_ROOMLIST_REQ_WAIT)

    yield call(() => {
      return new Promise(() => {
        const UID = store.rootState.auth.uid;

        roomListOn = firebase.database().ref(`myChat/list/${UID}`);
        roomListOn.on('value', (res) => {
          let result = res.val();

          if (result) {
              // join멤버 맵핑
              let mappingToMember = (joinMember) => { 
                  let obj = {};                  
                  for (let i = 0, size = joinMember.length; i < size; i += 1) {
                      let key = joinMember[i];
                      
                      obj[key] = members[key]                      
                  }
                  return obj                  
              }

              for (let key in result) {
                result[key].join = mappingToMember(result[key].join)
              }        
              this.commit(CHAT.GET_ROOMLIST, result)
              this.commit(ROOT.GET_ROOMLIST_REQ_SUCCESS)
          } else {
              this.commit(CHAT.GET_ROOMLIST, null)
              this.commit(ROOT.GET_ROOMLIST_REQ_FAIL)
          }
        })
      })
    });
  },
  /*
    @date client 오늘 날짜 { String }
   */
  *GET_MESSAGE() {    
      if (messageOn) {
        messageOn.off('value')
      }
      
      yield put(ROOT.GET_MESSAGE_REQ_WAIT)
      
      yield call(() => {
        return new Promise(() => {
            let myStorage = {},
                data = arguments[1],
                chatDate = this.state.chat.chatDate;
                
            // 머지하기 위해
            myStorage = JSON.parse(localStorage.getItem('myChatMessage'));
            if (myStorage === null) {
              let obj = {};
              obj[data.key] = {};
              obj[data.key][data.today] = {};
              myStorage = obj;
            }

            if (!myStorage[data.key]) {
              myStorage[data.key] = {};
              myStorage[data.key][data.today] = {};
            }

            // 날짜가 변경될 때
            if (chatDate !== data.today) {
              firebase.database().ref(`myChat/room/${data.key}/date`).set(data.today)
              firebase.database().ref(`myChat/room/${data.key}/item`).set([{
                text: data.today,
                type: 3,
                write: 'admin'                
              }])
            }

            messageOn = firebase.database().ref(`myChat/room/${data.key}/item`)            
            messageOn.on('value', snap => {
                 if (snap.val()) {
                   if (chatDate === data.today) {
                      myStorage[data.key][data.today] = snap.val();
                   }
                    
                    localStorage.setItem('myChatMessage', JSON.stringify(myStorage));
                    this.commit(CHAT.GET_MESSAGE, snap.val())
                    this.commit(ROOT.GET_MESSAGE_REQ_SUCCESS)
                } else {
                    this.commit(ROOT.GET_MESSAGE_REQ_FAIL)
                }
            })
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
  *SEND_MESSAGE() {
      let { type, write, today, key, text, path } = arguments[1],
          msgData =  { type, text, write },
          chatMember = this.state.chat.chatMember,
          chatDate = this.state.chat.chatDate;
          
      // 전송할때마다 시간 체크
      today = new Date();
      today = yyyymm(today);

      // message가 url일 경우
      if (urlExp(text)) {
        msgData.text = urlify(text)
        msgData.vhtml = true
      }

      if (type === 1) {
        msgData.path = path
      }

      // 날짜가 변경될 때 chatDate 서버기록 날짜
      if (chatDate !== today) {
        let oobj = {},
            tempKey = firebase.database().ref('myChat/room').push(),
            noti = [{
              text: today,
              type: 3,
              write: 'admin'
            }];
        
        tempKey = tempKey.getKey()  
        oobj[tempKey] = msgData

        firebase.database().ref(`myChat/room/${key}/date`).set(today)        
        firebase.database().ref(`myChat/room/${key}/item`).set({ ...noti, ...oobj })
      } else {
        firebase.database().ref(`myChat/room/${key}/item`).push(msgData)
      }
      
      for (let i = 0, size = chatMember.length; i < size; i += 1) {
        firebase.database().ref(`myChat/list/${chatMember[i]}/${key}/text`).set(text)
      }

      yield put(ROOT.SEND_MESSAGE_REQ_SUCCESS);
  },
  *ADD_IMAGE() {
      let file = arguments[1];
      return yield call(() => {
        return new Promise(resolve => {
            let storageRef = firebase.storage().ref(`myChat/${file.name}`),
            task = storageRef.put(file);

            task.on('state_changed', snapshot => {
                let pgr = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                this.commit(CHAT.SET_PROGRESS, pgr)
            }, error => {
                  resolve(error.message)
            }, () => {
                task.snapshot.ref.getDownloadURL().then(downloadURL => {
                  resolve(downloadURL);
                });
            }) 
        })
      })  
  },
  *GET_CHAT_MEMBER() {
    let data = arguments[1];

    yield call(() => {
      return new Promise(() => {
        firebase.database().ref(`myChat/room/${data.key}/members`).once('value').then(res => {
          this.commit(CHAT.GET_CHAT_MEMBER, res.val())
        })
      })
    })
  },
  *GET_CHAT_DATE() {
    let data = arguments[1];

    return yield call(() => {
      return new Promise(resolve => {
        firebase.database().ref(`myChat/room/${data.key}/date`).on('value', res => {
          this.commit(CHAT.GET_CHAT_DATE, res.val())
          resolve(true)
        })
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
