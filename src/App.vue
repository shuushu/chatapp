<template>
  <div id='app' :class="classes.isOnepage">
      <header id="header" v-if="!this.onepage">
        <transition name="head">
          <MsgHeader v-if="this.$route.name ==='message'" :alarm="alarm.total" />
          <Header :alarm="alarm.total" :name="this.$route.name" v-else />
        </transition>
      </header>
      
      <transition :name="name">
        <router-view />
      </transition>
      <footer id="footer" v-if="!this.onepage">
        <transition name="msgform">
            <MessageForm v-if="this.$route.name ==='message'" />
            <Footer v-else />
        </transition>        
      </footer>

      
      <!-- dialog -->
      <md-dialog-alert v-if="popupAlert.isShow" id="popupAlert"
        :md-active.sync="popupAlert.isShow"
        :md-content="popupAlert.message"
        md-confirm-text="확인"
      />

      <md-dialog-confirm v-if="popupConfirm.isShow" id="popupConfirm"
        :md-active.sync="popupConfirm.isShow"
        :md-title="popupConfirm.name"
        :md-content="popupConfirm.message"
        @md-confirm="popupConfirm.action(popupConfirm)"
      />
  </div>
</template>


<script>
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import MessageForm from "@/components/MessageForm"
import MsgHeader from "@/components/MsgHeader"
import { mapState } from 'vuex'

const onepageList = ['login'];

export default {
  name: 'app',
  components: { Footer, Header, MessageForm, MsgHeader },
  data () {
    return {
      name: '',
      onepage: false
    }
  },
  computed: {
    classes() {
      return {
        isOnepage: {
          'onepage': this.onepage
        }
      }
    },
    ...mapState({
      alarm: state => state.alarm,
      popupAlert: state => state.popupAlert,
      popupConfirm: state => state.popupConfirm
    })
  },
  watch: {
    $route (to, from) {
      this.$run('getDeviceHeight', window.innerHeight)
      this.routeUpdate(to, from)
    }
  },
  methods: {
    routeUpdate (to, from) {
      const { name } = this.$route;

      this.onepage = onepageList.includes(name);  
      //새로고침일 경우 무시
      if (from.name === null ) {
          return  true;
      }
      if (to.name === 'message' && from.name === 'list' && name === 'message') {
        this.name = 'message'
      } else if (to.name === 'list' && from.name === 'message' && name === 'list') {
        this.name = 'list'
      } else {
        this.name = 'none'
      }
    }
  }
}
</script>

<style lang="scss">
#app{    
  //position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0;
  &.onepage{
    padding: 0;
  }
  .md-toolbar{
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 21;  
    transition: all 200ms;  
    // 헤더 제목
    .head-title{
      font-weight: normal;
      font-size: 20px;
    }
  }
  // 메세지헤더
  .chat-header{
    background-color: #666;
  }  
}

  .item-list-wrap{
    padding: 0 16px;
  }
  .md-list {
    width: 100%;
    max-width: 100%;
    display: inline-block;
    vertical-align: top;
  }
  #container{
    position: relative;
    display: flex;
    height: 100%;
    width: 100%;
    border: 1px solid #000;
  }
  .md-bottom-bar>.md-ripple{
    justify-content: space-between;
  }

  .wrap-center{
    position: fixed;
    width: 100%;
    display: flex;
    left: 0;
    justify-content: center;
    top: 0;
    align-items: center;
    height: 100%;
    z-index: 100;
  }
  .page{
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background-color: #fff;
      overflow: auto;
      transition: all 500ms;
      > div{
        padding: 60px 0;
      }
  }
//에러페이지
.md-empty-state-wrap{
  position: fixed;
  height: 100%;
  left: 0;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  .md-empty-state{
    padding: 0;
  }
}
#footer{
   .form-area{
      position: fixed;
      width: 100%;
      box-sizing: border-box;
      left: 0;
      bottom: 0;
      z-index: 30;
      padding: 0 130px 0 60px;
      background: rgba(255, 255, 255, .9);
      box-shadow: 1px 3px 10px #333;
      transition: all 400ms;
      .file-hidden{      
        position: absolute;
        top: 0;
        left: 0;
        margin: 0;
        opacity: 0;
      }
      .add-file-close{
        position: absolute;
        right: 0;
        top: 0;
      }
      .add-file-close i{
        color: #000;
      }
      .add-file{
        position: absolute;
        left: 10px;
        top: 17px;
      }
      .send{
        position: absolute;
        right: 13px;
        top: 14px;
        .text{
          font-size: 16px;
          position: relative;
          margin-left: 5px;
          top: 3px
        }    
        i{        
          font-size: 18px !important;
        }
      }
  }
}
// animate
// .message-leave {
//   transform: translate3d(0%, 0, 0);
// }
// .message-leave-active{
//   transform: translate3d(100%, 0, 0);
// }
// .message-leave-to{
//   transform: translate3d(100%, 0, 0);
// }
//  챗뷰진입
.message-enter-active {
  transform: translate3d(0, 0, 0);  
}
.message-enter {
  transform: translate3d(100%, 0, 0);
}
.list-leave-active {
  transform: translate3d(100%, 0, 0);
}
.list-leave{
  transform: translate3d(0, 0, 0);
}

// 챗뷰 반출
.list-enter {
  transform: translate3d(-40%, 0, 0);
}
.message-leave{
  transform: translate3d(0, 0, 0);
}
.message-leave-to{
  transform: translate3d(-30%, 0, 0);
}

.none-enter,
.none-enter-active,
.none-enter-to{
  z-index: 3;
}

// 풋터 입력폼
// .form-enter{
//   transform: translate3d(0, 176px, 0);
// }
.msgform-enter-active {
  transform: translate3d(0, 76px, 0);
}

.msgform-leave-active{
  transform: translate3d(0, 76px, 0);
}
.head-enter-active {
  transform: translate3d(0, -76px, 0);
}
.head-leave-active{
  transform: translate3d(0, -76px, 0);
}
body{
  overflow-x: hidden;
  // 팝업 BG
  .md-overlay {
    z-index: 30;
  }
  .md-dialog {
    z-index: 40;
  }
}

.inviteWrap + #footer .form-area{  
  transition: all 500ms;
  transform: translate3d(0, 76px, 0);
}
</style>
