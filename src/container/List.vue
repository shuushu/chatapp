<template>
  <div id="roomList" class="page">
    <div v-if="isLoading" class="wrap-center">
      <md-progress-spinner :md-diameter="50" md-mode="indeterminate"></md-progress-spinner>
    </div>
    <div>
      <div v-if="roomList === null" class="md-empty-state-wrap">
        <md-empty-state
                class="md-primary"
                md-icon="sentiment_dissatisfied"
                md-label="Nothing in Done"
                md-description="대화 목록 없음">
        </md-empty-state>
      </div>
      <md-list v-else>
        <md-list-item  :class="hasClass(items.state)" v-for="(items, key) in roomList" :key="key" @click="goToMessage(key)">
          <md-avatar>
            <img :src="items.join[z].photoURL" v-for="(users, z) in items.join" :key="`img-${items.join[z].uid}`" :alt="items.join[z].displayName">
          </md-avatar>

          <div class="md-list-item-text">
            <span class="join-member">
              참여자: 
              <span class="join-item" v-for="(users, i) in items.join" :key="`join-${items.join[i].uid}`">{{ items.join[i].displayName }}</span>
            </span>
            <span class="title">{{ items.text }}</span>            
          </div>
          <md-badge v-if="alarm[key] > 0" :md-content="alarm[key]">
            <md-button class="md-icon-button">
              <md-icon>notifications</md-icon>
            </md-button>          
          </md-badge>
          <div class="util">
            <div class="nth1">
              <!-- 방즐겨찾기 -->          
              <md-button class="md-icon-button delete" @click.stop="favRoom({key, state: items.state})">
                <md-icon>{{ items.state === 0 ? 'favorite_border' : 'favorite' }}</md-icon>
              </md-button>
            </div>
            <div class="nth2">
              <!-- 방삭제 -->          
              <md-button class="md-icon-button delete" @click.stop="removeRoom(key)">
                <md-icon>close</md-icon>
              </md-button>
            </div>
          </div>



        </md-list-item>
      </md-list>

    </div>
  </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex'
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
                
            }),
            hasClass: () => (flag) => {
              const classNames = 'md-triple-line md-dense'
              return Number(flag) === 0 ? `${classNames}` :  `${classNames} fav`
            }
        },
        created () {            
            // 초대창 닫기
            this.$store.dispatch('invite', false) 

            if (this.member) {
              this.getRoomList()
            } else {
              // 현재 방 목록에 참여된 멤버를 확인하기 위해(닉네임 및 정보), 
              // 멤버를 목록을 가져온 후 실행
              this.getMember().then(res => {              
                if (res) {               
                  this.getRoomList(res)
                }
              })
            }
        },
        methods: {
            ...mapActions({
                confirm: 'dialogConfirm',                
                getMember: MEMBER.GET_MEMBER,
                getRoomList: CHAT.GET_ROOMLIST
            }), 
            goToMessage(key) {
              this.$router.push(`/message/${key}`);
            },
            removeRoom(key) {
              this.confirm({
                name: '방삭제',
                message: '선택된 방을 삭제 하시겠습니까? 삭제하면 대화내역을 볼 수 없습니다.',
                action: () => {
                  this.$store.dispatch('chat/DELETE_ROOM', key)
                }
                // end action                
              })
            },
            favRoom(params) {
              params.state = Number(params.state) === 0 ? 1 : 0;
              this.$store.dispatch('chat/SET_FAV_ROOM', params)
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
    .md-list-item-content{
      padding-right: 80px;
    }
    .md-list-item{
      order: 1;
      &.fav{
        order: -1;
      }
      &::after{
        content: '';
        width: 98%;
        height: 1px;
        display: block;
        background-color: #ccc;
        margin: 0 auto;
      }
      .md-ripple{
        position: relative;        
      }
      .util{
        position: absolute;
        right: 0;
        top: 0;
        display: flex;
        height: 100%;
        > div{
          justify-content: center;
          align-items: center;
          display: flex;
        }
        .delete{
          position: relative;
          z-index: 10;
          text-align: center;
        }
      }
    }
    .md-icon-button{      
      margin: 0;
    }
    .md-list-item-container{
      padding: 10px 0;
    }

  }
</style>
