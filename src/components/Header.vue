<template>
    <md-toolbar class="md-primary">
      <div class="md-toolbar-row">
        <div class="md-toolbar-section-start">
          <md-button @click="historyBack" class="md-icon-button">
            <md-icon>arrow_back</md-icon>
          </md-button>
        </div>

        <h1 class="head-title" v-if="name">{{ name.toUpperCase() }}</h1>

        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button" @click="logout">
            <md-icon>highlight_off</md-icon>
          </md-button>
        </div>
      </div>
    </md-toolbar>
</template>

<script>
  export default {
    name: 'Header',
    data: () => ({
      selectedEmployee: ''
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

      logout() {
        this.$run('dialogConfirm', {
          name: '로그아웃',
          message: '로그아웃 하시겠습니까?',
          action: this.actionLogout
        });
      },
      actionLogout() {
        this.$run('logout').then(res => {
          this.$run('dialogAlert', {
            message: res ? '로그아웃 되었습니다' : res.code
          })
        })
      }
    }
  }
</script>

<style lang="scss">

</style>
