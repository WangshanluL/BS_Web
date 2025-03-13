<script setup lang="ts">
import { faker } from "@faker-js/faker";
import moment from "moment";
import axios from "axios";
import { getCurrentInstance } from "vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
const snackbarStore = useSnackbarStore();
const { proxy } = getCurrentInstance();


const initArticle=()=>{
  axios.post(proxy.globalInfo.url_f+'/forum/getAllArticles')
    .then(response => {
      console.log("获取为")
      console.log(response.data.data);
      desserts.value=response.data.data;
      // snackbarStore.showSuccessMessage("哈哈哈");
      // console.log()
      
    })
    .catch(error => {
      console.error('Error fetching data: ', error);
      
    });
}



onMounted(() => {
  // console.log(list());
  initArticle();




});

const dialog = ref(false);
const search = ref("");
const roles = ref(["用户", "管理员"]);
// const rolesbg = ref(["用户", "secondary", "error", "success", "warning"]);
const desserts = ref([]);
const editedIndex = ref(-1);
const refForm = ref();
const editedItem = ref({


});
const defaultItem = ref({
  id: "",
  avatar: faker.internet.avatar(),
  username: "",
  usermail: "",
  phone: "",
  jdate: "",
  role: "",
 
});

const nameRules = [
  (v) => !!v || "Name is required",
  (v) => (v && v.length <= 10) || "Name must be less than 10 characters",
];

//Methods
const filteredList = computed(() => {
  return desserts.value.filter((user: any) => {
    return user.title.toLowerCase().includes(search.value.toLowerCase());
  });
});

function editItem(item: any) {
  
  editedIndex.value = desserts.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
}
const willdeleteItem=ref(null);
const willdeleteIndex=ref(-1);
function deleteAny(item: any){
  dialogVisible.value = true;
  willdeleteIndex.value = desserts.value.indexOf(item);
  willdeleteItem.value = Object.assign({}, item);
}




function deleteItem() {
  console.log("删除的item在这里")
  //删除完之后得重新获取用户信息
  console.log(willdeleteItem.value)
  const index = willdeleteIndex.value;
  console.log(index)
  desserts.value.splice(index, 1);
  axios.post(proxy.globalInfo.url_f+'/forum/deleteArticles',{
    articleId:willdeleteItem.value.ArticleId,
    }) 
    .then(response => {
      snackbarStore.showSuccessMessage("删除成功");
      dialogVisible.value = false;
    })
    .catch(error => {
      snackbarStore.showSuccessMessage("删除失败，请重试");
      dialogVisible.value = false;
      // console.error('Error fetching data: ', error);
      
    });



}

function close() {
  dialog.value = false;
  setTimeout(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  }, 300);
}

const dialogVisible = ref(false);




function save() {
  if (editedIndex.value > -1) {
    editedItem.value.status="已审核";
    Object.assign(desserts.value[editedIndex.value], editedItem.value);
    console.log("hhhhhhhhhhhhhhh")
    console.log(editedItem.value)
    // 这里发送axios请求保存在数据库。是保存
    axios.post(proxy.globalInfo.url_f+'/forum/permitArticles',{
      articleId:editedItem.value.ArticleId,

    })
    .then(response => {
      
      snackbarStore.showSuccessMessage("修改成功");
    })
    .catch(error => {
      console.error('Error fetching data: ', error);
      
    });



  } else {
    desserts.value.push(editedItem.value);
  }
  close();
}
const roleColor = computed(() => {
  return editedIndex.value === -1 ? "New Contact" : "Edit Contact";
});
//Computed Property
const formTitle = computed(() => {
  return editedIndex.value === -1 ? "New Contact" : "Edit Contact";
});
</script>
<template>
  <!-- <el-dialog
v-model="dialogVisible"
title="Tips"
width="500"
:before-close="handleClose"
>
<span>请问你确定删除聊天记录吗？一旦删除，无法恢复</span>
<template #footer>
  <div class="dialog-footer">
    <el-button @click="dialogVisible = false">取消</el-button>
    <el-button type="primary" @click="deleteItem()">
      确定
    </el-button>
  </div>
</template>
</el-dialog> -->
<v-dialog v-model="dialogVisible" max-width="700">

