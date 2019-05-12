<template>
  <div id="message"  class="page" :class="{ inviteWrap:invite }">
    <div class="message-wrap" :style="`min-height:${this.$route.params.h-80}px`">
        <!-- 이전 메세지 -->
        <div class="old-items" v-for="(date, pk) in oldMsg" :key="`old-${pk}`">
          <div class="talk-items" :class="isWrite(item.write)" v-for="(item, key) in date" :key="`old-item-${key}`">              
              <div class="img-wrap" v-if="isWrite(item.write) != 'notice'">
                <md-avatar>            
                  <img :src="mappingAvatar(item.write)" :alt="mappingUserName(item.write)">
                </md-avatar>
                <span class="name">{{ mappingUserName(item.write) }}</span>
              </div>
              <div class="talk-wrap">
                  <Talkbox :class="isWrite(item.write)">
                    <div class="addfile-image" v-if="item.type === 1"><img :src="item.path" alt=""></div>
                    <span v-if="item.vhtml" v-html="item.text"></span>
                    <span v-else>{{ item.text }}</span>                    
                  </Talkbox>
              </div>              
          </div>        
        </div>
        <!-- 신규 메세지 -->        

        <div class="talk-items" :class="isWrite(msg.write)" v-for="(msg, pk, i) in message" :key="pk">
          <div class="img-wrap" v-if="isWrite(msg.write) != 'notice'">
            <md-avatar>            
              <img :src="mappingAvatar(msg.write)" :alt="mappingUserName(msg.write)">
            </md-avatar>
            <span class="name">{{ mappingUserName(msg.write) }}</span>
          </div>
          <div class="talk-wrap">
              <Talkbox :class="isWrite(msg.write)">
                <div class="addfile-image" v-if="msg.type === 1"><img :src="msg.path" alt=""></div>
                <span v-if="msg.vhtml" v-html="msg.text"></span>
                <span v-else>{{ msg.text }}</span>
                <span v-if="msg.unread" class="unread">
                  {{ sunUnread(msg.unread) }} 
                </span>
                <md-progress-spinner v-if="sendWaitCheck(i)"  :md-diameter="10" class="md-accent msgLoading" :md-stroke="1" md-mode="indeterminate"></md-progress-spinner>
              </Talkbox>
          </div>
        </div>
    </div>
    <!-- 메세지 전송 후 로딩바 -->
    <div class="upload-progress" v-if="pgr > 0 && pgr < 100">
      <md-progress-spinner class="md-accent" md-mode="determinate" :md-value="pgr"></md-progress-spinner>
    </div>
    <!-- 다른멤버초대 -->
    <transition name="popmember">
      <Member  :chatMember="chatMember" v-if="invite" />
    </transition>
    <!-- 메세지토스트 -->
    <transition name="msgAlarm">
      <div class="alarmLayer" v-if="tipFlag === true && latest !== false" @click="scrollToEnd('pop');">
        <div class="wrap">
          <md-avatar>            
            <img :src="chatMember[latest.write].photoURL" :alt="chatMember[latest.write].displayName" />
          </md-avatar>
          <span class="name">{{chatMember[latest.write].displayName}}</span>
          <span class="text">{{latest.text}}</span>
        </div>
      </div>      
    </transition>
  </div>  
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { CHAT } from '@/store/namespace'
import Talkbox from '@/components/Talkbox.vue'
import Member from '@/container/Member.vue'
import { EventBus } from '@/main'  
import { yyyymm, isCurrentView } from '@/common/util'
import { setTimeout } from 'timers';
  
  export default {
    name: 'Message',
    components: { 
      Talkbox,
      Member
    },
    data () {
      return {
        tipFlag: false,
        roomkey: null,
        scrollFlag: false,
        sendWait: false,
        preview: null
      }
    },
    computed: {
      ...mapState({
          latest: state => state.chat.latest,
          invite: state => state.invite, // 초대창UI상태 flag
          auth: state => state.auth, // 내정보
          message: state => state.chat.message, // 메세지 Array
          oldMsg: state => state.chat.oldMsg, // 이전메세지
          allMember: state => state.member.memberList, // 모든멤버
          chatMember: state => state.chat.chatMember, // 참여된 멤버
          chatDate: state => state.chat.chatDate, // 메세지 date
          pgr: state => state.chat.progress // 이미지 로딩 프로그래스
      })
    },
    watch: { 
      message() {
        setTimeout(() => {
          if (this.latest !== false && this.auth.uid !== this.latest.write) {
            let currentView = this.scrollToEnd();          
            // 이전 메세지를 보고 있을 때
            if (currentView === false) {
              this.tipFlag = true
              setTimeout(() => {
                this.tipFlag = false
              }, 3000)
            }
          } 
        }, 300)       
      }   
    },
    destroyed() {
      EventBus.$off('sendMessage')
      EventBus.$off('imgPreview')
      this.$store.dispatch('chat/SET_JOIN', {
        type: 'OUT',
        key: this.roomkey
      })
      //this.$run(CHAT.REMOVE_LATEST, this.roomkey)
    },
    created () {
      this.roomkey = this.$route.params.id
      let data = {
        key: this.roomkey,
        today: yyyymm(new Date())
      };      
      // 풋터메세지폼
      EventBus.$on('sendMessage', value => {        
        if (value) {
            this.sendMsg(value)
        }        
      })
      // 이미지 추가 프리뷰
      EventBus.$on('imgPreview', path => {
        this.preview = path
      })
      // 내접속상태 변경
      this.$store.dispatch('chat/SET_JOIN', {
        type: 'IN',
        key: data.key
      })

      // [비정상 접근]새로 고침시 채팅에 속한 멤버 정보가 없으므로 리스트로 보낸다.
      if (this.member === null) {        
        this.$router.push('/list')
      } else {
        //this.$run(CHAT.SET_LATEST, data)
        this.$store.dispatch(CHAT.GET_CHAT_DATE, data).then(res => {
          if (res) {
              this.$store.dispatch(CHAT.GET_MESSAGE, data)
              this.$run(CHAT.GET_OLD_MESSAGE, data)              
          }
        })
      }  
    },
    updated() {
      if (!this.scrollFlag) {          
          setTimeout(() => {
            this.scrollToEnd(true);
          }, 1000)
          this.scrollFlag = true
        }      
    },
    beforeRouteEnter (to, from, next) {
      /* 
        슬라이드 시 내용이 없을때 영역이 크롭 이슈가 발생(컨텐츠 영역의 높이 list영역보다 작기때문에)
        따라서 dom에 마운트 되기전에 현재 영역의 높이를 지정한다.
      */
      to.params.h = window.innerHeight
      next()
    },
    methods: {
        sendWaitCheck(idx) {
          // 메세지가 wait상태일때 마지막 메세지 wait처리
          if (this.sendWait) {
            let msgSize = Object.keys(this.message).length
            return idx === msgSize - 1
          }                  
        },
        sunUnread(data) {          
          let cnt = 0;
          for (let item in data) {
            cnt += data[item]
          }
          if (cnt > 0) {
            return cnt
          }
        },
        scrollToEnd(init) {
          let container = this.$el.querySelector('.message-wrap'),
              html = document.querySelector('html'),
              body = document.querySelector('body'),
              deviceHeight = window.innerHeight,
              current = isCurrentView(deviceHeight, container);

          if (current || init) {
            html.scrollTop = container.scrollHeight;
            body.scrollTop = container.scrollHeight;
            if (init === 'pop') {
              this.tipFlag = false
            }
          }
          
          return current;
        },
    
        historyBack(){
          this.$router.go(-1)
        },
        async sendMsg(data) {
          // 메세지 수신대기 상태
          this.sendWait = true;

          data.key = this.$route.params.id
          data.write = this.auth.uid 
          
          // 이미지 첨부할때
          if (data.addFile) {
            data.path = this.preview;
            data.type = 1;
            EventBus.$emit('sendResult', true) 
            // await this.$store.dispatch(CHAT.ADD_IMAGE, data.addFile)
          }
          // 뷰로직
          await this.$store.dispatch('chat/SEND_MESSAGE2', data).then(res => {
              // 프로세스가 순차처리 되었을때
              if (res) {
                this.sendWait = false;
                EventBus.$emit('sendResult', true) 
                // 내가 메세지를 보내었으면 스크롤을 하단으로 보낸다.
                //this.scrollToEnd(true);
              } else {
                this.sendWait = 'wait';
                this.$store.dispatch('dialogAlert', { message: '메세지 전송중 에러 발생' })
              } 
          })
          
          
          // return false;

          // new Promise(resolve => {
          //     // 이미지 첨부할때
          //     if (data.addFile) {
          //       await this.$store.dispatch(CHAT.ADD_IMAGE, data.addFile).then(path => {
          //         data.path = path;
          //         data.type = 1;
          //       })
          //     } else {
                
          //       this.$store('chat/SEND_MESSAGE2', data).then(result => {
          //         if (result) {
          //           resolve(true)
          //         } else {
          //           resolve(false)
          //         }
          //       })                
          //     }
          //     this.$store.dispatch('chat/SEND_MESSAGE2', data)
          // }).then(res => {
          //   this.sendWait = false;          
          //   // 프로세스가 순차처리 되었을때
          //   if (res) {
          //     EventBus.$emit('sendResult', true) 
          //     // 내가 메세지를 보내었으면 스크롤을 하단으로 보낸다.            
          //     this.scrollToEnd(true);
          //   } else {
          //     this.$run('dialogAlert', { message: '메세지 전송중 에러 발생' })
          //   }      
          // })
        },
        mappingAvatar(uid) {
          if (this.auth.uid === uid) {
            return this.auth.photoURL
          } else {
            return this.chatMember[uid].photoURL
          }
        },
        mappingUserName(uid) {          
          if (this.auth.uid === uid) {
            return this.auth.displayName
          } else {
            if (uid !== 'admin') {
              return this.chatMember[uid].displayName
            } else {
              return uid
            }
          }
        },
        isWrite(uid) {
          if (uid === 'admin') {
            return 'notice'
          }

          if (this.auth.uid === uid) {
            return 'left'
          } else {
            return 'right'
          }
        },
        clear() {
          this.addFile = '';
          this.thumb = '';
        }

    }
  }
