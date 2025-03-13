<script setup lang="ts">
import { faker } from "@faker-js/faker";
import moment from "moment";
import axios from "axios";
import { getCurrentInstance } from "vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
const snackbarStore = useSnackbarStore();
const { proxy } = getCurrentInstance();


const initUser=()=>{
  axios.post(proxy.globalInfo.url_f+'/ucenter/getAllUsers')
    .then(response => {
      console.log("获取为")
      console.log(response.data.data);
      desserts.value=response.data.data;
      snackbarStore.showSuccessMessage("获取信息成功");
      
      
    })
    .catch(error => {
      console.error('Error fetching data: ', error);
      
    });
}



onMounted(() => {
  // console.log(list());
  initUser();




});

const dialog = ref(false);
const search = ref("");
const roles = ref(["用户", "管理员"]);
// const rolesbg = ref(["用户", "secondary", "error", "success", "warning"]);
const desserts = ref([]);
const editedIndex = ref(-1);
const refForm = ref();
const editedItem = ref({
  id: "",
  avatar: "1.jpg",
  username: "",
  usermail: "",
  phone: "",
  jdate: "",
  role: "",
 
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
    return user.username.toLowerCase().includes(search.value.toLowerCase());
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
  axios.post(proxy.globalInfo.url_f+'/ucenter/deleteAllUser',{
      id:willdeleteItem.value.id,
    }) 
    .then(response => {
      snackbarStore.showSuccessMessage("删除成功");
      dialogVisible.value = false;
    })
    .catch(error => {
      console.error('Error fetching data: ', error);
      
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
const handleClose = (done: () => void) => {
    ElMessageBox.confirm('你确定关闭对话框吗?')
      .then(() => {
        done()
      })
      .catch(() => {
        // catch error
      })
  }




function save() {
  if (editedIndex.value > -1) {
    Object.assign(desserts.value[editedIndex.value], editedItem.value);
    console.log("hhhhhhhhhhhhhhh")
    console.log(editedItem.value)
    // 这里发送axios请求保存在数据库。是保存
    axios.post(proxy.globalInfo.url_f+'/ucenter/updateAllUser',{
      id:editedItem.value.id,
      jdate:editedItem.value.jdate,
      role:editedItem.value.role,
      usermail:editedItem.value.usermail,
      username:editedItem.value.username,
      descripe:editedItem.value.descripe

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

<v-dialog v-model="dialogVisible" max-width="700">

<v-card>
  <v-card-title class="pa-4 bg-secondary">
    <span class="title text-white">你确定删除该用户吗？</span>
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
              label="搜索账号"
              hide-details
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="8" md="6" class="text-right">
            <v-dialog v-model="dialog" max-width="700">
              <template v-slot:activator="{ props }">
                <v-btn color="primary" v-bind="props" flat class="ml-auto">
                  <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>
                  创建账号
                </v-btn>
              </template>
              <v-card>
                <v-card-title class="pa-4 bg-secondary">
                  <span class="title text-white">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-form
                    class="mt-5"
                    ref="form"
                    v-model="refForm"
                    lazy-validation
                  >
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          variant="outlined"
                          color="primary"
                          density="compact"
                          v-model="editedItem.id"
                          label="用户Id"
                          type="text"
                          readonly
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          variant="outlined"
                          color="primary"
                          density="compact"
                          :rules="nameRules"
                          :counter="10"
                          required
                          v-model="editedItem.username"
                          label="用户名"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          variant="outlined"
                          color="primary"
                          density="compact"
                          v-model="editedItem.usermail"
                          label="用户邮箱"
                          type="email"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          variant="outlined"
                          color="primary"
                          density="compact"
                          v-model="editedItem.descripe"
                          label="个人描述"
                          type="phone"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          variant="outlined"
                          color="primary"
                          density="compact"
                          v-model="editedItem.jdate"
                          label="创建时间"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select
                          variant="outlined"
                          color="primary"
                          density="compact"
                          :items="roles"
                          v-model="editedItem.role"
                          label="身份"
                        ></v-select>

                        <!-- <v-text-field
                          variant="outlined"
                          color="primary"
                          density="compact"
                          v-model="editedItem.role"
                          label="Role"
                        ></v-text-field> -->
                      </v-col>
                      <!-- <v-col cols="12" sm="12">
                        <v-select
                          variant="outlined"
                          color="primary"
                          density="compact"
                          :items="rolesbg"
                          v-model="editedItem.rolestatus"
                          label="Role Background"
                        ></v-select>
                      </v-col> -->
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="pa-4">
                  <v-spacer></v-spacer>
                  <v-btn color="error" @click="close">Cancel</v-btn>
                  <v-btn
                    color="secondary"
                    :disabled="
                      editedItem.username == '' || editedItem.usermail == ''
                    "
                    variant="flat"
                    @click="save"
                    >Save</v-btn
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
            <th class="text-subtitle-1 font-weight-semibold">用户Id</th>
            <th class="text-subtitle-1 font-weight-semibold">用户信息</th>
            <th class="text-subtitle-1 font-weight-semibold">个人描述</th>
            <th class="text-subtitle-1 font-weight-semibold">创建时间</th>
            <th class="text-subtitle-1 font-weight-semibold">身份</th>
            <th class="text-subtitle-1 font-weight-semibold">操作</th>
          </tr>
        </thead>
        <tbody class="text-body-1">
          <tr v-for="item in filteredList" :key="item.id">
            <td class="font-weight-bold">{{ item.id }}</td>
            <td>
              <div class="d-flex align-center py-1">
                <div>

                  <!-- <v-img :src="proxy.globalInfo.avatarUrl + item.avatar+'.jpg'"> </v-img> -->
                  <v-img
                  :src="proxy.globalInfo.avatarUrl + item.avatar+'.jpg'"
                    width="40"
                    class="rounded-circle img-fluid"
                  ></v-img>
                </div>

                <div class="ml-5">
                  <p class="font-weight-bold">{{ item.username }}</p>
                  <span class="d-block mt-1 text-caption textSecondary">{{
                    item.usermail
                  }}</span>
                </div>
              </div>
            </td>
            <td>{{ item.descripe }}</td>
            <td>{{ item.jdate }}</td>
            <td>
              <v-chip v-if="item.role=='用户'"
                class="font-weight-bold"
                color="primary"
                size="small"
                label
                >{{ item.role }}</v-chip
              >
              <v-chip v-if="item.role=='管理员'"
                class="font-weight-bold"
                color="success"
                size="small"
                label
                >{{ item.role }}</v-chip
              >
            </td>
            <td>
              <div class="d-flex align-center">
                <v-tooltip text="Edit" v-if="item.role=='用户'">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      color="blue"
                      icon
                      variant="text"
                      @click="editItem(item)"
                      v-bind="props"
                    >
                      <v-icon>mdi-pencil-outline</v-icon>
                      
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="Delete" v-if="item.role=='用户'">
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
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
