<!--
* @Component: ToolbarNotifications
* @Maintainer: J.K. Yang
* @Description: 
-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
const colors = ref(["primary","success","teal lighten-1","teal accent-3","blue-grey lighten-2",]);
const icons = ref(["mdi-email-outline","mdi-message-reply-text","mdi-thumb-up","mdi-thumb-up","mdi-account-arrow-down"]);
const titles = ref(["系统通知","评论通知","文章点赞通知","评论点赞通知","附件下载通知"]);
const userInfo = ref({});
// v'0:系统消息 1:评论 2:文章点赞  3:评论点赞 4:附件下载',
import axios from 'axios';

// 假设前端给的地址是 /ucenter/getMessageCount
const frontendEndpoint = '/ucenter/getMessageCount';
const showNotifications=ref([]);
import {  getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
onMounted(() => {
  // 从 localStorage 中获取数据
  const userInfoData = localStorage.getItem("userInfo");

  // 如果存在该数据，则将其解析为 JavaScript 对象
  if (userInfoData) {
    const userinf = JSON.parse(userInfoData);
    userInfo.value = userinf;

    // 然后你可以在这里继续处理获取到的数据
  } else {
    // 如果 localStorage 中不存在名为 'userInfo' 的数据，可能是因为之前没有设置过，或者被清除了
    console.log('localStorage 中不存在名为 "userInfo" 的数据');
  }
  axios.post(proxy.globalInfo.url_f + frontendEndpoint, {
  userId: userInfo.value.userId 
})
.then(response => {
  showNotifications.value = response.data.data;

  console.log(response.data); // 在这里处理后端返回的数据
})
.catch(error => {
  console.error('Error fetching data:', error);
});
});
const clearAll = async () => {
  try {
    const response = await axios.post(proxy.globalInfo.url_f+'/ucenter/clearMessageNotifications', {
      userId:  userInfo.value.userId
    });
    console.log(response.data);
    // 这里可以根据接口返回的数据执行相应的操作，比如更新界面等
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
  showNotifications.value = [];
};





</script>

<template>
  <v-menu location="bottom right" transition="slide-y-transition">
    <!-- ---------------------------------------------- -->
    <!-- Activator Btn -->
    <!-- ---------------------------------------------- -->
    <template v-slot:activator="{ props }">
      <v-btn icon v-bind="props" class="text-none">
        <v-badge :content="showNotifications.total" color="error" v-if="showNotifications.length != 0">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
        <v-badge content=0 color="error" v-else>
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <v-list elevation="1" lines="three" density="compact" max-width="400">
      <v-list-subheader>Notifications</v-list-subheader>
      <v-list-item v-for="(message, i) in showNotifications.list" :key="i" >
        <!-- ---------------------------------------------- -->
        <!-- Prepend-->
        <!-- ---------------------------------------------- -->
        <template v-slot:prepend>
          <v-avatar size="40" :color="colors[message.messageType]">
            <v-icon color="white">{{ icons[message.messageType] }}</v-icon>
          </v-avatar>
        </template>
        <!-- ---------------------------------------------- -->
        <!-- Append-->
        <!-- ---------------------------------------------- -->
      
        <!-- ---------------------------------------------- -->
        <!-- Main Content-->
        <!-- ---------------------------------------------- -->
        <div>
          <v-list-item-title class="font-weight-bold text-primary">{{
            titles[message.messageType]
          }}</v-list-item-title>
          <v-list-item-subtitle v-if="message.messageType==0">{{ message.messageContent }}</v-list-item-subtitle>
          <v-list-item-subtitle v-else-if="message.messageType==1">用户<strong>{{message.sendNickName}}</strong>评论了你的文章"<strong>{{ message.articleTitle }}</strong>"</v-list-item-subtitle>
          <v-list-item-subtitle v-else-if="message.messageType==2">用户<strong>{{message.sendNickName}}</strong>点赞了你的文章"<strong>{{ message.articleTitle }}</strong>"</v-list-item-subtitle>
          <v-list-item-subtitle v-else-if="message.messageType==3">用户<strong>{{message.sendNickName}}</strong>点赞了你的评论</v-list-item-subtitle>
          <v-list-item-subtitle v-else-if="message.messageType==4">用户<strong>{{message.sendNickName}}</strong>下载了你的附件</v-list-item-subtitle>
        </div>
      </v-list-item>
      <!-- ---------------------------------------------- -->
      <!-- See all Btn-->
      <!-- ---------------------------------------------- -->
      <div class="text-center py-5">
        <v-btn size="small" variant="elevated" elevation="1" @click="clearAll"> See all </v-btn>
      </div>
    </v-list>
  </v-menu>
</template>

<style scoped lang="scss">

</style>