<v-card>
  <v-card-title class="pa-4 bg-secondary">
    <span class="title text-white">你确定删除该文章吗？</span>
  </v-card-title>
  <v-card-actions class="pa-4">
    <v-spacer></v-spacer>
    <v-btn color="error" @click="dialogVisible=false">取消</v-btn>
    <v-btn
      color="secondary"
     
      variant="flat"
      @click="deleteItem"
      >确定</v-btn
    >
  </v-card-actions>
</v-card>
</v-dialog>



  <v-container>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="4" md="6">
            <v-text-field
              density="compact"
              v-model="search"
              label="搜索帖子"
              hide-details
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="8" md="6" class="text-right">
            <v-dialog v-model="dialog" max-width="700">
              
              <v-card>
                <v-card-title class="pa-4 bg-secondary">
                  <span class="title text-white">是否确定审核通过该帖子？</span>
                </v-card-title>

                
                <v-card-actions class="pa-4">
                  <v-spacer></v-spacer>
                  <v-btn color="error" @click="close">取消</v-btn>
                  <v-btn
                    color="secondary"
                    :disabled="
                      editedItem.username == '' || editedItem.usermail == ''
                    "
                    variant="flat"
                    @click="save"
                    >确定</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-2">
      <v-table class="mt-5">
        <thead>
          <tr>
            <th class="text-subtitle-1 font-weight-semibold">作者信息</th>
            <th class="text-subtitle-1 font-weight-semibold">封面</th>
            <th class="text-subtitle-1 font-weight-semibold">标题</th>
            <th class="text-subtitle-1 font-weight-semibold">板块</th>
            <th class="text-subtitle-1 font-weight-semibold">发布时间</th>
            <th class="text-subtitle-1 font-weight-semibold">互动信息</th>
            <th class="text-subtitle-1 font-weight-semibold">状态</th>
            <th class="text-subtitle-1 font-weight-semibold">操作</th>

          </tr>
        </thead>
        <tbody class="text-body-1">
          <tr v-for="item in filteredList" :key="item.ArticleId">
            <td>
              <div class="d-flex align-center py-1">
                <div>
                  <!-- <v-img :src="proxy.globalInfo.avatarUrl + item.avatar+'.jpg'"> </v-img> -->
                  <v-img
                  :src="proxy.globalInfo.avatarUrl + item.authorImage+'.jpg'"
                    width="40"
                    class="rounded-circle img-fluid"
                  ></v-img>
                </div>

                <div class="ml-5">
                  <p class="font-weight-bold">{{ item.authorName }}</p>
                  <span class="d-block mt-1 text-caption textSecondary">{{
                    item.authorEmail
                  }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="d-flex align-center py-1">
                <div>

                  <!-- <v-img :src="proxy.globalInfo.avatarUrl + item.avatar+'.jpg'"> </v-img> -->
                  <v-img
                  :src="proxy.globalInfo.coverImage + item.cover"
                    width="40"
                    class="img-fluid"
                  ></v-img>
                </div>

                
              </div>
            </td>
            <td> {{ item.title }} </td>
            <td> {{ item.board }}</td>
            
            <td>{{ item.postTime }}</td>
            <td>
              <div class="d-flex align-center py-1">
                <div class="ml-5">
                  <p class="font-weight-bold">点赞: {{ item.like }}</p>
                  <p class="font-weight-bold">阅读:{{ item.read }}</p>
                  <p class="font-weight-bold">评论: {{ item.comment }}</p>
                  <!-- <span class="d-block mt-1 text-caption textSecondary">{{
                    item.usermail
                  }}</span> -->
                </div>
              </div>
            </td>
            
            <td>
              状态
              <v-chip v-if="item.status=='未审核'"
                class="font-weight-bold"
                color="primary"
                size="small"
                label
                >{{ item.status }}</v-chip
              >
              <v-chip v-if="item.status=='已审核'"
                class="font-weight-bold"
                color="success"
                size="small"
                label
                >{{ item.status }}</v-chip
              >
            </td>
            
            <td>
              <div class="d-flex align-center">
                
                <v-tooltip text="Delete" >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      @click="deleteAny(item)"
                      v-bind="props"
                      color="error"
                    >
                      <v-icon>mdi-delete-outline</v-icon>
            
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="审核通过"  v-if="item.status=='未审核'">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      color="blue"
                      icon
                      variant="text"
                      @click="editItem(item)"
                      v-bind="props"
                    >
                      <v-icon>mdi-stamper</v-icon>
                      
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
