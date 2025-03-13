<!--
* @Component:
* @Maintainer: J.K. Yang
* @Description:
-->
<script setup lang="ts">
const formatContent=(content)=> {
        
        return content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:green" target="_blank">$1</a>');
    }
import { ref, onMounted, watch } from "vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
import AnimationChat from "@/components/animations/AnimationChat1.vue";
import AnimationAi from "@/components/animations/AnimationBot1.vue";
import AnimationWaiting from "@/components/animations/AnimationSearch1.vue";
import { countAndCompleteCodeBlocks } from "@/utils/aiUtils";
import { scrollToBottom } from "@/utils/common";
import { getCurrentInstance } from "vue";
import { Vue3Lottie } from "vue3-lottie";
const animationUrl ="https://lottie.host/ca50b51e-bb42-49b0-bf96-a06c3af44b9a/e0gnNucSCb.json"
const { proxy } = getCurrentInstance();
import { useChatGPTStore } from "@/stores/chatGPTStore";
import "md-editor-v3/lib/style.css";
import axios from "axios";
interface Item {
  title: string;
  text: string;
}
const customItems: Item[] = [
  { title: '示例数据 1', text: '小红最近感觉到肌肉疼痛，尤其是在活动后。她还发现关节有些肿胀和僵硬。这些症状使她在日常生活中感到不适和困扰。小红想问：“我是不是患上了关节炎？还是这可能是其他肌肉骨骼问题的症状？我该如何缓解这些不适？”' },
  { title: '示例数据 2', text: '小红最近经常感到腹痛，尤其是在进食后。她还经常出现消化不良的症状，如胃部胀气和不适。这些症状影响了她的日常生活和饮食习惯。小红想问：她是不是患上了胃溃疡？还是这可能是其他消化系统疾病的症状？她该如何改善我的饮食和生活习惯？' },
  { title: '示例数据 3', text: '小明感到身体不适，而后被诊断出患上了疱疹。在吃药的同时他渴望能够尽快恢复健康。所以有哪些食物能益于他恢复呢？' }
]
const items = ref(customItems);
const close = () => {
  chatGPTStore.configDialog = false;
};
const handleCardClick = (text) => {
userMessage.value = text;
// console.log(text);
close();
}

const snackbarStore = useSnackbarStore();
const chatGPTStore = useChatGPTStore();

interface Message {
  content: string;
  role: "user" | "assistant" | "system";
}
// User Input Message
const userMessage = ref("");
const tempMessage = ref("");
const messages = ref<Message[]>([]);
const userInfo = ref({});
onMounted(() => {
  const userInfoData = localStorage.getItem('userInfo');
  const userinf = JSON.parse(userInfoData);
  userInfo.value = userinf;
  initMessages();
  console.log("hhhhhhhhhhhhhhh");
  console.log(messages.value);
  
})

//发送到后端，每次更新都保存
const updateMessages= async(Chatmessages)=>{
  const response = await axios.post(proxy.globalInfo.url_f + "/updateChatMessages", {
      userId: userInfo.value.userId,
      kill: Chatmessages,
    });
};
const initMessages=()=>{
  const response = axios.post(proxy.globalInfo.url_f + "/initChatMessages", {
      userId: userInfo.value.userId,
    });
    response.then(response => {
  // 成功处理响应数据
  console.log("响应数据:", response.data.data);
      messages.value=response.data.data;
  // 在这里对返回的数据进行进一步处理
  // 比如更新前端页面显示的聊天消息等操作
}).catch(error => {
  // 处理请求错误
  console.error("请求错误:", error);
});

}

const dialogVisible = ref(false)

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('你确定关闭对话框吗?')
    .then(() => {
      done()
    })
    .catch(() => {
      // catch error
    })
}

