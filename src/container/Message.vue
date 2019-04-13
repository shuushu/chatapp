<template>
  <div id="message"  class="page" :class="{ inviteWrap:invite }">

    <div v-if="isLoading" class="wrap-center">
      <md-progress-spinner :md-diameter="50" md-mode="indeterminate"></md-progress-spinner>
    </div>
    <div class="message-wrap" :style="`min-height:${deviceHeight-80}px`" v-else>
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
        <div class="talk-items" :class="isWrite(msg.write)" v-for="(msg, pk) in message" :key="pk">
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
              </Talkbox>
          </div>
        </div>
    </div>

    <div class="upload-progress" v-if="pgr > 0 && pgr < 100">
      <md-progress-spinner class="md-accent" md-mode="determinate" :md-value="pgr"></md-progress-spinner>
    </div>

    <transition name="popmember">
      <Member  :chatMember="chatMember" v-if="invite" />
    </transition>
  </div>  
</template>

<script>
  import { mapState } from 'vuex'
  import { CHAT } from '@/store/namespace'
  import Talkbox from '@/components/Talkbox.vue'
  import Member from '@/container/Member.vue'
  import { EventBus } from '@/main'  
  import { yyyymm, isCurrentView } from '@/common/util'
  
  export default {
    name: 'Message',
    components: { 
      Talkbox,
      Member
    },
    data () {
      return {
        scrollFlag: false
      }
    },
    computed: {
      ...mapState({
          invite: state => state.invite,
          auth: state => state.auth,
          isLoading: state => state.ready,
          message: state => state.chat.message,
          oldMsg: state => state.chat.oldMsg,
          member: state => state.member.memberList,
          chatMember: state => state.chat.chatMember,
          chatDate: state => state.chat.chatDate,
          pgr: state => state.chat.progress,
          deviceHeight: state => state.height
      })
    },
    watch: {
      message () {
        this.scrollToEnd()
      }
    },
    destroyed() {
      EventBus.$off('sendMessage')
    },
    created () {
      let data = {
        key: this.$route.params.id,
        today: yyyymm(new Date())
      };      

      // 풋터메세지폼
      EventBus.$on('sendMessage', value => {        
        if (value) {
            this.sendMsg(value)
        }        
      })

      // [비정상 접근]새로 고침시 채팅에 속한 멤버 정보가 없으므로 리스트로 보낸다.
      if (this.member === null) {        
        this.$router.push('/list')
      } else {
        this.$run(CHAT.GET_CHAT_MEMBER, data)
        this.$run(CHAT.GET_CHAT_DATE, data).then(res => {
          if (res) {
              this.$run(CHAT.GET_MESSAGE, data)
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
    methods: {
        scrollToEnd(init) {
          let container = this.$el.querySelector('.message-wrap'),
              html = document.querySelector('html'),
              body = document.querySelector('body'),
              deviceHeight = this.deviceHeight,
              current = isCurrentView(deviceHeight, container);

          if (current || init) {
            html.scrollTop = container.scrollHeight;
            body.scrollTop = container.scrollHeight;
          }        
        },
    
        historyBack(){
          this.$router.go(-1)
        },
        sendMsg(data) {
          data.key = this.$route.params.id
          data.write = this.auth.uid
                  
          new Promise(resolve => {
              // 이미지 첨부할때
              if (data.addFile) {
                this.$run(CHAT.ADD_IMAGE, data.addFile).then(path => {
                  data.path = path;
                  data.type = 1;
                  this.$run(CHAT.SEND_MESSAGE, data)
                  resolve(true)
                })
              } else {
                this.$run(CHAT.SEND_MESSAGE, data)
                resolve(true)
              }
          }).then(res => {
            // 프로세스가 순차처리 되었을때
            if (res) {
              EventBus.$emit('sendResult', true) 
              // 내가 메세지를 보내었으면 스크롤을 하단으로 보낸다.              
              this.scrollToEnd(true)
            } else {
              this.$run('dialogAlert', { message: 'Error' })
            }      
          })
        },
        mappingAvatar(uid) {
          if (this.auth.uid === uid) {
            return this.auth.photoURL
          } else {
            return this.member[uid].photoURL
          }
        },
        mappingUserName(uid) {
          if (this.auth.uid === uid) {
            return this.auth.displayName
          } else {
            if (uid !== 'admin') {
              return this.member[uid].displayName
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
        handleChange(e) {
          
          if (e.target.value) {
            let reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);

            reader.onload = () => {
              this.thumb = reader.result
            }
            this.addFile = e.target.files[0];
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
</style>
