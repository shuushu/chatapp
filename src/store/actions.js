import firebase from 'firebase'
import ROOT, { ERROR } from './namespace'

let listner;
export default {
  loginEmail({ commit, dispatch }, payload) {
    let { id, pw } = payload;
    commit(ROOT.LOGIN_EMAIL_REQ_WAIT)

    firebase.auth().signInWithEmailAndPassword(id, pw).catch(error => {
      commit(ROOT.LOGIN_EMAIL_REQ_FAIL)
      dispatch('dialogAlert', {
        message: ERROR[error.code]
      })      
    })
    .then(result => {
      let { displayName, uid, email, photoURL } = result.user;
      photoURL = 'http://placehold.it/60x60';
      displayName = displayName || email;

      firebase.database().ref('myChat/users').child(uid).set({
        displayName, uid, email, photoURL
      });

      commit(ROOT.LOGIN_EMAIL_REQ_SUCCESS)
    })
  },
  async createMailID({ commit, dispatch }, payload) {
    let { id, pw, name, thumb } = payload;
    let photo = null;

    commit(ROOT.CREATE_AUTH_REQ_WAIT)
    // 썸네일이 등록되면...
    if (thumb) {
      photo = await dispatch('chat/ADD_IMAGE', thumb)
    }

    await firebase.auth().createUserWithEmailAndPassword(id, pw).catch(error => {
        commit(ROOT.CREATE_AUTH_REQ_FAIL)
        dispatch('dialogAlert', {
          message: ERROR[error.code]
        }) 
      })
      .then(result => {
        if (result) {
          let { uid } = result.user,
              userData = {};
              
          userData[uid] = {
            email: id,
            displayName: name,
            photoURL: photo || 'http://placehold.it/60x60',
            uid: uid
          };
          firebase.database().ref('myChat/users').update(userData);
          commit(ROOT.CREATE_AUTH_REQ_SUCCESS);
        }
      })
  },
  loginGoogle ({ commit, dispatch }) {
    commit(ROOT.LOGIN_GOOGLE_AUTH_REQ_WAIT)
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    
    firebase.auth().signInWithPopup(provider).then(result => {
      if (result) {
        let { displayName, uid, email, photoURL } = result.user;

        firebase.database().ref('myChat/users').child(uid).set({
          displayName, uid, email, photoURL
        });

        commit(ROOT.LOGIN_GOOGLE_AUTH_REQ_SUCCESS)
      }
    }).catch(error => {        
      commit(ROOT.LOGIN_GOOGLE_AUTH_REQ_FAIL)
      dispatch('dialogAlert', {
        message: ERROR[error.code]
      })        
    })
  },
  dialogAlert ({ commit }, payload) {
    commit(ROOT.POPUP_ALERT, payload)
  },
  logout({ dispatch }) {
      return new Promise(resolve => {
          firebase.auth().signOut().then(() => {
            // state 리셋
            dispatch('dialogAlert', {
              message: '로그아웃 되었습니다'
            })
            
            resolve(true)    
          }).catch(error => {          
            console.log(error)
            dispatch('dialogAlert', {
              message: ERROR[error.code]
            })        
            resolve(false)
          });
      })
  },
  dialogConfirm({ commit }, payload) {
    commit(ROOT.POPUP_CONFIRM, payload)
  },
  getAlarm({ commit }) {
      if (listner) {
        listner.off('value')
      }
      // 알림 수신 켜기
      listner = firebase.database().ref(`myChat/alarm/${this.state.auth.uid}`)
      listner.on('value', snap => {
        let value = snap.val(), total = 0;
        if (value) {
            for (let i in value) {
                total += value[i];
            }
            value.total = total

            commit(ROOT.ALARM_ON, value)
        } else {
          commit(ROOT.ALARM_ON, {
            item: {},
            total: 0
          })
        }
    })
  },
  getAlarmOFF({ commit }) {
    if (listner) {
      listner.off('value')
    }
    commit(ROOT.ALARM_ON, {
      item: {},
      total: 0
    })
  },
  invite({ commit }, payload) {
    let value = payload === undefined ? !this.state.invite : payload;
    commit(ROOT.SET_INVITE, value)
  }  
}
