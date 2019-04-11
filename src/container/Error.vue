<template>
  <div id="error" class="md-empty-state-wrap">
    <md-empty-state
      class="md-primary"
      md-icon="sentiment_dissatisfied"
      md-label="Nothing in Done"
      md-description="페이지 주소가 잘못 되었습니다">
      <md-button  @click="goHome" class="md-accent btn-rent">홈으로 이동</md-button>
    </md-empty-state>
  </div>
</template>

<script>
export default {
  name: 'Error',
  data () {
    return {
    }
  },
  methods: {
    goHome() {
      this.$router.push('/list');
    }
  }
}
</script>

<style lang="scss" scoped>
  #error{
    z-index: 10;
    background-color: #fafafa;
    &.md-empty-state-wrap{
      z-index: 3;
    }
  }
</style>
