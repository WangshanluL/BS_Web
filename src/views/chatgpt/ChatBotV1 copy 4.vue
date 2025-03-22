<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed, nextTick } from "vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
import AnimationChat from "@/components/animations/AnimationChat1.vue";
import AnimationAi from "@/components/animations/AnimationBot1.vue";
import AnimationWaiting from "@/components/animations/AnimationSearch1.vue";
import { countAndCompleteCodeBlocks } from "@/utils/aiUtils";
import { scrollToBottom } from "@/utils/common";
import { getCurrentInstance } from "vue";
import { Vue3Lottie } from "vue3-lottie";
import * as echarts from 'echarts';
const animationUrl ="https://lottie.host/ca50b51e-bb42-49b0-bf96-a06c3af44b9a/e0gnNucSCb.json";
const { proxy } = getCurrentInstance();
import { useChatGPTStore } from "@/stores/chatGPTStore";
import "md-editor-v3/lib/style.css";
import MarkdownIt from 'markdown-it';

// Markdown rendering
const md = new MarkdownIt({
  breaks: true,
  linkify: true,
  typographer: true,
  html: true
});

const formatContent = (content) => {
  return content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:green" target="_blank">$1</a>');
};

const formatContent_md = (content: string): string => {
  return md.render(content);
};

// Types for knowledge graph
interface KnowledgeNode {
  id: number | string;
  name: string;
  category: number;
  value?: string;
  symbolSize?: number;
}

interface KnowledgeLink {
  source: number | string;
  target: number | string;
  type: string;
}

interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
}

// Knowledge graph related state
const graphDialogVisible = ref(false);
const graphContainerRef = ref<HTMLElement | null>(null);
let graphInstance: any = null;
let currentTopicId: number | string | null = null;

// Category colors and names for knowledge graph
const categoryColors = [
  '#5470c6', // Default blue
  '#91cc75', // Green
  '#fac858', // Yellow
  '#ee6666', // Red
  '#73c0de', // Light blue
  '#3ba272', // Turquoise
  '#fc8452', // Orange
  '#9a60b4'  // Purple
];

const categoryNames = {
  2: '管理单元',
  3: '概念',
  4: '题目',
  5: '教学视频'
};

// Sample data
interface Item {
  title: string;
  text: string;
}

const customItems: Item[] = [
  { title: '示例数据 1', text: '小红最近感觉到肌肉疼痛，尤其是在活动后。她还发现关节有些肿胀和僵硬。这些症状使她在日常生活中感到不适和困扰。小红想问："我是不是患上了关节炎？还是这可能是其他肌肉骨骼问题的症状？我该如何缓解这些不适？"' },
  { title: '示例数据 2', text: '小红最近经常感到腹痛，尤其是在进食后。她还经常出现消化不良的症状，如胃部胀气和不适。这些症状影响了她的日常生活和饮食习惯。小红想问：她是不是患上了胃溃疡？还是这可能是其他消化系统疾病的症状？她该如何改善我的饮食和生活习惯？' },
  { title: '示例数据 3', text: '小明感到身体不适，而后被诊断出患上了疱疹。在吃药的同时他渴望能够尽快恢复健康。所以有哪些食物能益于他恢复呢？' }
];

const items = ref(customItems);
const snackbarStore = useSnackbarStore();
const chatGPTStore = useChatGPTStore();

// Close the config dialog
const close = () => {
  chatGPTStore.configDialog = false;
};

// Handle sample data card click
const handleCardClick = (text) => {
  userMessage.value = text;
  close();
};

// Message and chat interface
interface Message {
  content: string;
  role: "user" | "assistant" | "system";
  relevant_nodes_links?: any[];
  tavily_results?: any[];
}
//?代表可以没有的意思
// Store additional context from search results
interface SearchResults {
  relevant_nodes_links: any[];
  tavily_results: any[];
}

const searchResults = ref<SearchResults>({
  relevant_nodes_links: [],
  tavily_results: []
});

// User Input Message
const userMessage = ref("");
const tempMessage = ref("");
const messages = ref<Message[]>([]);
const userInfo = ref({});
let socket = ref<WebSocket | null>(null);
const chatId = ref(""); // Store the chat ID

