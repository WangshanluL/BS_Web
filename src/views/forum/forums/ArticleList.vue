<template>
  <div
    class="container-body article-list-body"
    :style="{ width: proxy.globalInfo.bodyWidth - 100 + 'px' }"
  >
    <!-- 这里可以修改宽度 -->
    <!--二级板块信息-->
    <div class="sub-board" v-if="pBoardId">
      <span :class="['board-item', boardId == 0 ? 'active' : '']">
        <router-link :to="`/forum/${pBoardId}`">全部</router-link></span
      >
      <span
        v-for="item in subBoardList" :key="item"
        :class="['board-item', item.boardId == boardId ? 'active' : '']"
      >
        <router-link :to="`/forum/${item.pBoardId}/${item.boardId}`">{{
          item.boardName
        }}</router-link>
      </span>
    </div>
    <!-- 文章列表 -->
    <div class="article-panel">
      <div class="top-tab">
        <div
          :class="['tab', orderType == 0 ? 'active' : '']"
          @click="changeOrderType(0)"
        >
          热榜
        </div>
        <el-divider direction="vertical"></el-divider>

        <div
          :class="['tab', orderType == 2 ? 'active' : '']"
          @click="changeOrderType(2)"
        >
          最新
        </div>
      </div>
      <div class="article-list">
        <DataList
          :loading="loading"
          :dataSource="articleListInfo"
          @loadData="loadArticle"
          noDataMsg="没有发现帖子，赶紧发布一个吧"
        >
          <template #default="{ data }">
            <ArticleListItem
              :data="data"
              :showComment="showComment"
            ></ArticleListItem>
          </template>
        </DataList>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import ArticleListItem from "./ArticleListItem.vue";
import { ref, reactive, getCurrentInstance, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import { ConsoleLoggingListener } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/ConsoleLoggingListener";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();

const changeOrderType = (type) => {
  orderType.value = type;
  loadArticle();
};

onMounted(()=>{
  setSubBoard();
    loadArticle();
})
//文章列表
//一级板块
const pBoardId = ref(0);
//二级板块
const boardId = ref(0);
const orderType = ref(0);
const loading = ref(false);
const articleListInfo = ref({});

const loadArticle = async () => {
  loading.value = true;
  console.log("load一次")
  try {
    if (typeof pBoardId.value == "undefined" && boardId.value == 0) {
      let response = await axios.post(
        proxy.globalInfo.url_f + "/forum/loadArticleBlank",
        {
          pageNo: articleListInfo.value.pageNo,
          pBoardId: pBoardId.value,
          boardId: boardId.value,
          orderType: orderType.value,
        }
      );
      console.log("|0000000000000000")


      loading.value = false;
      articleListInfo.value = response.data.data;
      console.log("articleListInfo.value zzz")
      console.log(articleListInfo.value)
    } else {
      console.log("|00000022222222222222220000000000")
      let response = await axios.post(
        proxy.globalInfo.url_f + "/forum/loadArticle",
        {
          pageNo: articleListInfo.value.pageNo,
          pBoardId: pBoardId.value,
          boardId: boardId.value,
          orderType: orderType.value,
        }
      );


      loading.value = false;
      articleListInfo.value = response.data.data;
      console.log("articleListInfo.value zzz")
      console.log(articleListInfo.value)
    }
  } catch (error) {
    console.error("请求错误:", error);
    loading.value = false;
  }
};

//二级板块
const subBoardList = ref([]);
const setSubBoard = () => {
  subBoardList.value = store.getters.getSubBoardList(pBoardId.value);
};
//监听路由变化
watch(
  () => route.params,
  (newVal, oldVal) => {
    if (
      Object.keys(newVal).length != 0 &&
      !newVal.pBoardId &&
      !newVal.boardId
    ) {
      return;
    }
    pBoardId.value = newVal.pBoardId;
    boardId.value = newVal.boardId || 0;
    console.log("boardId")
    console.log(boardId.value)
    console.log("pBoardId")
    console.log(pBoardId.value)
    setSubBoard();
    loadArticle();
    store.commit("setActivePboardId", newVal.pBoardId);
    store.commit("setActiveBoardId", newVal.boardId);
  },
  { immediate: true, deep: true }
);

//监听 板块数据变化
watch(
  () => store.state.boardList,
  (newVal, oldVal) => {
    setSubBoard();
    loadArticle();
  },
  { immediate: true, deep: true }
);

const showComment = ref(false);
watch(
  () => store.state.sysSetting,
  (newVal, oldVal) => {
    if (newVal) {
      showComment.value = newVal.commentOpen;
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.article-list-body {
  .sub-board {
    padding: 10px 0px 12px 0px;
    .board-item {
      background: #fff;
      border-radius: 15px;
      padding: 2px 10px;
      margin-right: 10px;
      color: #909090;
      cursor: pointer;
      font-size: 14px;
      a {
        text-decoration: none;
        color: #909090;
      }
    }
    .active {
      background: var(--link);
      a {
        color: #fff;
      }
    }
  }
  .article-panel {
    background: #fff;
    .top-tab {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      font-size: 15px;
      border-bottom: 1px solid #ddd;
      .tab {
        cursor: pointer;
      }
      .active {
        color: var(--link);
      }
    }
  }
}
</style>