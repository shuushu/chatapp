<template>
  <div id="memberList" class="page" :class="{ invite: chatMember }">
    <div v-if="isLoading" class="wrap-center">
      <md-progress-spinner :md-diameter="50" md-mode="indeterminate"></md-progress-spinner>
    </div>
    <div v-else>
      <div v-if="member === null" class="md-empty-state-wrap">
        <md-empty-state
          class="md-primary"
          md-icon="sentiment_dissatisfied"
          md-label="Nothing in Done"
          md-description="대화 가능 한 멤버 없음">
        </md-empty-state>
      </div>      
      <md-list v-else>
        <div v-for="(items, key) in fetchData" :key="key">
            <md-list-item class="md-triple-line md-dense" v-if="auth.uid != key">
                <md-checkbox :disabled="items.disabled" v-model="checkArr" :value="items.uid"></md-checkbox>
                <md-avatar>
                  <img :src="items.photoURL" :alt="items.displayName">
                </md-avatar>

                <div class="md-list-item-text">
                  <span class="title">{{ items.displayName }}</span>
                  <span class="desc">{{ items.email }}</span>
                </div>
            </md-list-item>          
        </div>
      </md-list>
      <div :class="{ btnWrap: chatMember }">
          <md-button v-if="checkArr.length > 0" class="join md-raised md-accent" @click="memberJoin()">
            <md-icon class="md-primary">people</md-icon> JOIN
          </md-button>
          <md-button v-if="chatMember" class="join md-raised md-primary" @click="toggle()">
            <md-icon class="md-primary">cancel</md-icon> cancel
          </md-button>
      </div>

    </div>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapActions } from 'vuex'
  import { CHAT, MEMBER } from '@/store/namespace'
  import { yyyymm } from '@/common/util'
  
  export default {
    name: 'Member',
    data () {
      return {        
          checkArr: [],
          temp: null      
      }
    },
    props: {
        chatMember: {
            type: Array
        }
    },
    computed: {
      fetchData() {        
        if (this.chatMember) {
          return this.filter(this.member, this.chatMember)
        } else {
          return this.member
        }        
      },
      ...mapState({
          auth: state => state.auth,
          isLoading: state => state.ready,
          member: state => state.member.memberList
      }),
      ...mapGetters({
        filter: MEMBER.SET_FILTER
      }) 
    },
    created () {  
      this.getMember()      
    },
    methods: {
        ...mapActions({
          getMember: MEMBER.GET_MEMBER,
          setJoin: MEMBER.SET_JOIN
        }),
        toggle () {
            this.$store.dispatch('invite')
        },
        memberJoin() {            
            // 채팅방에서 초대할때
            if(this.chatMember) {
              this.$store.dispatch('dialogAlert', { message: '초대하였습니다.' })
              this.checkArr = this.checkArr.concat(this.chatMember)
            } else {
              // 내 uid 추가              
              this.checkArr.push(this.auth.uid);
            }
   
            this.setJoin(this.checkArr).then(roomKey => {                
                this.$router.push({
                  name: 'message',
                  params: {
                    id: roomKey
                  }
                })
                
                const TOADY = yyyymm(new Date());

                if(this.chatMember) {
                    let data = {
                      key: roomKey,
                      today: TOADY
                    };

                    // [비정상 접근]새로 고침시 채팅에 속한 멤버 정보가 없으므로 리스트로 보낸다.
                    if (this.member === null) {        
                      this.$router.push('/list')
                    } else {
                      this.$run(CHAT.GET_CHAT_MEMBER, data)
                      this.$run(CHAT.GET_CHAT_DATE, data).then(res => {
                        if (res) {
                            this.$run(CHAT.GET_MESSAGE, data)
                            this.$run(CHAT.GET_OLD_MESSAGE, data)
                            this.toggle();
                        }
                      })
                    } 
                }
            })
        }        
    }
  }
</script>

<style lang="scss">
#memberList{
  &.invite{
    z-index: 30;
    top: 56px;
    width: 100%;
    right: 0;
    background: rgba(0, 0, 0, .5);
    > div{
      margin-left: 20%;
      height: 100%;
      position: absolute;
      width: 80%;
      right: 0;
      padding-top: 0;
      background: #fff;
    }
    .btnWrap{
      display: flex;
      padding: 0 10px 150px 10px;      
      margin: 0;
      background: #fff;
      .md-accent,
      .md-accent + .md-button{
        width: 48%;
      }
    }
  }
  .md-checkbox {
    margin-right: 15px;
  }
  .md-avatar {
    margin-right: 15px;
  }
  .join {
    i {
      margin-right: 5px;
    }
    width: 95%;
    display: block;
    margin: 20px auto;
    font-size: 16px;
    line-height: 24px;
    font-weight: normal;
  }
  .md-list-item{    
    &::after{
      content: '';
      width: 98%;
      height: 1px;
      display: block;
      background-color: #ccc;
      margin: 0 auto;
    }
    .md-list-item-container{
      padding: 10px 0;
    }
  }
}
</style>