// WebSocket connection - now only connects when needed
const connectWebSocket = () => {
  // Only connect if socket is null or closed
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    return; // Already connected
  }
  
  // Construct WebSocket URL from the HTTP base URL
  // Replace http:// with ws:// or https:// with wss://
  const wsUrl = proxy.globalInfo.new_url_f.replace(/^http/, 'ws') + "/ws";

  socket.value = new WebSocket(wsUrl);

  socket.value.onopen = () => {
    console.log("WebSocket connection established");
    // Now that connection is open, we can send the message
    if (tempMessage.value) {
      sendMessageViaWebSocket();
    }
  };

  socket.value.onmessage = (event) => {
    try {
      // First try to parse as JSON
      const jsonData = JSON.parse(event.data);
      console.log("Received JSON data:", jsonData);

      // Handle structured data
      if (jsonData.relevant_nodes_links !== undefined && jsonData.tavily_results !== undefined) {
        searchResults.value = {
          relevant_nodes_links: jsonData.relevant_nodes_links,
          tavily_results: jsonData.tavily_results
        }
      }
    } catch (e) {
      // Not JSON, handle as streaming text
      const textData = event.data;
      console.log("Received text data:", textData);
      iswaiting.value = false;

      if (textData.endsWith("[END]")) {
        // End of streaming, finalize the message

        const finalContent = textData.replace("[END]", "");

        // Check if we're in the middle of streaming
        if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === "assistant") {
          // Update the last message
          messages.value[messages.value.length - 1].content = finalContent;
          messages.value[messages.value.length - 1].relevant_nodes_links = searchResults.value.relevant_nodes_links;
          messages.value[messages.value.length - 1].tavily_results = searchResults.value.tavily_results;
        } else {
          // Create a new message
          messages.value.push({
            content: finalContent,
            role: "assistant",
            relevant_nodes_links:searchResults.value.relevant_nodes_links,
            tavily_results:searchResults.value.tavily_results
          });
        }
        searchResults.value.relevant_nodes_links = [];
        searchResults.value.tavily_results = [];
        
        // Close the socket when done
        if (socket.value) {
          socket.value.close();
          console.log("WebSocket connection closed after completion");
        }
      } else {
        // Update or create assistant message
        if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === "assistant") {
          // Update existing message
          messages.value[messages.value.length - 1].content = textData;
        } else {
          // Create new message
          messages.value.push({
            content: textData,
            role: "assistant",
          });
        }

        // Ensure we scroll to show the latest content
        scrollToBottom(document.querySelector(".message-container"));
      }
    }
  };

  socket.value.onerror = (error) => {
    console.error("WebSocket error:", error);
    snackbarStore.showErrorMessage("连接错误，请刷新页面重试");
    iswaiting.value = false;
  };

  socket.value.onclose = () => {
    console.log("WebSocket connection closed");
    socket.value = null; // Reset socket to null when closed
  };
};

// Function to fetch chat history based on chat_id
const fetchChatHistory = async () => {
  // Check if we have a chat ID in local storage
  const storedChatId = localStorage.getItem(`chatId_${userInfo.value.userId}`);
  
  if (storedChatId) {
    chatId.value = storedChatId;
    
    // Here we use mock data instead of a real request
    // In a real implementation, you would make an API call to get chat history
    
    // Mock data for demonstration
    const mockChatHistory = [
      {
        content: "你好，我有一些健康方面的问题想咨询一下",
        role: "user"
      },
      {
        content: "你好！很高兴能帮助你解答健康方面的问题。请告诉我你遇到了什么问题，我会尽力为你提供有用的信息和建议。",
        role: "assistant",
        relevant_nodes_links: [],
        tavily_results: []
      },
      {
        content: "我最近有些头痛，可能是工作压力太大了",
        role: "user"
      },
      {
        content: "理解你因工作压力导致头痛的困扰。压力性头痛很常见，通常表现为两侧太阳穴或后脑勺的持续性疼痛。\n\n缓解方法：\n1. 定期休息，避免长时间盯着屏幕\n2. 确保充足睡眠（7-8小时）\n3. 保持水分摄入\n4. 尝试放松技巧如深呼吸或冥想\n5. 适度运动有助于减轻压力\n6. 必要时可服用非处方止痛药\n\n如果头痛剧烈、突然发作、伴随发烧或持续时间长，建议及时就医。平衡工作与生活也很重要，考虑合理安排工作计划，适当委派任务。",
        role: "assistant",
        relevant_nodes_links: [],
        tavily_results: []
      }
    ];
    
    // Set the mock data to messages
    messages.value = mockChatHistory;
    
    console.log("Loaded chat history for chat ID:", chatId.value);
    return true;
  }
  
  return false;
};

