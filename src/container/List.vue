<template>
  <div id="roomList" class="page">
    <div v-if="isLoading" class="wrap-center">
      <md-progress-spinner :md-diameter="50" md-mode="indeterminate"></md-progress-spinner>
    </div>
    <div v-else>
      <div v-if="roomList === null" class="md-empty-state-wrap">
        <md-empty-state
                class="md-primary"
                md-icon="sentiment_dissatisfied"
                md-label="Nothing in Done"
                md-description="대화 목록 없음">
        </md-empty-state>
      </div>
      <md-list v-else>
        <md-list-item class="md-triple-line md-dense"  v-for="(items, key) in roomList" :key="key" @click="goToMessage(key)">
          <md-avatar>
            <img :src="users.photoURL" v-for="users in items.join" :key="users.uid" :alt="users.displayName">
          </md-avatar>

          <div class="md-list-item-text">
            <span class="join-member">
              참여자: 
              <span class="join-item" v-for="users in items.join" :key="`join-${users.uid}`">{{ users.displayName }}</span>
            </span>
            <span class="title">{{ items.text }}</span>            
          </div>
          <md-badge v-if="alarm[key] > 0" :md-content="alarm[key]">
            <md-button class="md-icon-button">
              <md-icon>notifications</md-icon>
            </md-button>
          </md-badge>
        </md-list-item>
      </md-list>

    </div>
  </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { CHAT, MEMBER } from '@/store/namespace'
    
    export default {
        name: 'List',
        data () {
            return {
            }
        },
        computed: {
            ...mapState({
                alarm: state => state.alarm,
                auth: state => state.auth,
                isLoading: state => state.ready,
                member: state => state.member.memberList,
                roomList: state => state.chat.roomList
            })
        },
        created () {  
            // 초대창 닫기
            this.$run('invite', false) 
            // 유저 정보를 먼저 받는다
            if (this.member) {
              this.$run(CHAT.GET_ROOMLIST, this.member)
            } else {
              // 현재 방 목록에 참여된 멤버를 확인하기 위해(닉네임 및 정보), 
              // 멤버를 목록을 가져온 후 실행
              this.$run(MEMBER.GET_MEMBER).then(res => {
                if (res) {                  
                  this.$run(CHAT.GET_ROOMLIST, res)
                }                
              })
            }
        },
        methods: {          
            goToMessage(key) {
              this.$router.push(`/message/${key}`);
            }
        }
    }
</script>

<style lang="scss">
  #roomList{
    background-color: #fff;
    > div{
      padding-bottom: 100px;
    }
    .md-badge{
      position: absolute;
    }
    .join-member {      
      .join-item{        
        font-size: 16px;
        &::after{
          content: ',';
          margin-right: 5px;
        }
        &:last-child::after{
          content: '';
        }
      }      
    }
    .md-avatar {
      margin-right: 15px;
      > img:nth-child(3) {
        position: absolute;
        top: 50%
      }
      > img:nth-child(4) {
        position: absolute;
        top: 50%;
        left: 50%;
      }
      > img:nth-child(n+5) {
        display: none;
      } 
    }
    .title {
      margin: 5px 0 0 0;
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
    }
    .md-list-item-container{
      padding: 10px 0;
    }
  }
</style>
