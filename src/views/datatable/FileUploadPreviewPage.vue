<!--
* @Component:
* @Maintainer: J.K. Yang
* @Description:
-->
<script setup lang="ts">
import moment from "moment";
import { formatFileSize } from "@/utils/common";
import AnimationUpload from "@/components/animations/AnimationUpload.vue";
import { getCurrentInstance } from "vue";


import { useSnackbarStore } from "@/stores/snackbarStore";
const snackbarStore = useSnackbarStore();
const { proxy } = getCurrentInstance();
const loading = ref(false);
const files = ref<any[]>([]);
const fileInfos = ref<any[]>([]);
const search = ref("");
// Create FileInfos
const updatePreviews = async () => {
  fileInfos.value.length = 0;
  for (const file of files.value) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    const filePromise = new Promise((resolve, reject) => {
      reader.onload = () => {
        // 获取图片的长宽尺寸
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          resolve({
            name: file.name,
            size: formatFileSize(file.size),
            imageSize: width + "x" + height,
            type: file.type,
            suffix: file.name.split(".").pop(),
            lastModifiedDate: moment(file.lastModifiedDate).format(
              "YYYY-MM-DD HH:mm:ss"
            ),
            link: reader.result,
            previewEnabled: true,
          });
        };
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
    fileInfos.value.push(await filePromise);
  }
  console.log("fileInfos");
  console.log(fileInfos.value);
};

import axios from "axios";
const moxing=ref("");
const xiaoyi=ref("");
const uploadImages = async () => {
  try {
    loading.value = true;
    for (const file of files.value) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("content", search.value);
      // clearFiles();
      snackbarStore.showSuccessMessage("发送成功，请耐心等待");
      await axios.post(proxy.globalInfo.url_f + "/uploadPicAndAnswer", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(function (response) {
    // 请求成功时，处理响应数据
    moxing.value=response.data.modelOut
    xiaoyi.value=response.data.response
    snackbarStore.showSuccessMessage("请求成功");
    console.log('请求成功:', response.data);
  });
      // search.value="";
      loading.value = false;
      
    }
    console.log("Images uploaded successfully");
  } catch (error) {
    console.error("Error uploading images:", error);
  }
};
const clear=()=>{
  search.value="";
  clearFiles();
  xiaoyi.value="";
  moxing.value="";

}
// Reamove Image
const removeImage = (index: number) => {
  files.value.splice(index, 1);
  fileInfos.value.splice(index, 1);
};

// Clear Files
const clearFiles = () => {
  files.value.length = 0;
  fileInfos.value.length = 0;
};
import { Icon } from "@iconify/vue";
</script>

<template>
  <v-container>
    <v-container>
    <v-card class="mx-auto" color="primary" max-width="100%">
      <v-card-text style="display: flex;">
        <v-text-field
          v-model="search"
          :loading="loading"
          append-inner-icon="mdi-magnify"
          density="compact"
          label="请输入问题"
          variant="solo"
          hide-details
          style="width: 70%;margin-right: 20px"
          single-line
          
        ></v-text-field>
        <v-btn
          class="mb-1"
          variant="elevated"
          icon
          @click="uploadImages"
        >
          <v-icon size="30" class="text-primary">mdi-send</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            text="发送"
          ></v-tooltip>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
   
    <div class="d-flex justify-space-between align-start">
      
      <v-row>
        <v-col cols="12" md="5" lg="4">
          <v-file-input
            v-model="files"
            @change="updatePreviews"
            color="primary"
            counter
            label="Images Upload"
            accept="image/png, image/jpeg, image/bmp"
            multiple
            placeholder="Upload your images"
            prepend-icon="mdi-image-multiple-outline"
            variant="solo"
            @click:clear="clearFiles"
            :show-size="1000"
          >
            <template v-slot:selection="{ fileNames }">
              <template v-for="(fileName, index) in fileNames" :key="index">
                <v-chip
                  v-if="index < 6"
                  color="primary"
                  label
                  size="large"
                  class="me-2"
                >
                  {{ fileName }}
                </v-chip>
              </template>
            </template>
          </v-file-input>
          <v-divider class="my-5"></v-divider>
          <!-- ---------------------------------------------- -->
          <!-- No File View -->
          <!-- ---------------------------------------------- -->
          <v-sheet
            class="d-flex align-center justify-center"
            height="500"
            v-if="fileInfos.length === 0"
          >
            <div class="text-center">
              <h4 class="text-h5 text-md-h3 font-weight-bold text-primary">
                请上传皮肤照片
              </h4>
              <AnimationUpload :size="300" />
            </div>
          </v-sheet>
          <v-sheet v-else>
            <perfect-scrollbar class="view pa-5">
              <!-- ---------------------------------------------- -->
              <!-- Grid View -->
              <!-- ---------------------------------------------- -->
              <v-row>
                <v-col
                  class="12"
                  md="12"
                  lg="12"
                  v-for="fileInfo in fileInfos"
                  :key="fileInfo.link"
                >
                  <v-card>
                    <v-card-title>
                      <v-spacer></v-spacer>
                      <v-btn
                        @click="removeImage"
                        class="text-primary"
                        variant="flat"
                        ><v-icon size="30">mdi-delete</v-icon></v-btn
                      ></v-card-title
                    >
                    <v-divider></v-divider>
                    <v-card-text>
                      <v-img height="300" :src="fileInfo.link"></v-img>
                    </v-card-text>
                    <v-divider></v-divider>
                    <div class="d-flex align-center pa-3">
                      <div class="flex-fill">
                        <h5 class="text-h6 font-weight-bold">
                          {{ fileInfo.name }}
                        </h5>
                        <h6 class="text-grey">
                          {{ fileInfo.suffix }} {{ fileInfo.imageSize }}
                        </h6>
                      </div>
                      <div>
                        <v-chip
                          color="primary"
                          class="font-weight-bold"
                          label
                          rounded="sm"
                          variant="elevated"
                        >
                          {{ fileInfo.type }}
                        </v-chip>
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </perfect-scrollbar>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="7" lg="8">

          <div class="card">
              <div class="cup-warp">
                <Icon class="animate-icon cup" icon="fxemoji:sunrays" />

                <!-- <Icon class="animate-icon" icon="logos:bamboo" /> -->
              </div>

              <h4 class="text-h5 text-md-h3 font-weight-bold text-primary">
                输出结果
              </h4>
              <v-divider class="my-5"></v-divider>
              <h6 class="text-h8 text-md-h5 text-primary">
                皮肤病诊断模型输出：
              </h6>
              <h6 class="text-h9 text-md-h6 text-primary">
                {{ moxing }}
              </h6>
              <v-divider class="my-5"></v-divider>
              <h6 class="text-h8 text-md-h5 text-primary">
                小医回答：
              </h6>
              <h6 class="text-h9 text-md-h6 text-primary">
                {{ xiaoyi }}
              </h6>
              <v-divider class="my-5"></v-divider>
              <v-btn color="primary" text="我知道了" @click="clear"></v-btn>
            </div>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped lang="scss">

.card {
  position: relative;
  height: 100%;
  width: 100%;
  margin: 50px auto 0px;
  padding: 50px 30px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  &:after {
    position: absolute;
    left: 5px;
    bottom: -7px;
    width: 96%;
    height: 7px;
    background-color: #e2eaf1;
    border-radius: 0 0 5px 5px;
    content: "";
  }
  &:before {
    position: absolute;
    left: 10px;
    bottom: -14px;
    width: 92%;
    height: 7px;
    background-color: #cfd5e3;
    border-radius: 0 0 5px 5px;
    content: "";
    box-shadow: 0 5px 60px rgba(0, 0, 0, 0.5);
  }

  .cup-warp {
    width: 100px;
    height: 100px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, -50%);
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cup {
    width: 70px;
    height: 70px;
    color: #ffda00;
    filter: drop-shadow(0 0 40px rgba(255, 218, 0, 0.7));
    animation: rotate 10s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
}

</style>