// Show knowledge graph dialog
const showKnowledgeGraph = async (relevant_nodes_links) => {
  graphDialogVisible.value = true;
  currentTopicId = null;

  // Wait for dialog to render
  await nextTick();
  console.log("node结构", relevant_nodes_links);

  // Get knowledge graph data
  const graphData = relevant_nodes_links;

  // Initialize graph after dialog is fully rendered
  setTimeout(() => {
    initGraph(graphData);
  }, 300);
};

// Cleanup and destroy echarts instance
const destroyGraph = () => {
  if (graphInstance) {
    graphInstance.dispose();
    graphInstance = null;
  }
};

// Initialize knowledge graph
const initGraph = (graphData: KnowledgeGraph) => {
  if (!graphContainerRef.value) {
    console.error("Graph container reference is null");
    return;
  }

  // Always dispose previous instance before creating a new one
  destroyGraph();

  // Create a new echarts instance
  graphInstance = echarts.init(graphContainerRef.value);

  // 创建正确的类别数组，确保每个类别都有对应的索引
  const categories = [
    { name: '视频节点' },          // 索引 0
    { name: '章节节点' },      // 索引 1
    { name: '子章节节点' },          // 索引 2
    { name: '概念节点' },          // 索引 3
    { name: '题目节点' }       // 索引 4
  ];

  // Process node sizes and ensure correct category mapping
  const processedNodes = graphData.nodes.map(node => {
    // Set size based on node type
    let symbolSize = 40;

    // 确保节点的category匹配categories数组中的索引
    let category = node.category;

    // 如果category是数值类型但不在0-4范围内，设置默认值
    if (typeof category === 'number' && (category < 0 || category > 4)) {
      category = 0; // 默认类别
    }

    switch (category) {
      case 2: // Management unit
        symbolSize = 60;
        break;
      case 3: // Concept
        symbolSize = 50;
        break;
      case 4: // Question
        symbolSize = 35;
        break;
      case 5: // Video
        symbolSize = 40;
        break;
      default:
        symbolSize = 45;
    }

    return {
      ...node,
      symbolSize,
      category: category // 确保category属性正确设置
    };
  });

  // Process links
  const processedLinks = graphData.links.map(link => {
    let label = '';

    switch(link.type) {
      case 'HAS_CONCEPT':
        label = '包含概念';
        break;
      case 'HAS_TOPIC':
        label = '相关题目';
        break;
      case 'HAS_VIDEO':
        label = '相关视频';
        break;
      default:
        label = link.type;
    }

    return {
      ...link,
      label: {
        show: false,
        formatter: label
      },
      lineStyle: {
        width: 2,
        curveness: 0.3  // 增加曲率，使连线更容易区分
      }
    };
  });

  // Set chart options
  const option = {
    title: {
      text: '操作系统知识图谱',
      top: 10,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const node = params.data;
          let content = `<div style="font-weight:bold;margin-bottom:5px;">${node.name}</div>`;

          if (node.value && node.value.length > 0) {
            content += `<div style="max-width:300px;word-wrap:break-word;">${node.value}</div>`;
          }

          return content;
        } else if (params.dataType === 'edge') {
          return params.data.label ? params.data.label.formatter : params.name;
        }

        return '';
      }
    },
    legend: {
      // 直接使用categories数组中的name属性作为图例数据
      data: categories.map(category => category.name),
      orient: 'vertical',
      left: '5%',
      top: '10%',
      textStyle: {
        color: '#333'
      }
    },
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      name: '知识图谱',
      type: 'graph',
      layout: 'force',
      data: processedNodes,
      links: processedLinks,
      // 使用categories数组
      categories: categories,
      roam: true,
      draggable: true,
      focus: 'adjacency',
      label: {
        show: true,
        position: 'right',
        formatter: '{b}',
        distance: 10,  // 增加标签距离
        fontSize: 12   // 设置合适的字体大小
      },
      edgeLabel: {
        show: false,
        formatter: '{c}',
        position: 'middle'
      },
      edgeSymbol: ['none', 'arrow'],
      force: {
        repulsion: 350,        // 增加节点间的排斥力，从100提高到350
        gravity: 0.1,          // 添加低重力值，避免节点太散
        edgeLength: [150, 250], // 增加边的长度范围
        friction: 0.2,         // 添加摩擦系数，使布局更稳定
        layoutAnimation: true
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3  // 保持与上面设置的曲率一致
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 4
        },
        edgeLabel: {
          show: true
        }
      }
    }],
    // 确保颜色数组与categories对应
    color: [
      '#5470c6', // 默认蓝色
      '#91cc75', // 管理单元 - 绿色
      '#fac858', // 概念 - 黄色
      '#ee6666', // 题目 - 红色
      '#73c0de'  // 教学视频 - 浅蓝色
    ],
    toolbox: {
      feature: {
        dataZoom: {},
        restore: {},
        saveAsImage: {}
      },
      right: 20,
      top: 20
    }
  };

  // Apply options to chart
  graphInstance.setOption(option);

  // Add window resize listener for this instance
  const resizeHandler = () => {
    if (graphInstance) {
      graphInstance.resize();
    }
  };

  window.addEventListener('resize', resizeHandler);

  // Store the resize handler on the instance so we can remove it later
  graphInstance._resizeHandler = resizeHandler;

  // Auto focus on selected node
  if (currentTopicId !== null) {
    const currentNode = processedNodes.find(node => node.id === currentTopicId);
    if (currentNode) {
      setTimeout(() => {
        graphInstance?.dispatchAction({
          type: 'focusNodeAdjacency',
          seriesIndex: 0,
          dataIndex: processedNodes.indexOf(currentNode)
        });
      }, 500);
    }
  }
};

