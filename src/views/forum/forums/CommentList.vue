<template>

  <div class="comment-body">

    <div class="comment-title">
      <div class="title">
        评论<span class="count">{{ commentListInfo.totalCount }}</span>
      </div>
      <div class="tab">
        <span
          @click="orderChange(0)"
          :class="['tab-item', orderType == 0 ? 'active' : '']"
          >热榜</span
        >
        <el-divider direction="vertical" />
        <span
          @click="orderChange(1)"
          :class="['tab-item', orderType == 1 ? 'active' : '']"
          >最新</span
        >
      </div>
    </div>
    <!--发送评论-->
    <div class="comment-form-panel">
      <CommentPost
        :articleId="articleId"
        :pCommentId="0"
        :avatarWidth="50"
        :userId="currentUserInfo.userId"
        :showInsertImg="currentUserInfo.userId != null"
        @postCommentFinish="postCommentFinish"
      ></CommentPost>
    </div>
    <div class="comment-list">
      <DataList
        :dataSource="commentListInfo"
        :loading="loading"
        @loadData="loadComment"
        noDataMsg="暂无评论，赶紧占沙发吧！"
      >
        <template #default="{ data }">
          <CommentListItem
            :articleId="articleId"
            :commentData="data"
            :articleUserId="articleUserId"
            :currentUserId="currentUserInfo.userId"
            @hiddenAllReply="hiddenAllReplyHandler"
            @reloadData="loadComment"
          ></CommentListItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<script setup>
import CommentPost from "./CommentPost.vue";
import CommentListItem from "./CommentListItem.vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
const snackbarStore = useSnackbarStore();
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { ref, reactive, getCurrentInstance, onMounted, watch } from "vue";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();

const props = defineProps({
  articleId: {
    type: String,
  },
  articleUserId: {
    type: String,
  },
});
const currentUserInfo= ref({});

onMounted(() => {
  loadComment();

  const userInfoData = localStorage.getItem('userInfo');

// 如果存在该数据，则将其解析为 JavaScript 对象
if (userInfoData) {
 const userinf = JSON.parse(userInfoData);
 currentUserInfo.value = userinf;


} else {
 // 如果 localStorage 中不存在名为 'userInfo' 的数据，可能是因为之前没有设置过，或者被清除了
 console.log('localStorage 中不存在名为 "userInfo" 的数据');
}

});
//排序
const orderType = ref(0);
const orderChange = (type) => {
  orderType.value = type;
  loadComment();
};
//评论列表
const loading = ref(null);
const commentListInfo = ref({});

import axios from 'axios';

const loadComment = async () => {
  let params = {
    pageNo: commentListInfo.value.pageNo,
    articleId: props.articleId,
    orderType: orderType.value,
  };

  try {
    const response = await axios.post(proxy.globalInfo.url_f+'/comment/loadComment', params);
    const result = response.data;
   
    if (!result || result.status !== 'success') {
      return;
    }

    commentListInfo.value = result.data;
    console.log("评论信息为：");
    console.log(commentListInfo.value );
  } catch (error) {
    console.error('Error while loading comments:', error);
  }
};



//隐藏所有回复框
const hiddenAllReplyHandler = () => {
  
  commentListInfo.value.list.forEach((element) => {
    element.showReply = false;
  });
};

const emit = defineEmits(["updateCommentCount"]);
//评论发布完成

const postCommentFinish = (resultData) => {

    commentListInfo.value.list.unshift(resultData);
  //更新数量
  console.log("更新后的commentListInfo");
  console.log(commentListInfo.value);
  const totalCount = commentListInfo.value.totalCount + 1;
  commentListInfo.value.totalCount = totalCount;
  emit("updateCommentCount", totalCount);
  
 
};

//当前用户信息

watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    currentUserInfo.value = newVal || {};
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.comment-body {
  .comment-title {
    display: flex;
    align-items: center;
    .title {
      font-size: 20px;
      .count {
        font-size: 14px;
        padding: 0px 10px;
      }
    }
    .tab {
      .tab-item {
        cursor: pointer;
      }
      .active {
        color: var(--link);
      }
    }
  }
  .comment-form-panel {
    margin-top: 20px;
  }
}
</style>