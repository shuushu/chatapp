import firebase from 'firebase'
import rootMutations from '@/store/mutations'
import { put, call } from "vuex-saga";
import ROOT, { CHAT } from '@/store/namespace'
import { yyyymm, urlExp, urlify } from '@/common/util'

let roomListOn, 
    messageOn,
    chatDateKey,
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
  /*
    @members 유저 UID { Array }
  */
  *GET_ROOMLIST() {
    if (this.state.roomList) {
      return true
    }
    
    yield put(ROOT.GET_ROOMLIST_REQ_WAIT)

    yield call(() => {
      return new Promise(() => {
        const UID = this.state.auth.uid,
              members = this.state.member.memberList;

        roomListOn = firebase.database().ref(`myChat/list/${UID}`);
        roomListOn.on('value', (res) => {
          let result = res.val();

          if (result) {
              /*
                @params 룸리스에 조인됨 멤버들 { Array }
              */                           
              let mappingToMember = (joinMember) => { 
                  let obj = {};                  
                  for (let i = 0, size = joinMember.length; i < size; i += 1) {
                      let key = joinMember[i];
                      // 멤버 정보가 담긴 객체 만들기
                      if (members[key]) {
                        obj[key] = members[key]
                      }
                  }
                  return obj                  
              }
              // 내 방목록 리스트에 join된 멤버의 정보를 맵핑
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
            // 알람갱신
            firebase.database().ref(`myChat/alarm/${this.state.auth.uid}/${data.key}`).set(0)
                
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
                async function seqStep() {
                  for(let key in result) {
                    if (result[key].unread !== undefined) {
                      if (result[key].unread[this.state.auth.uid]) {
                        result[key].unread[this.state.auth.uid] = 0
                        await firebase.database().ref(`myChat/room/${data.key}/item/${key}/unread/${this.state.auth.uid}`).set(0)
                      }
                    }
                  }
                  await this.commit(CHAT.GET_MESSAGE, result)
                  await this.commit(ROOT.GET_MESSAGE_REQ_SUCCESS)
                }  

                let result = snap.val();
                 if (result) {
                    if (chatDate === data.today) {
                        myStorage[data.key][data.today] = result;
                    }                  
                    seqStep.call(this)
                    localStorage.setItem('myChatMessage', JSON.stringify(myStorage));
                    
                } else {
                    this.commit(ROOT.GET_MESSAGE_REQ_FAIL)
                }
            })

            // 입장상태
            firebase.database().ref(`myChat/room/${data.key}/isLogin/${this.state.auth.uid}`).set(1)
        })
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
  *SEND_MESSAGE() {
      // 메세지 전송로직: 다음 로직은 순차처리 되어야 한다.
      async function setAlarm(recive) {
        let { myuid, chatMember, key, text } = recive, 
            temp = {};

        for (let i = 0, size = chatMember.length; i < size; i += 1) {          
          if (myuid !== chatMember[i]) {
            // 채팅방에 현재 접속자를 조회
            let isEnjoy = await firebase.database().ref(`myChat/room/${key}/isLogin/${chatMember[i]}`).once('value').then(res => {
              return res.val()
            });
            // 현재 접속하지 않을때
            if (isEnjoy !== 1) {
              temp[chatMember[i]] = 1;
              let getAlarmCnt = await firebase.database().ref(`myChat/alarm/${chatMember[i]}/${key}`).once('value').then(res => {
                return res.val() || 0
              })
              await firebase.database().ref(`myChat/alarm/${chatMember[i]}/${key}`).set(getAlarmCnt +1)
            }
          }
          // 해당 챗 목록 최근 메세지 한줄 갱신
          firebase.database().ref(`myChat/list/${chatMember[i]}/${key}/text`).set(text)      
        }
        
        firebase.database().ref(`myChat/room/${key}/item/${msgKey.key}/unread`).update(temp)
      }


      let { type, write, today, key, text, path } = arguments[1],
          { chatMember, chatDate } = this.state.chat,
          msgData =  { type, text, write },
          msgKey = '';
      
      yield put(ROOT.SEND_MESSAGE_REQ_WAIT)
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
      let pushMsg = yield call(() => {
        return new Promise(resolve => {
          if (chatDate !== today) {
            let oobj = {},
                roomkey = '',
                noti = [{
                  text: today,
                  type: 3,
                  write: 'admin'
                }];
    
            roomkey = firebase.database().ref('myChat/room').push(),
            roomkey = roomkey.getKey()  
            oobj[roomkey] = msgData
    
            firebase.database().ref(`myChat/room/${key}/date`).set(today)        
            firebase.database().ref(`myChat/room/${key}/item`).set({ ...noti, ...oobj })
            resolve(true);
          } else {
            msgKey = firebase.database().ref(`myChat/room/${key}/item`).push(msgData, error => {
              if (error) {
                resolve(false);
              } else {
                resolve(true);
              }    
            })
          }
          // reolveEND
        })
      })
      // 메세지가 성공일때
      if (pushMsg) {
          return yield call(() => {
            return new Promise(resolve => {
                // 챗 알림메세지
                firebase.database().ref(`myChat/room/${key}/latest`).set(msgData)
                setAlarm({
                  myuid: this.state.auth.uid,
                  chatMember: chatMember,
                  key: key,
                  text: text
                })
              this.commit(ROOT.SEND_MESSAGE_REQ_SUCCESS);
              resolve(true)
            })
          })        
      } else {
        this.commit(ROOT.SEND_MESSAGE_REQ_FAIL);
        return false
      }      


 

      // for (let i = 0, size = chatMember.length; i < size; i += 1) {
      //   // 챗리스트 한줄 갱신
      //   firebase.database().ref(`myChat/list/${chatMember[i]}/${key}/text`).set(text)
      //   // 상대방이 챗팅방에 없으면 알림으로 표시
      //   if (this.state.auth.uid !== chatMember[i]) {
      //       async function setAlarm() {
      //         let isEnjoy = await firebase.database().ref(`myChat/room/${key}/isLogin/${chatMember[i]}`).once('value').then(res => {
      //             return res.val()
      //         });
      //         // 현재 접속하지 않을때
      //         if (isEnjoy === 0) {
      //           let getAlarmCnt = await firebase.database().ref(`myChat/alarm/${chatMember[i]}/${key}`).once('value').then(res => {
      //             return res.val() || 0
      //           })
      //           await firebase.database().ref(`myChat/alarm/${chatMember[i]}/${key}`).set(getAlarmCnt +1)                
      //         }

      //         return true;
      //       }
      //       return setAlarm();
      //   }
      // }

      
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
    if (chatDateKey) {
      chatDateKey.off('value');
    }

    return yield call(() => {
      return new Promise(resolve => {
        chatDateKey = firebase.database().ref(`myChat/room/${data.key}/date`)
        chatDateKey.on('value', res => {
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
