<script setup lang="ts">
import { useStore } from "vuex";
import axios from "axios";
import { useRouter } from "vue-router";
import { getCurrentInstance,onMounted } from "vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
const snackbarStore = useSnackbarStore();
const { proxy } = getCurrentInstance();
const router = useRouter();



const isLoading = ref(false);
const isSignInDisabled = ref(false);

const refLoginForm = ref();
const email = ref("");
const password = ref("");
const isFormValid = ref(true);
const snackbarVisible = ref(false);
const snackbarInfo = ref("");
const captcha=ref("");
// show password field
const showPassword = ref(false);
onMounted(() => {
  refreshCaptcha();
});
const handleLogin = async () => {
  const { valid } = await refLoginForm.value.validate();
  if (valid) {
    isLoading.value = true;
    isSignInDisabled.value = true;

    const response = await axios.post(proxy.globalInfo.new_url_f + "/users/login", {
      email: email.value,
      password: password.value,
      captcha:captcha.value
    });
    console.log(response);
    if (response.status === 200) {
      const data = response.data.data;
      if (response.data.code == "200") {
        localStorage.setItem("userInfo", JSON.stringify(data));


        console.log(data.userId);
        console.log(data);
        snackbarStore.showSuccessMessage("登陆成功！");
        setTimeout(function () {
          console.log("isadmin")
          console.log(data.isAdmin)
          if(data.isAdmin==1){
            router.push("/control/users");
          }else{
            router.push("/");
          }

        }, 500); // 延迟3秒跳转
      }else{
        console.log("gggggggggg");
      snackbarStore.showErrorMessage(response.data.info);
      if(response.data.code=="401"){
        captcha.value="";
      }else{
        password.value = "";
      email.value="";
      captcha.value="";
      }

      isLoading.value = false;
      refreshCaptcha();
    isSignInDisabled.value = false;
      }
    }
  } else {
    console.log("no");
  }
};
const captchaImage=ref("");
function refreshCaptcha() {
  try {
    // 发起 Axios 请求获取新的验证码图片
     axios.get(proxy.globalInfo.new_url_f + '/users/captcha', { responseType: 'blob' }).then(response => {
      console.log(response)
      // 如果响应成功
      if (response.status === 200) {
        // 创建一个 Blob URL 并将其赋值给 this.captchaImage
        captchaImage.value = URL.createObjectURL(response.data);
      }
    })
    .catch(error => {
      // 捕获异常并输出错误信息到控制台
      console.error('Error refreshing captcha:', error);
    });;

  } catch (error) {
    console.error('Error refreshing captcha:', error);
  }
}

// Error Check
const emailRules = ref([
  (v: string) => !!v || "请输入邮箱地址",
  (v: string) => /.+@.+\..+/.test(v) || "邮箱地址必须有效",
]);

const passwordRules = ref([
  (v: string) => !!v || "请输入密码",
  (v: string) =>
    (v && v.length <= 15) || "密码必须少于15个字符",
]);

// error provider
const errorProvider = ref(false);
const errorProviderMessages = ref("");

const error = ref(false);
const errorMessages = ref("");
const resetErrors = () => {
  error.value = false;
  errorMessages.value = "";
};
</script>
<template>
  <el-alert
    v-if="snackbarVisible"
    :title="snackbarInfo"
    type="success"
    center
    show-icon
  />
  <v-card color="white" class="pa-3 ma-3" elevation="3">
    <v-card-title class="my-4 text-h4">
      <span class="flex-fill"> 欢迎 </span>
    </v-card-title>
    <v-card-subtitle>请登陆你的账号</v-card-subtitle>
    <!-- sign in form -->

    <v-card-text>
      <v-form
        ref="refLoginForm"
        class="text-left"
        v-model="isFormValid"
        lazy-validation
      >
        <v-text-field
          ref="refEmail"
          v-model="email"
          required
          :error="error"
          :label="$t('login.email')"
          density="default"
          variant="underlined"
          color="primary"
          bg-color="#fff"
          :rules="emailRules"
          name="email"
          outlined
          validateOn="blur"
          placeholder="请输入邮箱"
          @keyup.enter="handleLogin"
          @change="resetErrors"
        ></v-text-field>
        <v-text-field
          ref="refPassword"
          v-model="password"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          :error="error"
          :error-messages="errorMessages"
          :label="$t('login.password')"
          placeholder="请输入密码"
          density="default"
          variant="underlined"
          color="primary"
          bg-color="#fff"
          :rules="passwordRules"
          name="password"
          outlined
          validateOn="blur"
          @change="resetErrors"
          @keyup.enter="handleLogin"
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>
        <v-text-field
          v-model="captcha"
          label="验证码"
          placeholder="请输入验证码"
          density="default"
          variant="underlined"
          color="primary"
          bg-color="#fff"
          name="验证码"
          outlined
          validateOn="blur"
          @keyup.enter="handleLogin"

        ></v-text-field>
        <img :src="captchaImage" @click="refreshCaptcha" alt="captcha"><br>
        <v-btn
          :loading="isLoading"
          :disabled="isSignInDisabled"
          block
          size="x-large"
          color="primary"
          @click="handleLogin"
          class="mt-2"
          >{{ $t("login.button") }}</v-btn
        >

        <!-- external providers list -->

        <div v-if="errorProvider" class="error--text my-2">
          {{ errorProviderMessages }}
        </div>
      </v-form></v-card-text
    >
  </v-card>
  <div class="text-center mt-6">
    {{ $t("login.noaccount") }}
    <router-link to="/auth/signup" class="text-primary font-weight-bold">
      {{ $t("login.create") }}
    </router-link>
  </div>
</template>
<style scoped>
.el-alert {
  margin: 20px 0 0;
}
.el-alert:first-child {
  margin: 0;
}
</style>
