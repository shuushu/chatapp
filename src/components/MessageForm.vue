<template>
    <!-- 전송폼 -->
    <div class="form-area">
        <div class="img-layer" v-if="thumb" >
            <md-button @click="clear" class="md-icon-button add-file-close">
                <md-icon>close</md-icon>
            </md-button>
            <img :src="thumb" alt="">
        </div>

        <md-button class="md-icon-button add-file">
          <md-icon>insert_photo</md-icon>
          <input type="file" class="file-hidden" @change="handleChange" accept="image/*">        
        </md-button>

        <md-field>
          <label>입력해주세요</label>
          <md-input v-model="userWrite" @keyup.enter="sendMsg"></md-input>
        </md-field>

        <md-button class="send md-raised md-accent" :disabled="sendLoad" @click="sendMsg">
          <md-icon class="md-primary">send</md-icon> 
          <span class="text">SEND</span>
        </md-button>
    </div>
</template>

<script>
import { EventBus } from '@/main'
import { yyyymm } from '@/common/util'

  export default {
    name: 'MessageForm',
    data() {
      return {
        userWrite: '',
        thumb: null,
        addFile: null,
        sendLoad: false
      }
    },
    created () {
        EventBus.$on('sendResult', () => {
          this.sendcomplete()
        })
    },
    methods: {
        handleChange(e) {          
          if (e.target.value) {
            let reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);

            reader.onload = () => {
              this.thumb = reader.result
              EventBus.$emit('imgPreview', reader.result)
            }
            this.addFile = e.target.files[0];
          }
        },
        clear() {
          this.addFile = '';
          this.thumb = '';          
        },
        sendMsg(event) {
          event.preventDefault();
          
          let data = {
            text: this.userWrite,
            today: yyyymm(new Date()),
            type: 0,
          };
          if(this.addFile) {
            data.addFile = this.addFile
          }

          if (this.userWrite === '') {
              let alert = {
                message: '메세지를 입력해주세요'
              }
              this.$run('dialogAlert', alert)
              return true;
          }
          // 버튼 비활성화 flag
          this.sendLoad = true          
          EventBus.$emit('sendMessage', data)
        },
        sendcomplete() {
          this.userWrite = ''
          this.thumb = null
          this.addFile = null
          this.sendLoad = false      
        }
    }    
  }
</script>

<style lang="scss" scoped>
  .md-bottom-bar {
    position: fixed;
    bottom: 0;
    z-index: 10;
  }
  .img-layer{
    position: fixed;
    left: 30px;
    bottom: 100px;
    z-index: 10;
    border: solid 1px #000;
    max-width: 200px;
    background: rgba(255,255,255, .9);
  }
</style>
