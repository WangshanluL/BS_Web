<!--
* @Component: 
* @Maintainer: J.K. Yang
* @Description: 
-->

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();



const uploadImage = async (file) => {
  file = file.file;
  const formData = new FormData();
  formData.append('file', file);


};

import { useProfileStore } from "@/stores/profileStore";
import ArticleListItem from "@/views/forum/forums/ArticleListItem.vue";
const profileStore = useProfileStore();


import axios from "axios";
const showComment = ref(true);
//-------------------文章
const userInfo = ref({});
const shenfen = ref("");
const isCurrentUser = ref(true);
const updateUserInfo=()=>{
  console.log("hhhhhhhhhhh");
  let result = axios.post(proxy.globalInfo.url_f+'/ucenter/updateUserInfo', {
    userId:userInfo.value.userId,
    personDescription:willPersonDesc.value,
    nickName:willUsername.value
  });
  router.push('/profile');
}



import {  getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
const loadArticle = async () => {
  loading.value = true;
  let params = {
    pageNo: articleListInfo.value.pageNo,
    type: activeTabName.value,
    userId: userInfo.value.userId,
  };
  try {
    let result = await axios.post(proxy.globalInfo.url_f+'/ucenter/loadUserArticle', params);
    loading.value = false;
    if (result && result.data) {
      articleListInfo.value = result.data.data;
    }
  } catch (error) {
    console.error('Error loading article:', error);
    loading.value = false;
  }
};
const willUsername=ref("");
const willPersonDesc=ref("");
onMounted(() => {
  const userInfoData = localStorage.getItem("userInfo");
  if (userInfoData) {
    const userinf = JSON.parse(userInfoData);
    userInfo.value = userinf;
    willUsername.value=userInfo.value.nickName;
    willPersonDesc.value = userInfo.value.personDescription;

    if(userInfo.value.isAdmin==0){
      shenfen.value="用户";
    }else{
      shenfen.value="管理员"
    }
    
  } else {
    console.log('localStorage 中不存在名为 "userInfo" 的数据');
  }
  loadArticle();


})
//右侧文章
const activeTabName = ref(0);
const changeTab = (type) => {
  activeTabName.value = type;
  loadArticle();
};

const loading = ref(false);
const articleListInfo = ref({});




const notifications = reactive({
  officialEmails: false,
  followerUpdates: false,
});

const passwords = reactive({
  currentPassword: "123456",
  newPassword: "",
  confirmPassword: "",
});

const currentPasswordShow = ref(false);
const newPasswordShow = ref(false);
const confirmPasswordShow = ref(false);







</script>


<template>
  <v-sheet elevation="0" class="mx-auto" color="transparent" max-width="1600">
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <div class="d-flex flex-column pa-10">
            <v-avatar size="120" class="mx-auto elevation-12" color="white">
              <v-img :src="proxy.globalInfo.avatarUrl + userInfo.userId+'.jpg'"> </v-img>
            </v-avatar>

            <div class="text-center mt-5">
              <h3 class="text-h6 font-weight-bold">
                {{ userInfo.nickName }}
                <v-chip size="small" class="font-weight-bold" color="blue">
                  {{ shenfen }}
                </v-chip>
              </h3>
              <p class="text-body-2">{{ userInfo.personDescription }}</p>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="py-5 px-10">
            <v-icon color="grey"> mdi-map-marker </v-icon>
            <span class="ml-4" >上海</span>
          </div>

          <v-divider></v-divider>
          <div class="py-5 px-10">
            <v-icon color="grey"> mdi-email-check-outline </v-icon>
            <span class="ml-4">{{ userInfo.email }}</span>
          </div>
          <v-divider></v-divider>

     
        </v-card>
      </v-col>
      <v-col cols="12" md="9">
        <!-- ---------------------------------------------- -->
        <!--   Basic Infomation -->
        <!-- ---------------------------------------------- -->
        <v-card class="mb-5">
          <v-card-title class="bg-white py-4 font-weight-bold">
            基本信息
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-7">
            <v-row>
              <v-col cols="12" sm="6">
                <v-label class="font-weight-medium mb-2">用户名</v-label>
                <v-text-field
                  v-model="willUsername"
                  color="primary"
                  variant="outlined"
                  density="compact"
                  type="text"
                  placeholder="请输入用户名"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-label class="font-weight-medium mb-2">个人介绍</v-label>
                <v-text-field
                  v-model="willPersonDesc"
                  color="primary"
                  variant="outlined"
                  density="compact"
                  type="text"
                  placeholder="请输入个人介绍"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-label class="font-weight-medium mb-2">Email</v-label>
                <v-text-field
                  class="bg-blue-grey-lighten-5"
                  readonly
                  v-model="userInfo.email"
                  color="primary"
                  variant="outlined"
                  density="compact"
                  type="text"
                  placeholder="John Deo"
                  hide-details
              /></v-col>
              <v-col cols="12" sm="6">
                <v-label class="font-weight-medium mb-2">头像</v-label>
                
                <div class="cover-upload">
    <el-upload
      name="file"
      :show-file-list="false"
      accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
      :multiple="false"
      :http-request="uploadImage"
      
    >
      <div class="cover-upload-btn">
        <template v-if="localFile">
          <img :src="localFile" />
        </template>
        <template v-else>
          <img
            :src="
               proxy.globalInfo.imageUrl
            "
            v-if="modelValue && modelValue.imageUrl"
          />
          <span class="iconfont icon-add" v-else></span>
        </template>
      </div>
    </el-upload>
  </div>
              
              
              
              
              
              
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn
              class="px-5"
              color="primary"
              elevation="1"
              variant="elevated"
              @click="updateUserInfo()"
            >
              确认更改</v-btn
            >
          </v-card-actions>
        </v-card>

        <!-- ---------------------------------------------- -->
        <!--   Change Password  -->
        <!-- ---------------------------------------------- -->
        <v-card class="mb-5">
          <v-card-title class="bg-white py-4 font-weight-bold">
            Change Password
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-7">
            <v-row>
              <v-col cols="12" sm="6">
                <v-label class="font-weight-medium mb-2"
                  >Current Password</v-label
                >
                <v-text-field
                  readonly
                  v-model="passwords.currentPassword"
                  class="bg-blue-grey-lighten-5"
                  density="compact"
                  color="primary"
                  variant="outlined"
                  :type="currentPasswordShow ? 'text' : 'password'"
                  placeholder="Current Password"
                  hide-details
                  :append-inner-icon="
                    currentPasswordShow ? 'mdi-eye' : 'mdi-eye-off'
                  "
                  @click:append-inner="
                    currentPasswordShow = !currentPasswordShow
                  "
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6"> </v-col>
              <v-col cols="12" sm="6">
                <v-label class="font-weight-medium mb-2">Password</v-label>
                <v-text-field
                  v-model="passwords.newPassword"
                  density="compact"
                  color="primary"
                  variant="outlined"
                  :type="newPasswordShow ? 'text' : 'password'"
                  placeholder="new password"
                  hide-details
                  :append-inner-icon="
                    newPasswordShow ? 'mdi-eye' : 'mdi-eye-off'
                  "
                  @click:append-inner="newPasswordShow = !newPasswordShow"
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-label class="font-weight-medium mb-2"
                  >Confirm Password</v-label
                >
                <v-text-field
                  v-model="passwords.confirmPassword"
                  density="compact"
                  color="primary"
                  variant="outlined"
                  :type="confirmPasswordShow ? 'text' : 'password'"
                  placeholder="confirm password"
                  hide-details
                  :append-inner-icon="
                    confirmPasswordShow ? 'mdi-eye' : 'mdi-eye-off'
                  "
                  @click:append-inner="
                    confirmPasswordShow = !confirmPasswordShow
                  "
                >
                </v-text-field
              ></v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn
              class="px-5"
              color="primary"
              elevation="1"
              variant="elevated"
            >
              Unpdate Password</v-btn
            >
          </v-card-actions>
        </v-card>

        <v-card class="mb-5">
          <v-card-title class="bg-white py-4 font-weight-bold">
            用户发帖信息
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-7">
            <div class="article-panel">
              <el-tabs :model-value="activeTabName" @tab-change="changeTab">
                <el-tab-pane label="发帖" :name="0"></el-tab-pane>
                <el-tab-pane label="评论" :name="1"></el-tab-pane>
                <el-tab-pane label="点赞" :name="2"></el-tab-pane>
              </el-tabs>
              <div class="article-list">
                <DataList
                  :loading="loading"
                  :dataSource="articleListInfo"
                  @loadData="loadArticle"
                  noDataMsg="暂无相关文章"
                >
                  <template #default="{ data }">
                    <ArticleListItem
                      :data="data"
                      :showEdit="activeTabName == 0 && isCurrentUser"
                      :showComment="showComment"
                    ></ArticleListItem>
                  </template>
                </DataList>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<style lang="scss">
.cover-upload {
 
  .cover-upload-btn {
    background: rgb(245, 245, 245);
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    .iconfont {
      font-size: 50px;
      color: #ddd;
    }
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.ucenter {
  .user-banner {
    color: #9ba7b9;
    line-height: 35px;
    .icon-right {
      padding: 0px 5px;
    }
  }
  .ucenter-panel {
    display: flex;
    .user-side {
      width: 300px;
      margin-right: 10px;
      .avatar-panel {
        background: #fff;
        text-align: center;
        padding: 10px;
        .edit-btn {
          text-align: right;
          font-size: 14px;
        }
        .avatar-inner {
          display: flex;
          justify-content: center;
        }
        .nick-name {
          .iconfont {
            margin-left: 5px;
            color: var(--link);
          }
        }
        .desc {
          margin-top: 5px;
          text-align: left;
          font-size: 14px;
          color: #929393;
        }
      }
      .user-extend-panel {
        margin-top: 10px;
        background: #fff;
        padding: 10px;
        .info-item {
          display: flex;
          justify-content: space-between;
          line-height: 30px;
          .label {
            font-size: 13px;
          }
          .label::before {
            font-size: 22px;
            color: #888888;
            padding-right: 5px;
          }
          .value {
            font-size: 13px;
          }
        }
      }
    }
    .article-panel {
      flex: 1;
      background: #fff;
      padding: 0px 10px 10px 10px;
    }
  }
}
</style>
