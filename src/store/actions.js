import firebase from 'firebase'
import { put, call } from "vuex-saga"
import ROOT from './namespace'

export default {
  *loginEmail(store, { id, pw }) {
    yield put(ROOT.LOGIN_EMAIL_REQ_WAIT)

    return yield call(() => {
      return new Promise((resolve) => {
        firebase.auth().signInWithEmailAndPassword(id, pw)
            .catch(error => {
              resolve({ ...error, state: false })
              this.commit(ROOT.LOGIN_EMAIL_REQ_FAIL)
            })
            .then(result => {
              if (result) {
                resolve({ state: true });
                this.commit(ROOT.LOGIN_EMAIL_REQ_SUCCESS)
              }
            })
        })
    })
  },
  *createMailID(store, { id, pw, name }) {
    yield put(ROOT.CREATE_AUTH_REQ_WAIT)

    return yield call(() => {
      return new Promise((resolve) => {
        firebase.auth().createUserWithEmailAndPassword(id, pw)
          .catch(error => {
            this.commit(ROOT.CREATE_AUTH_REQ_FAIL);
            resolve({ ...error, state: false })
          })
          .then(result => {
            if (result) {
              let { uid } = result.user,
                  userData = {};

              userData[uid] = {
                email: id,
                displayName: name,
                photoURL: 'http://placehold.it/60x60',
                uid: uid
              };

              firebase.database().ref('myChat/users').update(userData);
              this.commit(ROOT.CREATE_AUTH_REQ_SUCCESS);
              resolve({ state: true });
            }
          })
      })
    })
  },
  *loginGoogle () {
    yield put(ROOT.LOGIN_GOOGLE_AUTH_REQ_WAIT)

    return yield call(() => {
      return new Promise(resolve => {
        let provider = new firebase.auth.GoogleAuthProvider();

        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

        firebase.auth().signInWithPopup(provider).then(result => {
          if (result) {
            let { displayName, uid, email, photoURL } = result.user;

            resolve(Object.assign({
              displayName,
              uid,
              email,
              photoURL
            }, { state: true }))

            firebase.database().ref('myChat/users').child(uid).set({
              displayName, uid, email, photoURL
            });

            this.commit(ROOT.LOGIN_GOOGLE_AUTH_REQ_SUCCESS)
          }
        }).catch(error => {
          resolve({ ...error, state: false })
          this.commit(ROOT.LOGIN_GOOGLE_AUTH_REQ_FAIL)
        })
      })
    });
  },
  *getSession(store) {
    let { auth } = store.state;

    return yield call(() => {
      return new Promise(resolve => {
        if (auth === null) {
          // 로그인 인증상태
          firebase.auth().onAuthStateChanged(user => {
            if (user) {
              firebase.database().ref(`myChat/users/${user.uid}`).once('value').then(result => {
                store.commit(ROOT.SESSION_AUTH, result.val())
                resolve(result.val())
              })
            } else {
              store.commit(ROOT.SESSION_OUT, null)
            }
          })
        } else {
          resolve(auth)
        }
      })
    })
  },
  *logout() {
    return yield call(() => {
      return new Promise(resolve => {
        firebase.auth().signOut().then(() => {
          resolve(true)
        }).catch(error => {
          resolve(false, error)
        });
      })
    })
  },
  *dialogAlert() {
    yield put(ROOT.POPUP_ALERT, arguments[1])
  },
  *dialogConfirm() {
    yield put(ROOT.POPUP_CONFIRM, arguments[1])
  },
  *invite() {        
    yield put(ROOT.SET_INVITE, !this.state.invite)
  },
  *getDeviceHeight() {       
    yield put(ROOT.DEVICE_HEIGHT, arguments[1])
  }  
}
