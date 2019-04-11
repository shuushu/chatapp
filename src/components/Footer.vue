<template>
  <md-bottom-bar md-type="shift" md-sync-route>
    <md-bottom-bar-item to="/member" id="bottom-bar-item-home" md-label="MEMBER" md-icon="people"></md-bottom-bar-item>
    <md-bottom-bar-item to="/list" id="bottom-bar-item-pages" md-label="LIST" md-icon="chat"></md-bottom-bar-item>
    <md-bottom-bar-item to="/ready" id="bottom-bar-item-posts" md-label="rental" md-icon="book"></md-bottom-bar-item>
    <md-bottom-bar-item to="/ready" id="bottom-bar-item-favorites" md-label="history" md-icon="favorite"></md-bottom-bar-item>
  </md-bottom-bar>
</template>

<script>
  export default {
    name: 'Footer'
  }
</script>

<style lang="scss" scoped>
  .md-bottom-bar {
    position: fixed;
    bottom: 0;
    z-index: 10;
    transition: all 300ms
  }
</style>
