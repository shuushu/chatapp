<template>
    <md-toolbar class="md-primary chat-header">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button @click="historyBack" class="md-icon-button">
            <md-icon>arrow_back</md-icon>
          </md-button>
        </div>

        <div class="md-toolbar-section-end">
          <md-badge v-if="alarm > 0" :md-content="alarm">
            <md-button @click="goList" class="md-icon-button">
              <md-icon>notifications</md-icon>
            </md-button>
          </md-badge>
          <md-button class="md-accent" @click="memberJoin">
            <md-icon>people</md-icon> 
            다른 멤버 초대
          </md-button>
        </div>       
      </div>
    </md-toolbar>
</template>

<script>
  export default {
    name: 'MsgHeader',
    props: {
      alarm: {
        default: 0,
        type: Number
      },      
      name: {
        type: String
      }
    },
    methods: {
      historyBack(){
        this.$router.go(-1)
      },
      memberJoin() { 
        this.$store.dispatch('invite')
      },
      goList() {
        this.$router.push('/list')
      }
    }
  }
</script>

<style lang="scss">

</style>
