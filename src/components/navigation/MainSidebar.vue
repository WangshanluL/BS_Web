<!--
* @Component: 
* @Maintainer: J.K. Yang
* @Description: 
-->
<script setup lang="ts">
import configs from "@/configs";
import MainMenu from "@/components/navigation/MainMenu.vue";
import { useCustomizeThemeStore } from "@/stores/customizeTheme";

const customizeTheme = useCustomizeThemeStore();
const navigation = ref(configs.navigation);
const userInfo = ref({});
onMounted(() => {
  scrollToBottom();
  const userInfoData = localStorage.getItem('userInfo');
  const userinf = JSON.parse(userInfoData);
  userInfo.value = userinf;
  console.log("mainsider获取的是");
  console.log(userInfo.value);
});

const scrollToBottom = () => {
  const contentArea = document.querySelector(".v-navigation-drawer__content");
  const activeItem = document.querySelector(
    ".v-list-item--active"
  ) as HTMLElement;

  setTimeout(() => {
    contentArea?.scrollTo({
      top: activeItem?.offsetTop,
    });
  }, 100);
};
</script>

<template>
  <v-navigation-drawer
    border="none"
    elevation="1"
    v-model="customizeTheme.mainSidebar"
    id="mainMenu"
  >
    <!-- ---------------------------------------------- -->
    <!---Top Area -->
    <!-- ---------------------------------------------- -->
    <template v-if="!customizeTheme.miniSidebar" v-slot:prepend>
      <v-card
        style="box-shadow: rgba(0, 0, 0, 0.05) 10px 25px 15px -20px"
        height="150"
        class="d-flex align-center justify-center"
      >
        <img
          v-if="customizeTheme.darkTheme"
          width="130"
          src="@/assets/logo/final.jpg"
          alt=""
        />
        <img
          v-else="customizeTheme.darkTheme"
          width="130"
          src="@/assets/logo/logo2_light.jpg"
          alt=""
        />
      </v-card>
      <div
        style="
          justify-content: center;
          text-align: center;
          font-family: 'SourceHanSansCN-Bold';
          font-size: 30px;
          height: 30px;
          width: 100%;
          margin-bottom: 10px;
        "
      >
        医智伴行
      </div>
    </template>


    <main-menu v-if="userInfo.isAdmin===0" :menu="navigation.menu"></main-menu>
    <main-menu v-else :menu="navigation.adminMenu"></main-menu>

  </v-navigation-drawer>
</template>

<style scoped lang="scss">

</style>
