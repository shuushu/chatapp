<template>
    <form id="login" novalidate class="md-layout" @submit.prevent="login">
      <md-card class="md-layout-item md-size-50 md-small-size-100">
        <md-card-header>
          <div class="md-title"><md-icon>lock</md-icon> LOGIN</div>
        </md-card-header>

        <md-card-content>
          <md-field :class="getValidationClass('id')">
            <label for="id">Email</label>
            <md-input type="email" name="id" id="id" autocomplete="id" v-model="form.id" :disabled="isLoading" />
            <span class="md-error" v-if="!$v.form.id.required">The email is required</span>
            <span class="md-error" v-else-if="!$v.form.id.email">Invalid email</span>
          </md-field>


          <md-field :class="getValidationClass('pw')">
            <label for="pw">password</label>
            <md-input type="password" name="pw" id="pw" autocomplete="pw" v-model="form.pw" :disabled="isLoading" />
            <span class="md-error" v-if="!$v.form.pw.required">The pw is required</span>
            <span class="md-error" v-else-if="!$v.form.pw.minLength">최소 6자이상 입력</span>
          </md-field>

          <md-field v-if="isCreate" :class="getValidationClass('name')">
            <label for="name">name</label>
            <md-input type="text" name="name" id="name" autocomplete="name" v-model="form.name" :disabled="isLoading" />
            <span class="md-error" v-if="!$v.form.name.required">The name is required</span>
            <span class="md-error" v-else-if="!$v.form.name.minLength">최소 3자이상 입력</span>
          </md-field>
        </md-card-content>

        <md-progress-bar md-mode="indeterminate" v-if="isLoading" />

        <md-card-actions>
          <div v-if="isCreate">
            <md-button class="md-primary" @click.prevent="createEmail" :disabled="isLoading" >create</md-button>
            <md-button class="md-primary" @click.prevent="loginView" :disabled="isLoading" >cacel</md-button>
          </div>
          <div v-else>
            <md-button type="submit" class="md-primary" :disabled="isLoading">로그인</md-button>
            <md-button class="md-primary" @click.prevent="loginGoogle" :disabled="isLoading">구글 로그인</md-button>
            <md-button class="md-primary" @click.prevent="isCreate = true" :disabled="isLoading" >계정 생성</md-button>
          </div>
        </md-card-actions>
      </md-card>

      <md-snackbar :md-active.sync="userSaved">The user {{ form.id }} was saved with success!</md-snackbar>
    </form>
</template>
<script>
  import { validationMixin } from 'vuelidate'
  import {
    required,
    minLength,
    email
  } from 'vuelidate/lib/validators'
  import { mapState, mapActions } from 'vuex'
  
  export default {
    name: 'login',
    mixins: [validationMixin],
    data: () => ({
      isCreate: false,
      form: {
        name: null,
        id: null,
        pw: null
      },
      userSaved: false
    }),
    computed: mapState({
      isLoading: state => state.ready
    }),
    validations () {
      let obj = {
        form: {
            pw: {
              required,
              minLength: minLength(6)
            },
            id: {
              required,
              email
            }
        }
      };

      if (this.isCreate) {
        obj.form['name'] = {
          required,
          minLength: minLength(3)
        };
      }

      return obj;
    },
    methods: {
      ...mapActions([
        'loginGoogle', 'loginEmail', 'createMailID'
      ]),
      createEmail () {
        this.$v.$touch();

        if (!this.$v.$invalid) {
          let { id, pw, name } = this.form

          this.createMailID({ id, pw, name })        
        }
      },
      getValidationClass (fieldName) {
        const field = this.$v.form[fieldName];

        if (field) {
          return {
            'md-invalid': field.$invalid && field.$dirty
          }
        }
      },
      clearForm() {
        this.$v.$reset();
        this.form.id = null;
        this.form.name = null;
        this.form.pw = null;
      },
      loginView() {
        this.clearForm();
        this.isCreate = false;
      },
      login() {
        let { id, pw } = this.form;
        this.$v.$touch();

        if (!this.$v.$invalid) {
          this.loginEmail({ id, pw })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
#login{
  z-index: 29;
  background: #efefef;
}
  .md-title{
    .md-icon{color: #000;}
  }
  .md-progress-bar {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }
  .md-layout{
    width: 100%;
    padding: 0 5%;
    display: flex;
    position: absolute;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
</style>
