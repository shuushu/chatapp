import Vue from 'vue'
import VueRouter from 'vue-router'
import firebase from "firebase"
import store from '../store'
Vue.use(VueRouter)
Vue.component('router-link', Vue.options.components.RouterLink)
Vue.component('router-view', Vue.options.components.RouterView)

const routerMap = [
  { name: 'login', path: '/login', component: '/Login'},
  { name: 'list', path: '/list', component: '/List'},  
  { name: 'member', path: '/member', component: '/Member'},
  { name: 'ready', path: '/ready', component: '/Ready'},
  { name: 'message', path: '/message/:id', component: '/Message'},
  { name: 'list', path: '/', component: '/List'},
  { name: 'error', path: '*', component: '/Error'}  
];

const redirectRoute = [
  { path: '/', exact: 'exact', redirect: 'login' }
];

const routes = [...routerMap.map(route => {
  const { name, path, component } = route;

  return {
    path,
    name,
    component: () => import(`../container${component}`)
  }
}), ...redirectRoute];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  //base: __dirname,
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
        return savedPosition
    } else {
        return {  
            selector: '.page',
            x: 0, 
            y: 0 
        }
    }
  }
});

router.beforeEach((to, from, next) => {
    firebase.auth().onAuthStateChanged(user => {        
      if (user) {
        let { uid } = user;
        // session init 
        // 스토어에 세션값이 저장되면 그 후 실행 하지 않음
        if (store.state.auth === null) {
          firebase.database().ref('myChat/users').child(uid).once('value').then(res => {
            let { uid, email, displayName, photoURL } = res.val()
            if (res.val()) {
              store.commit('SET_AUTH',  { uid, email, displayName, photoURL })
              store.dispatch('getAlarm')
            }
          })
        }

        if (to.name === 'login') {
          // 홈으로 이동
          next('/member')
        } else {
          // 현재페이지
          next()
        }
      } else {
        setTimeout(() => {
          store.commit('SET_AUTH',  null)
          store.dispatch('getAlarmOFF')
        }, 300)

        if(to.name === 'login') {
          next()
        } else {
          next('/login')
        }
      }
    })
});

export default router
