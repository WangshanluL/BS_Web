<script setup lang="ts">
import axios from "axios";
import { useRouter } from "vue-router";
const router = useRouter();
import { getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
const username = ref("");

// sign in buttons
const isLoading = ref(false);
const isSignInDisabled = ref(false);

const refLoginForm = ref();
const isFormValid = ref(true);
const email = ref("");
const password = ref("");

// show password field
const showPassword = ref(false);
import { useSnackbarStore } from "@/stores/snackbarStore";
const snackbarStore = useSnackbarStore();
// Submit
const handleRegister = async () => {
  const { valid } = await refLoginForm.value.validate();
  if (valid) {
    isLoading.value = true;
    isSignInDisabled.value = true;
    const response = await axios.post(proxy.globalInfo.url_f + "/users/register", {
      nickName: username.value,
      email: email.value,
      password: password.value,
    });
    if (response.status === 200) {
      snackbarStore.showSuccessMessage("创建账号成功！请登陆！");
      setTimeout(function () {
        router.push("/auth/signin");
      }, 500);
    } else {
    }
  } else {
    console.log("no");
  }
};

// Error Check
const emailRules = ref([
  (v: string) => !!v || "请输入邮箱地址",
  (v: string) => /.+@.+\..+/.test(v) || "邮箱地址不合法",
]);

const usernameRules = ref([(v: string) => !!v || "请输入用户名"]);

const passwordRules = ref([
  (v: string) => !!v || "请输入密码",
  (v: string) => (v && v.length <= 15) || "密码必须小于十五个字符",
]);

// const againpasswordRules = ref([
//   (v: string) => !!v || "请再次输入密码",
//   (v: string) => (v === password.value) || "两次输入密码不一致",
// ]);

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
  <v-card color="white" class="pa-3 ma-3" elevation="3">
    <v-card-title primary-title class="my-4 text-h4">
      <span class="flex-fill"> {{ $t("register.title") }} </span>
    </v-card-title>
    <v-card-subtitle>Let's build amazing products</v-card-subtitle>
    <!-- sign in form -->

    <v-card-text>
      <v-form
        ref="refLoginForm"
        class="text-left"
        v-model="isFormValid"
        lazy-validation
      >
        <v-text-field
          v-model="username"
          required
          :error="error"
          :label="$t('register.username')"
          density="default"
          variant="underlined"
          color="primary"
          bg-color="#fff"
          :rules="usernameRules"
          name="username"
          outlined
          validateOn="blur"
          @keyup.enter="handleRegister"
          @change="resetErrors"
        ></v-text-field>
        <v-text-field
          ref="refEmail"
          v-model="email"
          required
          :error="error"
          :label="$t('register.email')"
          density="default"
          variant="underlined"
          color="primary"
          bg-color="#fff"
          :rules="emailRules"
          name="email"
          outlined
          validateOn="blur"
          @keyup.enter="handleRegister"
          @change="resetErrors"
        ></v-text-field>
        <v-text-field
          ref="refPassword"
          v-model="password"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          :error="error"
          :error-messages="errorMessages"
          :label="$t('register.password')"
          density="default"
          variant="underlined"
          color="primary"
          bg-color="#fff"
          :rules="passwordRules"
          name="password"
          outlined
          validateOn="blur"
          @change="resetErrors"
          @keyup.enter="handleRegister"
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>
        <v-text-field
          ref="refPassword"
          v-model="againpassword"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          :error="error"
          :error-messages="errorMessages"
          :label="$t('register.againword')"
          density="default"
          variant="underlined"
          color="primary"
          bg-color="#fff"
          name="againword"
          outlined
          validateOn="blur"
          @change="resetErrors"
          @keyup.enter="handleRegister"
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>
        <v-btn
          :loading="isLoading"
          :disabled="isSignInDisabled"
          block
          size="x-large"
          color="primary"
          @click="handleRegister"
          class="mt-2"
          >{{ $t("register.button") }}</v-btn
        >

        <!-- external providers list -->

        <div v-if="errorProvider" class="error--text my-5">
          {{ errorProviderMessages }}
        </div>
      </v-form></v-card-text
    >
  </v-card>
  <div class="text-center mt-6">
    {{ $t("register.account") }}
    <router-link to="/auth/signin" class="text-primary font-weight-bold">
      {{ $t("register.signin") }}
    </router-link>
  </div>
</template>