const clearchatmessages=()=>{
  const response = axios.post(proxy.globalInfo.url_f + "/clearchatmessages", {
      userId: userInfo.value.userId,
    });
    response.then(response => {
  // 成功处理响应数据
  console.log("响应数据:", response.data.data);
      messages.value=<Message[]>([]);
        dialogVisible.value = false;
        snackbarStore.showSuccessMessage("删除成功");
}).catch(error => {
  // 处理请求错误
  console.error("请求错误:", error);
});
}

watch(
  () => messages.value,
  (newVal, oldVal) => {
    console.log("新")
    console.log(messages.value);
    updateMessages(messages.value);
    
    // 检查是否有新值，并滚动到底部
    if (newVal) {
      scrollToBottom(document.querySelector(".message-container"));
    }
  },
  { immediate: true, deep: true }
);

const isLoading = ref(false);
const iswaiting = ref(false);
// Send Messsage
const sendMessage = async () => {
  if (userMessage.value) {
    // Add the message to the list
    messages.value.push({
      content: userMessage.value,
      role: "user",
    });
    tempMessage.value=userMessage.value;
    userMessage.value = "";
    await createCompletion();
    
  }
};
//这里是发送请求的，只需要改这个接口
const createCompletion = async () => { 
  // 获取内容
  const content = tempMessage.value; // 问话请求的内容
  
  try {
  // 创建完成
  iswaiting.value = true;
  const response = await axios.post(proxy.globalInfo.url_f + '/process', {
    content: content
  }, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  iswaiting.value = false;
  console.log("res")
  console.log(response);
  if (response.status!=200){
    snackbarStore.showErrorMessage("网络错误，请重试");
    iswaiting.value = false;
    
  }else{
    const responseData = response.data;
  messages.value.push({
    content: responseData.processed_content,
    role: "assistant"
  });
  }
  // 读取响应数据
 
} catch (error) {
  snackbarStore.showErrorMessage("网络错误，请重试");
  iswaiting.value = false;
}

};

const displayMessages = computed(() => {
  
  const messagesCopy = messages.value.slice(); // 创建原始数组的副本
  const lastMessage = messagesCopy[messagesCopy.length - 1];
  const updatedLastMessage = {
    ...lastMessage,
    content: countAndCompleteCodeBlocks(lastMessage.content),
  };
  messagesCopy[messagesCopy.length - 1] = updatedLastMessage;
  return messagesCopy;
});

const handleKeydown = (e) => {
  if (e.key === "Enter" && (e.altKey || e.shiftKey)) {
    // 当同时按下 alt或者shift 和 enter 时，插入一个换行符
    e.preventDefault();
    userMessage.value += "\n";
  } else if (e.key === "Enter") {
    // 当只按下 enter 时，发送消息
    e.preventDefault();
    sendMessage();
  }
};
const inputRow = ref(1);

</script>

<template>
 
  <div class="chat-bot">
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
    <div class="messsage-area">
      <perfect-scrollbar v-if="messages.length > 0" class="message-container">
        <template v-for="message in displayMessages" :key="message">
          <div v-if="message.role === 'user'">
            <div class="pa-4 user-message">
              <v-avatar class="ml-4" rounded="sm" variant="elevated">
                <img :src="proxy.globalInfo.avatarUrl + userInfo.userId+'.jpg'" alt="alt" />
              </v-avatar>
              <v-card class=" text-pre-wrap" theme="dark" color="blue-grey">
                <v-card-text>
                  <b> {{ message.content }}</b></v-card-text
                >
              </v-card>
            </div>
          </div>
          <div v-else>
            <div class="pa-2 pa-md-5 assistant-message">
              <v-avatar
                class="d-none d-md-block mr-2 mr-md-4"
                rounded="sm"
                variant="elevated"
              >
                <img
                  src="@/assets/s1.png"
                  alt="alt"
                />
              </v-avatar>
              <v-card>
                <div>
                  <!-- <md-editor
                    v-model="message.content"
                    class="font-1"
                    previewOnly
                  /> --><v-card class=" text-pre-wrap" theme="dark" color="primary">
                <v-card-text>
                  <b > <span v-html="formatContent(message.content)"></span></b></v-card-text
                >
              </v-card>
                </div>
              </v-card>
            </div>
          </div>
        </template>
        <div v-if="isLoading">
          <div class="pa-6">
            <div class="message">
              <AnimationAi :size="100" />
            </div>
          </div>
        </div>
        <div v-if="iswaiting">
          <div class="pa-6">
            <div class="message">
              <AnimationWaiting :size="150" />
            </div>
          </div>
        </div>




      </perfect-scrollbar>
      <div class="no-message-container" v-else>
        <h1 class="text-h1 text-md-h1 font-weight-bold" style="color: #344767;">
          Chat With Me
        </h1>
        <Vue3Lottie
:animationLink="animationUrl"
:height="500"
:width="500"
/>
      </div>
    </div>
    <div class="input-area">
      <v-sheet
        color="transparent"
        elevation="0"
        class="input-panel d-flex align-end pa-1"
      >
      <v-btn class="mb-1"  variant="elevated" style="margin-right: 10px;" icon @click="dialogVisible = true">
          <v-icon  class="text-primary">mdi-close-circle-outline</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            text="删除聊天记录"
          ></v-tooltip>
        </v-btn>
        <v-btn
          class="mb-1"
          variant="elevated"
          icon
          @click="chatGPTStore.configDialog = true"
        >
          <v-icon size="30" class="text-primary">mdi-comment-text-multiple</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            text="样例数据"
          ></v-tooltip>
        </v-btn>
        <transition name="fade">
          <v-textarea
            class="mx-2"
            color="primary"
            type="text"
            clearable
            variant="solo"
            ref="input"
            v-model="userMessage"
            placeholder="Ask Anything"
            hide-details
            @keydown="handleKeydown"
            :rows="inputRow"
            @focus="inputRow = 3"
            @blur="inputRow = 1"
          >
          </v-textarea>
        </transition>

        <v-btn class="mb-1"  variant="elevated" icon>
          <v-icon @click="sendMessage" class="text-primary">mdi-send</v-icon>
        </v-btn>
        
      </v-sheet>
     
     <!-- 为什么呢？？？ -->


     <template>
  <v-dialog v-model="chatGPTStore.configDialog" width="600">
    <v-card>
      <v-card-title class="font-weight-bold pa-5">
        示例数据</v-card-title>
      <v-divider />
      <v-card-text>
        <v-data-iterator :items="items" >
          <template v-slot:default="{ items }">
            <template v-for="(item) in items" :key="item">
              <v-card v-bind="item.raw"  style="cursor:pointer;"  @click="handleCardClick(item.raw.text)"></v-card>
              <br>
            </template>
          </template>
        </v-data-iterator>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="primary" @click="close">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
   
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-bot {
  background-repeat: repeat;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .messsage-area {
    flex: 1;
    height: 80%;
  }

  .input-area {
    position: absolute;
    width: 100%;
    bottom: 0;
    // padding: 1rem;
    
    align-items: center;

    .input-panel {
      border-radius: 5px;
      max-width: 1200px;
      margin: 0 auto;
    }
  }
}

.user-message {
  display: flex;
  align-content: center;
  justify-content: end;
  flex-direction: row-reverse;
  margin-left: 20%;
}

.assistant-message {
  display: flex;
  align-content: center;
  justify-content: start;
  flex-direction: row;
  margin-right: 20%;
}

.message {
  margin: 0 auto;
  max-width: 1200px;
  display: flex;
}

.message-container {
  height: calc(80vh );
}

.no-message-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h1 {
    font-size: 2rem;
    font-weight: 500;
  }
}

:deep(.md-editor-preview-wrapper) {
  padding: 5px 15px;
}

.font-1 {
  font-size: 13px !important;
}

@media screen and (max-width: 768px) {
  :deep(#md-editor-v3-preview),
  .user-message {
    font-size: 14px !important;
  }
}
</style>