// Center graph
const centerGraph = () => {
  if (graphInstance) {
    graphInstance.dispatchAction({
      type: 'restore'
    });
  }
};

// Clean up WebSocket connection
onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close();
    socket.value = null;
  }

  // Also clean up any graph instance
  destroyGraph();

  // Remove any window event listeners
  if (graphInstance && graphInstance._resizeHandler) {
    window.removeEventListener('resize', graphInstance._resizeHandler);
  }
});

onMounted(() => {
  const userInfoData = localStorage.getItem('userInfo');
  const userinf = JSON.parse(userInfoData);
  userInfo.value = userinf;

  // Load chat history based on chat_id instead of connecting WebSocket immediately
  fetchChatHistory();
});

// Save messages to local storage
const saveMessages = () => {
  localStorage.setItem(`chatMessages_${userInfo.value.userId}`, JSON.stringify(messages.value));
  
  // If this is a new chat, generate a new chat ID and save it
  if (!chatId.value && messages.value.length > 0) {
    chatId.value = "chat_" + Date.now().toString();
    localStorage.setItem(`chatId_${userInfo.value.userId}`, chatId.value);
  }
};

const dialogVisible = ref(false);

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('你确定关闭对话框吗?')
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

const clearchatmessages = () => {
  messages.value = [];
  saveMessages();
  
  // Clear chat ID as well
  chatId.value = "";
  localStorage.removeItem(`chatId_${userInfo.value.userId}`);
  
  dialogVisible.value = false;
  snackbarStore.showSuccessMessage("删除成功");
};

watch(
  () => messages.value,
  (newVal, oldVal) => {
    console.log("消息更新");
    saveMessages();

    // Check for new values and scroll to bottom
    if (newVal) {
      scrollToBottom(document.querySelector(".message-container"));
    }
  },
  { immediate: true, deep: true }
);

// Watch for dialog visibility
watch(graphDialogVisible, (newVal, oldVal) => {
  if (!newVal && graphInstance) {
    // Cleanup when dialog closes
    destroyGraph();
    currentTopicId = null;
  }
});

const isLoading = ref(false);
const iswaiting = ref(false);

// Send the message via the established WebSocket connection
const sendMessageViaWebSocket = () => {
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.send(JSON.stringify({
      message: tempMessage.value,
      userId: userInfo.value.userId,
      chatId: chatId.value // Include chat ID if available
    }));
  } else {
    // If socket isn't ready yet, the message will be sent in the onopen handler
    console.log("WebSocket not yet open, message will be sent when connection is established");
  }
};

// Send Message - now establishes connection first
const sendMessage = async () => {
  if (userMessage.value) {
    // Add the message to the list
    messages.value.push({
      content: userMessage.value,
      role: "user",
    });
    tempMessage.value = userMessage.value;
    userMessage.value = "";
    
    iswaiting.value = true;
    
    try {
      // Connect WebSocket and then send message
      connectWebSocket();
      
      // If the socket is already open, send immediately
      // Otherwise, it will be sent in the onopen handler
      if (socket.value && socket.value.readyState === WebSocket.OPEN) {
        sendMessageViaWebSocket();
      }
    } catch (error) {
      snackbarStore.showErrorMessage("网络错误，请重试");
      iswaiting.value = false;
    }
  }
};

// This method is no longer needed as its functionality is incorporated into sendMessage
// const createCompletion = async () => {
//   // This functionality is now part of sendMessage
// };

