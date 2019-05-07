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
          <md-badge v-if="alarm > 0" :md-content="alarm">
            <md-button  @click="goList" class="md-icon-button">
              <md-icon>notifications</md-icon>
            </md-button>
          </md-badge>


          <md-button class="md-icon-button" @click="logoutConfirm">
            <md-icon>highlight_off</md-icon>
          </md-button>
        </div>
      </div>
    </md-toolbar>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    name: 'Header',
    data: () => ({
      selectedEmployee: ''
    }),
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
      ...mapActions([
        'dialogConfirm', 'logout'
      ]),
      historyBack(){
        this.$router.go(-1)
      },

      logoutConfirm() {
        this.dialogConfirm({
          name: '로그아웃',
          message: '로그아웃 하시겠습니까?',
          action: this.actionLogout
        })
      },
      actionLogout() {
        this.logout()
      },
      goList() {
        this.$router.push({ name: 'list' })
      }
    }
  }
</script>

<style lang="scss">

</style>
