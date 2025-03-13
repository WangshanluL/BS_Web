import { useSnackbarStore } from "@/stores/snackbarStore";
const snackbarStore = useSnackbarStore();
snackbarStore.showErrorMessage("哈哈哈");



axios.post(proxy.globalInfo.url_f+'/ucenter/getAllUsers')
.then(response => {
  console.log("获取为")
  console.log(response.data.data);
  desserts.value=response.data.data;
  snackbarStore.showSuccessMessage("哈哈哈");
  
  
})
.catch(error => {
  console.error('Error fetching data: ', error);
  
});


const handleClose = (done: () => void) => {
    ElMessageBox.confirm('你确定关闭对话框吗?')
      .then(() => {
        done()
      })
      .catch(() => {
        // catch error
      })
  }

  const dialogVisible = ref(false)


<el-dialog
v-model="dialogVisible"
title="Tips"
width="500"
:before-close="handleClose"
>
<span>请问你确定删除聊天记录吗？一旦删除，无法恢复</span>
<template #footer>
  <div class="dialog-footer">
    <el-button @click="dialogVisible = false">取消</el-button>
    <el-button type="primary" @click="clearchatmessages">
      确定
    </el-button>
  </div>
</template>
</el-dialog>
















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
      :disabled="
        editedItem.username == '' || editedItem.usermail == ''
      "
      variant="flat"
      @click="deleteItem()"
      >确定</v-btn
    >
  </v-card-actions>
</v-card>
</v-dialog>




字体在base.scss