const displayMessages = computed(() => {
  if (messages.value.length === 0) return [];

  const messagesCopy = messages.value.slice(); // Create a copy of the original array

  // Process each message to ensure code blocks are properly formatted
  return messagesCopy.map(message => ({
    ...message,
    content: countAndCompleteCodeBlocks(message.content),
  }));
});

const handleKeydown = (e) => {
  if (e.key === "Enter" && (e.altKey || e.shiftKey)) {
    // When Alt or Shift + Enter is pressed, insert a newline
    e.preventDefault();
    userMessage.value += "\n";
  } else if (e.key === "Enter") {
    // When only Enter is pressed, send the message
    e.preventDefault();
    sendMessage();
  }
};

const inputRow = ref(1);

</script>
<template>
  <div class="chat-bot">
    <!-- Clear chat history dialog -->
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
          <el-button type="primary" @click="clearchatmessages">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Knowledge Graph Dialog -->
    <v-dialog
      v-model="graphDialogVisible"
      width="80%"
      content-class="graph-dialog"
    >
      <v-card>
        <v-card-title class="text-center">操作系统知识图谱</v-card-title>
        <v-card-text>
          <div class="knowledge-graph-container" ref="graphContainerRef" style="width: 100%; height: 600px;"></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="centerGraph">居中图谱</v-btn>
          <v-btn color="primary" variant="text" @click="graphDialogVisible = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="messsage-area">
      <perfect-scrollbar v-if="messages.length > 0" class="message-container">
        <template v-for="message in displayMessages" :key="message">
          <div v-if="message.role === 'user'">
            <div class="pa-4 user-message">
              <v-avatar class="ml-4" rounded="sm" variant="elevated">
                <img :src="proxy.globalInfo.avatarUrl + userInfo.userId+'.jpg'" alt="alt" />
              </v-avatar>
              <v-card class="text-pre-wrap" theme="dark" color="blue-grey">
                <v-card-text><b>{{ message.content }}</b></v-card-text>
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
                <img src="@/assets/s1.png" alt="alt" />
              </v-avatar>
              <v-card>
                <div>
                  <v-card class="text-pre-wrap" theme="dark" color="primary">
                    <v-card-text>
                      <b><span v-html="formatContent(message.content)"></span></b>

                      <!-- Template fix -->
                      <div class="reference-tags mt-3" v-if="message.relevant_nodes_links">
                        <v-chip
                        variant="elevated"
                        color="success"
                        class="mr-2 mb-2 knowledge-graph-chip"
                        @click="showKnowledgeGraph(message.relevant_nodes_links)"
                      >
                        <v-icon start>mdi-connection</v-icon>
                        知识图谱可视化
                      </v-chip>
                      </div>
                    </v-card-text>
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
        <v-btn class="mb-1" variant="elevated" style="margin-right: 10px;" icon @click="dialogVisible = true">
          <v-icon class="text-primary">mdi-close-circle-outline</v-icon>
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

        <v-btn class="mb-1" variant="elevated" icon>
          <v-icon @click="sendMessage" class="text-primary">mdi-send</v-icon>
        </v-btn>
      </v-sheet>

      <!-- Sample data dialog -->
      <v-dialog v-model="chatGPTStore.configDialog" width="600">
        <v-card>
          <v-card-title class="font-weight-bold pa-5">示例数据</v-card-title>
          <v-divider />
          <v-card-text>
            <v-data-iterator :items="items">
              <template v-slot:default="{ items }">
                <template v-for="(item) in items" :key="item">
                  <v-card v-bind="item.raw" style="cursor:pointer;" @click="handleCardClick(item.raw.text)"></v-card>
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
    </div>
  </div>
</template>

<style scoped>
.knowledge-graph-chip {
  font-weight: bold !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  transition: transform 0.2s, box-shadow 0.2s !important;
}

.knowledge-graph-chip:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
}
/* CSS fixes */
.reference-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 12px !important;
}

:deep(.v-chip) {
  display: inline-flex !important;
  visibility: visible !important;
}
.chat-bot {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messsage-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.message-container {
  height: 100%;
  overflow-y: auto;
}

.no-message-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.input-area {
  min-height: 70px;
  padding: 10px;
}

.text-pre-wrap {
  white-space: pre-wrap;
}

.user-message {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.assistant-message {
  display: flex;
  align-items: flex-start;
}

.reference-tags {
  display: flex;
  flex-wrap: wrap;
}

.knowledge-graph-container {
  border: 1px solid #eaeaea;
  border-radius: 8px;
}
</style>
