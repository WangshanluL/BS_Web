<template>
  <div class="chat-container">
    <!-- 聊天消息区域 -->
    <div class="message-list" ref="messageListRef">
      <template v-for="message in messages" :key="message.id">
        <div v-if="message.role === 'user'" class="user-message">
          <div class="message-content">
            {{ message.content }}
          </div>
        </div>
        <div v-else class="bot-message">
          <div class="message-content">
            <div v-html="formatContent(message.content)"></div>
            
            <!-- 显示引用标签 -->
            <div v-if="message.references && message.references.length > 0" class="reference-tags">
              <el-tag 
                v-for="(ref, idx) in message.references" 
                :key="idx"
                type="info"
                effect="light"
                @click="showKnowledgeGraph(ref.id)"
                class="reference-tag"
              >
                <el-icon class="tag-icon"><Connection /></el-icon>
                {{ ref.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        v-model="inputMessage"
        placeholder="请输入您的问题..."
        type="textarea"
        :rows="3"
        resize="none"
        @keyup.ctrl.enter="sendMessage"
      />
      <el-button type="primary" @click="sendMessage" :disabled="!inputMessage.trim()">
        发送
      </el-button>
    </div>
    
    <!-- 知识图谱对话框 -->
    <el-dialog
      v-model="graphDialogVisible"
      title="操作系统知识图谱"
      width="80%"
      destroy-on-close
      top="5vh"
      class="graph-dialog"
    >
      <div class="knowledge-graph-container" ref="graphContainerRef"></div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="graphDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="centerGraph">
            居中图谱
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import * as echarts from 'echarts';
import { Connection } from '@element-plus/icons-vue';

// 类型定义
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

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  references?: {
    id: number | string;
    name: string;
  }[];
}

// Markdown 渲染
const md = new MarkdownIt({
  breaks: true,
  linkify: true
});

const formatContent = (content: string): string => {
  return md.render(content);
};

// 聊天相关状态
const messageListRef = ref<HTMLElement | null>(null);
const inputMessage = ref('');
const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: 'assistant',
    content: '您好！我是操作系统知识助手，请问有什么可以帮助您的？',
    references: []
  }
]);

// 知识图谱相关状态
const graphDialogVisible = ref(false);
const graphContainerRef = ref<HTMLElement | null>(null);
let graphInstance: echarts.ECharts | null = null;
let currentTopicId: number | string | null = null;

// 类别颜色映射
const categoryColors = [
  '#5470c6', // 默认蓝色
  '#91cc75', // 绿色
  '#fac858', // 黄色
  '#ee6666', // 红色
  '#73c0de', // 浅蓝色
  '#3ba272', // 绿松石色
  '#fc8452', // 橙色
  '#9a60b4'  // 紫色
];

// 类别名称映射
const categoryNames = {
  2: '管理单元',
  3: '概念',
  4: '题目',
  5: '教学视频'
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return;
  
  const newMessage: ChatMessage = {
    id: Date.now(),
    role: 'user',
    content: inputMessage.value
  };
  
  messages.value.push(newMessage);
  const question = inputMessage.value;
  inputMessage.value = '';
  
  // 滚动到底部
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
  
  // 模拟API调用，获取回答
  setTimeout(() => {
    const botResponse: ChatMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `关于"${question}"的问题，线程是进程内的执行单元，是CPU调度的基本单位。同一进程中的多个线程共享进程的地址空间和资源，但拥有独立的程序计数器、寄存器集合和栈空间。线程具有并发性、共享性和独立性特征。`,
      references: [
        { id: 0, name: '线程定义' },
        { id: 1, name: '实现方式' }
      ]
    };
    
    messages.value.push(botResponse);
    
    // 滚动到底部
    nextTick(() => {
      if (messageListRef.value) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
      }
    });
  }, 1000);
};

// 显示知识图谱
const showKnowledgeGraph = async (topicId: number | string) => {
  currentTopicId = topicId;
  graphDialogVisible.value = true;
  
  // 等待对话框渲染完成
  await nextTick();
  
  // 获取知识图谱数据
  const graphData = getKnowledgeGraphData();
  
  // 初始化图表
  initGraph(graphData);
};

