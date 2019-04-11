<template>
    <md-toolbar class="md-primary chat-header">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button @click="historyBack" class="md-icon-button">
            <md-icon>arrow_back</md-icon>
          </md-button>
        </div>
        <md-button class="md-accent" @click="memberJoin">
          <md-icon>people</md-icon> 
          다른 멤버 초대
        </md-button>          
      </div>
    </md-toolbar>
</template>

<script>
  export default {
    name: 'MsgHeader',
    data: () => ({
      selectedEmployee: 'dsadasd'      
    }),
    props: {
      name: {
        type: String
      }
    },
    methods: {
      historyBack(){
        this.$router.go(-1)
      },
      memberJoin() { 
        this.$run('invite')
      }
    }
  }
</script>

<style lang="scss">

</style>