</script>

<style lang="scss">
#message{
  height: auto;
  top: 0;
  z-index: 20;
  padding-top: 48px;
  > div{
    padding: 0;
  }
  .left{
    .unread{
      right: 0;
      margin-right: -14px;
    }
    .msgLoading{
      right: 0;
      margin-right: -17px;
    }
  }
  
  .right{
    .unread{
      left: 0;
      margin-left: -14px;
    }
    .msgLoading{
      left: 0;
      margin-left: -17px;
    }    
  }
  .msgLoading{
    position: absolute;
    top: 5px;
  }
  .unread{    
    position: absolute;    
    font-size: 11px;
    top: 0;
    color: #ff5252;
  }
  .message-wrap{
    padding-bottom: 150px;
    box-sizing: border-box
  }
  // 멤버레이어가 나올때
  &.inviteWrap {
    overflow: hidden;
    height: 100%;
    .message-wrap{      
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }
  }

  .add-member{
    position: absolute;
    left: 60px;
    top: 17px;
  }
  .addfile-image{
    > img{
      max-width: 150px;
      margin-bottom: 10px;
    }
  }
  .upload-progress{
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

 
  .talk-items{
    display: flex;
    margin: 20px 10px;
    position: relative;
    overflow: hidden;    
    &.right{
          flex-direction: row-reverse;
    } 
    &.notice {
      min-height: 43px;
    }
    .img-wrap{
      width: 60px;
      text-align: center;
      flex-shrink: 0;
    }
    .img-wrap .name{
      display: block;
      margin-top: 5px;
      font-size: 12px;
    }
    .talk-wrap{      
      justify-content: center;
      align-items: center;
   }
  }

  .old-items{
    .talkBox{
      border-color: #ccc;
    }
    .talkBox.left::before{
      border-right-color: #ccc
    }
    .talkBox.right::before{
      border-left-color: #ccc
    }
  }
  .invite{
        top: 64px;
  }

  @media (max-width: 960px) {
    .invite{
          top: 48px;
    }
  }
  @media (max-width: 600px) {
    .invite{
        top: 56px;
    }
  }
}
.alarmLayer{
    position: fixed;
    bottom: 100px;
    width: 100%;
    text-align: center;
    transition: all 300ms;
    .wrap{
      position: relative;
      display: inline-block;
      max-width: 90%;
      border: solid 1px #ccc;
      background-color: #fff;
      border-radius: 5px;
      padding: 5px 10px 5px 100px;
    }
    .md-avatar{
      position: absolute;
      left: 5px;
      top: 5px;
    }
    .name{
      position: absolute;
      left: 50px;
      display: block;
      line-height: 40px;
      height: 40px;
    }
    .text{
      display: block;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      width: 100%;
      height: 40px;
      line-height: 40px;
    }
}
// animate
.popmember-enter{
  transform: translate3d(0, 0, 0);
}
.popmember-enter-active{
  transform: translate3d(100%, 0, 0);
}
.popmember-leave-active{
  transform: translate3d(100%, 0, 0);
}
.msgAlarm-leave-active{
  transform: translate3d(0, 80px, 0);
}
.msgAlarm-enter-active{
  transform: translate3d(0, 80px, 0);
}
</style>