// 获取知识图谱数据
const getKnowledgeGraphData = (): KnowledgeGraph => {
  // 这里使用您提供的数据格式
  return {
    'nodes': [
      {'id': 0, 'name': '线程定义', 'category': 3, 'value': '线程是进程内的执行单元，是CPU调度的基本单位。同一进程中的多个线程共享进程的地址空间和资源，但拥有独立的程序计数器、寄存器集合和栈空间。线程具有并发性、共享性和独立性特征。线程相比进程具有创建开销小、切换开销小、通信开销小等优点，适用于并发程序设计。线程分为系统级线程(内核线程)和用户级线程，可采用一对一模型、多对一模型或多对多模型进行实现。线程状态与进程状态类似，包括就绪、运行、阻塞等状态。'},
      {'id': 1, 'name': '实现方式', 'category': 3, 'value': '内核级线程(KLT)由操作系统内核管理和调度，内核维护线程表和PCB，线程切换需要内核介入，可实现真正的并行(在多处理器环境下)。优点是内核能直接管理和调度线程，一个线程阻塞不会导致整个进程阻塞；缺点是线程创建和切换开销较大，需要用户态/内核态切换。用户级线程(ULT)由应用程序在用户空间通过线程库管理，对内核透明，内核仅感知进程。优点是线程创建和切换开销小，可以实现特定的调度算法；缺点是一个线程阻塞会导致整个进程阻塞，不能真正利用多处理器并行处理。多对多模型(组合实现)将多个用户级线程映射到较少的内核级线程上，结合两种实现方式的优点。'},
      {'id': 2, 'name': '线程管理', 'category': 2, 'value': '线程管理提供进程内的并发执行单元，降低上下文切换开销，提高系统吞吐量和响应时间。'},
      {'id': 3, 'name': '题目369:进程管理', 'category': 4, 'value': ''},
      {'id': 4, 'name': '题目215:线程定义', 'category': 4, 'value': ''},
      {'id': 5, 'name': '题目214:进程控制', 'category': 4, 'value': ''},
      {'id': 6, 'name': '题目213:线程定义', 'category': 4, 'value': ''},
      {'id': 7, 'name': '题目212:进程定义', 'category': 4, 'value': ''},
      {'id': 8, 'name': '题目184:线程调度', 'category': 4, 'value': ''},
      {'id': 9, 'name': '题目155:线程定义', 'category': 4, 'value': ''},
      {'id': 10, 'name': '题目154:线程定义', 'category': 4, 'value': ''},
      {'id': 11, 'name': '视频16:2.1.6_3 线程的状态与转换', 'category': 5, 'value': ''},
      {'id': 12, 'name': '视频14:2.1.6_1 线程的概念与特点', 'category': 5, 'value': ''},
      {'id': 13, 'name': '视频15:2.1.6_2 线程的实现方式和多线程模型', 'category': 5, 'value': ''}
    ],
    'links': [
      {'source': 2, 'target': 0, 'type': 'HAS_CONCEPT'},
      {'source': 2, 'target': 1, 'type': 'HAS_CONCEPT'},
      {'source': 0, 'target': 3, 'type': 'HAS_TOPIC'},
      {'source': 0, 'target': 4, 'type': 'HAS_TOPIC'},
      {'source': 0, 'target': 5, 'type': 'HAS_TOPIC'},
      {'source': 0, 'target': 6, 'type': 'HAS_TOPIC'},
      {'source': 0, 'target': 7, 'type': 'HAS_TOPIC'},
      {'source': 0, 'target': 8, 'type': 'HAS_TOPIC'},
      {'source': 0, 'target': 9, 'type': 'HAS_TOPIC'},
      {'source': 0, 'target': 10, 'type': 'HAS_TOPIC'},
      {'source': 0, 'target': 11, 'type': 'HAS_VIDEO'},
      {'source': 0, 'target': 12, 'type': 'HAS_VIDEO'},
      {'source': 1, 'target': 13, 'type': 'HAS_VIDEO'}
    ]
  };
};

// 初始化图表
const initGraph = (graphData: KnowledgeGraph) => {
  if (!graphContainerRef.value) return;
  
  if (!graphInstance) {
    graphInstance = echarts.init(graphContainerRef.value);
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      graphInstance?.resize();
    });
  }
  
  // 处理节点大小
  const processedNodes = graphData.nodes.map(node => {
    // 根据节点类型设置大小
    let symbolSize = 40;
    
    switch (node.category) {
      case 2: // 管理单元
        symbolSize = 60;
        break;
      case 3: // 概念
        symbolSize = 50;
        break;
      case 4: // 题目
        symbolSize = 35;
        break;
      case 5: // 视频
        symbolSize = 40;
        break;
      default:
        symbolSize = 45;
    }
    
    // 高亮当前选中节点
    if (node.id === currentTopicId) {
      symbolSize += 10;
    }
    
    return {
      ...node,
      symbolSize
    };
  });
  
  // 设置链接标签
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
        curveness: 0.2
      }
    };
  });
  
  // 设置图表选项
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
      data: Object.values(categoryNames),
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
      categories: Object.entries(categoryNames).map(([key, value]) => ({
        name: value
      })),
      roam: true,
      draggable: true,
      focus: 'adjacency',
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      edgeLabel: {
        show: false,
        formatter: '{c}',
        position: 'middle'
      },
      edgeSymbol: ['none', 'arrow'],
      force: {
        repulsion: 100,
        edgeLength: [80, 150],
        layoutAnimation: true
      },
      lineStyle: {
        color: 'source',
        curveness: 0.2
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
    color: categoryColors
  };
  
  graphInstance.setOption(option);
  
  // 自动聚焦到当前选中的节点
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

// 居中图谱
const centerGraph = () => {
  if (graphInstance) {
    graphInstance.dispatchAction({
      type: 'restore'
    });
  }
};

// 对话框关闭时释放图表实例
watch(graphDialogVisible, (newVal) => {
  if (!newVal && graphInstance) {
    // 对话框关闭时不销毁实例，只是重置当前状态
    currentTopicId = null;
  }
});

// 组件挂载后初始化
onMounted(() => {
  // 可以在这里进行其他初始化工作
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.user-message, .bot-message {
  margin-bottom: 15px;
}

.user-message {
  display: flex;
  justify-content: flex-end;
}

.bot-message {
  display: flex;
  justify-content: flex-start;
}

.message-content {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 8px;
  word-break: break-word;
}

.user-message .message-content {
  background-color: #ecf5ff;
  color: #303133;
}

.bot-message .message-content {
  background-color: #f5f7fa;
  color: #303133;
}

.input-area {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.input-area .el-input {
  flex: 1;
}

.reference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.reference-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.reference-tag:hover {
  transform: scale(1.05);
}

.tag-icon {
  margin-right: 5px;
}

.knowledge-graph-container {
  width: 100%;
  height: 600px;
}

:deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.6;
  
  p {
    margin: 8px 0;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 16px;
    margin-bottom: 8px;
  }
  
  ul, ol {
    padding-left: 20px;
    margin: 8px 0;
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 3px;
  }
  
  pre {
    background-color: #f6f8fa;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }
}

:deep(.el-dialog__body) {
  padding: 10px;
}

:deep(.graph-dialog .el-dialog__header) {
  margin-right: 0;
  text-align: center;
}

:deep(.graph-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: bold;
}
</style>