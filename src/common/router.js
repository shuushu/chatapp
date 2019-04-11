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
  base: '/chat',
  //base: __dirname,
  routes
});


router.beforeEach((to, from, next) => {
    // 실시간 로그인 인증상태 감시
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            if (!store.state.auth) {
                firebase.database().ref(`myChat/users/${user.uid}`).once('value').then(result => {
                    store.commit('SESSION_AUTH', result.val())

                    if (to.name === 'login') {
                        // 홈으로 이동
                        next('/member')
                    } else {
                        // 현재페이지
                        next()
                    }
                })
            } else {
                if (to.name === 'login') {
                    // 홈으로 이동
                    next('/member')
                } else {
                    // 현재페이지
                    next()
                }
            }
        } else {
            // 비로그인 > 경로가 로그인 페이지이면
            if(to.name === 'login') {
                next()
            } else {
                next('/login')
            }
        }
    })
});

export default router
