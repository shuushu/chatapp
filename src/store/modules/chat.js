import firebase from 'firebase'
import rootMutations from '@/store/mutations'
import { put, call } from "vuex-saga";
import ROOT, { CHAT } from '@/store/namespace'
import { yyyymm, urlExp, urlify } from '@/common/util'
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
    if (chat.roomList) {
      return true
    }

    commit(ROOT.GET_ROOMLIST_REQ_WAIT, null, { root: true })  
        
    await firebase.database().ref(`myChat/list/${auth.uid}`).on('value', res => {
        let result = res.val();

        if (result) {
          for (let key in result) {
            dispatch('GET_CURRENT_MEMBER', key).then(res => {
              result[key].join = res.data
              commit('GET_ROOMLIST', result)
              commit(ROOT.GET_ROOMLIST_REQ_SUCCESS, null, { root: true })
            })
          }

          // 내 방목록 리스트에 join된 멤버의 정보를 맵핑
          // for (let key in result) {
          //   result[key].join = (() => {
          //     let obj = {}, joinMember = result[key].join;                  
          //     for (let i = 0, size = joinMember.length; i < size; i += 1) {
          //         let key = joinMember[i];
          //         // 멤버 정보가 담긴 객체 만들기
          //         if (member.memberList[key]) {
          //           obj[key] = member.memberList[key]
          //         }
          //     }
          //     return obj 
          //   })()
          // }        

        } else {
          commit('GET_ROOMLIST', result)
          commit(ROOT.GET_ROOMLIST_REQ_FAIL, null, { root: true })
        }
    })
  },
  CREATE_ROOM({}, payload) {
      let { member, key } = payload,             
          data = {                          
              state: 1, // 상태: 0 읽음, 1 읽지않음, 2 공지
              text: '방이 개설됨'
          },
          date = new Date(),
          join = {}; // 방에 참여한 멤버들


      return new Promise(resolve => {
        date = yyyymm(date);

        // 1:1 대화이면 프라이빗방에 기록
        if (member.length === 2) {
          firebase.database().ref(`myChat/private/${member[1]}`).child(member[0]).set(key);
          firebase.database().ref(`myChat/private/${member[0]}`).child(member[1]).set(key);
        }
        // 조인테이블 생성        
        for (let i = 0, size = member.length; i < size; i += 1) {
          join[member[i]] = 0
        }
        data.join = join
        firebase.database().ref(`myChat/join/${key}`).set(join)

        // 각 멤버들에게 챗리스트 생성시킨다
        for (let i = 0; i < member.length; i += 1) {
            firebase.database().ref(`myChat/list/${member[i]}`).child(key).update(data);
        }                  
        firebase.database().ref(`myChat/room/${key}`).set({
            date: date,
            item: [{
              write: 'admin',
              text: '방이 개설됨',
              type: 3 // 메세지타입: 0 일반 1 이미지 2 파일 3공지
          }]
        })
        
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
          myStorage = JSON.parse(localStorage.getItem('myChatMessage')),
          obj = {};

      if (messageOn) {
        messageOn.off('value')
      }
      
      if (myStorage === null) {
        obj[key] = {}
        obj[key][today] = {};
        myStorage = obj
      }

      if (!myStorage[key]) {
        myStorage[key] = {};
        myStorage[key][today] = {};
      }
      await dispatch('GET_CURRENT_MEMBER', key)
      commit(ROOT.GET_MESSAGE_REQ_WAIT, null, { root: true })
      // 알람갱신
      firebase.database().ref(`myChat/alarm/${uid}/${key}`).set(0)
      
      // 현재 날짜가 룸 날짜가 다르면 챗방 날짜 변경하고 날자 알림 메세지
      if (chatDate !== today) {
        firebase.database().ref(`myChat/room/${key}/date`).set(today)
        firebase.database().ref(`myChat/room/${key}/item`).set([{
          text: today,
          type: 3,
          write: 'admin'                
        }])
      }
      // 메세지 감시
      messageOn = firebase.database().ref(`myChat/room/${key}/item`)      
      messageOn.on('value', snap => {
          // async function seqStep() {
          //   for(let key in result) {
          //     if (result[key].unread !== undefined) {
          //       if (result[key].unread[this.state.auth.uid]) {
          //         result[key].unread[this.state.auth.uid] = 0
          //         await firebase.database().ref(`myChat/room/${data.key}/item/${key}/unread/${this.state.auth.uid}`).set(0)
          //       }
          //     }
          //   }
          //   await this.commit(CHAT.GET_MESSAGE, result)
          //   await this.commit(ROOT.GET_MESSAGE_REQ_SUCCESS)
          // }  
          // 현재 접속 멤버 state에 반영


          let result = snap.val();
           if (result) {
              if (chatDate === today) {
                  //myStorage[key][today] = result;
              }                  
              commit('GET_MESSAGE', result)
              //seqStep.call(this)
              localStorage.setItem('myChatMessage', JSON.stringify(myStorage));
              
          } else {
              commit(ROOT.GET_MESSAGE_REQ_FAIL, null, { root: true })
          }
      })
      
      // 입장상태
      firebase.database().ref(`myChat/room/${key}/isLogin/${uid}`).set(1)
      // return false;
      
      // yield call(() => {
      //   return new Promise(() => {
      //       let myStorage = {},
      //           data = arguments[1],
      //           chatDate = this.state.chat.chatDate;

                
      //       // 머지하기 위해
      //       myStorage = JSON.parse(localStorage.getItem('myChatMessage'));
      //       if (myStorage === null) {
      //         let obj = {};
      //         obj[data.key] = {};
      //         obj[data.key][data.today] = {};
      //         myStorage = obj;
      //       }

      //       if (!myStorage[data.key]) {
      //         myStorage[data.key] = {};
      //         myStorage[data.key][data.today] = {};
      //       }



      //       messageOn = firebase.database().ref(`myChat/room/${data.key}/item`)
      //       messageOn.on('value', snap => {
      //           async function seqStep() {
      //             for(let key in result) {
      //               if (result[key].unread !== undefined) {
      //                 if (result[key].unread[this.state.auth.uid]) {
      //                   result[key].unread[this.state.auth.uid] = 0
      //                   await firebase.database().ref(`myChat/room/${data.key}/item/${key}/unread/${this.state.auth.uid}`).set(0)
      //                 }
      //               }
      //             }
      //             await this.commit(CHAT.GET_MESSAGE, result)
      //             await this.commit(ROOT.GET_MESSAGE_REQ_SUCCESS)
      //           }  

      //           let result = snap.val();
      //            if (result) {
      //               if (chatDate === data.today) {
      //                   myStorage[data.key][data.today] = result;
      //               }                  
      //               seqStep.call(this)
      //               localStorage.setItem('myChatMessage', JSON.stringify(myStorage));
                    
      //           } else {
      //               this.commit(ROOT.GET_MESSAGE_REQ_FAIL)
      //           }
      //       })


      //   })
      // })
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
  async SEND_MESSAGE2({ commit, dispatch }, payload) {
    let { type, write, today, key, text, path } =  payload,
        { chatMember, chatDate, message } = this.state.chat;

    // 기존 메세지에 신규 메세지 업데이트(vuex)
    message[key] = { type, text, write, today }

    // message가 url일 경우
    if (urlExp(text)) {
      message[key].text = urlify(text)
      message[key].vhtml = true
    }
    
    if (type === 1) {
      message[key].path = path
    }

    commit(CHAT.GET_MESSAGE, message, { root: true })
    
    // 비지니스 로직
    let isSuccess = new Promise(resolve => {
        // 자정이 될때 날짜가 변경하면서 이전 메세지는 old메세지로 보내고
        // 신규 메세지를 생성시킨다 
        if (chatDate !== today) {
          let roomkey = firebase.database().ref('myChat/room').push(),
              noti = [{
                text: today,
                type: 3,
                write: 'admin'
              }];
                
          roomkey = roomkey.getKey()  

          firebase.database().ref(`myChat/room/${key}/date`).set(today)        
          firebase.database().ref(`myChat/room/${key}/item`).set({ ...noti, ...message })
          resolve(true);          
        } else {
          // 서버 저장된 날짜와 메세지 전송시 날짜가 같을때
          // 메세지 저장
          msgKey = firebase.database().ref(`myChat/room/${key}/item`).push(message).push(msgData, error => {
            if (error) {
              resolve(false);
            } else {
              resolve(true);
            }    
          })
        }
    })
    // 메세지가 성공일때
    if (isSuccess) {  
      // 챗방 최근 메세지 저장    
      //await firebase.database().ref(`myChat/room/${key}/latest`).set(message)
      // 현재 방 멤버들 접속 상태 확인
      await firebase.database().ref(`myChat/join/${key}`).once('value').then(res => {
        if (res.val()) {
          dispatch('dialogAlert', { message: '접속멤버 확인 불가' })
        } else {          
          commit(ROOT.SEND_MESSAGE_REQ_FAIL, null, { root: true });
          return false
        }
      })
      // 챗 알림메세지
      // setAlarm({
      //   myuid: this.state.auth.uid,
      //   chatMember: chatMember,
      //   key: key,
      //   text: text
      // })
      
      commit(ROOT.SEND_MESSAGE_REQ_SUCCESS, null, { root: true });
      resolve(true)
    } else {
      commit(ROOT.SEND_MESSAGE_REQ_FAIL, null, { root: true });
      return false
    }
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
  // 챗방접속 상택
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
        commit(CHAT.GET_CHAT_DATE, res.val(), { root: true })
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
