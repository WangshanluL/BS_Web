<template>
  <div
    class="container-body search-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <div
      class="search-panel"
      
    >
    <v-container>
    <v-card class="mx-auto" color="grey-lighten-3" max-width="100%">
      <v-card-text>
        <v-text-field
          v-model="searchword"
          :loading="loading"
          append-inner-icon="mdi-magnify"
          density="compact"
          label="请输入关键词"
          variant="solo"
          hide-details
          single-line
          @click:append-inner="search"
        ></v-text-field>
      </v-card-text>
    </v-card>
  </v-container>
    </div>
    <AnimationSearch2 :size="600" v-if="iswaiting"/>

    <div class="article-list">
      <DataList
        :loading="loading"
        :dataSource="articleListInfo"
        @loadData="search"
        noDataMsg="没有发现帖子，赶紧发布一个吧"
      >
        <template #default="{ data }">
          <ArticleListItem
            :data="data"
            :showComment="showComment"
            :htmlTitle="true"
          ></ArticleListItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<script setup>
import ArticleListItem from "@/views/forum/forums/ArticleListItem.vue";
import { ref, reactive, getCurrentInstance, watch } from "vue";
import AnimationSearch2 from "@/components/animations/AnimationSearch2.vue";
import { useRouter, useRoute } from "vue-router";
const { proxy } = getCurrentInstance();
import { useStore } from "vuex";
const router = useRouter();
const route = useRoute();
const store = useStore();
const searchword = ref("");
const api = {
  loadArticle: "/forum/search",
};
const iswaiting=ref(true);
const searchPanelHeight = (window.innerHeight - 60 - 140 - 60) / 2;

//开始搜索
const startSearch = ref(false);
const startSearchHandler = () => {
  startSearch.value = true;
};

const formData = ref({});



const loading = ref(false);
const articleListInfo = ref({});
import axios from 'axios';


const search = async () => {
    loading.value = true;
    const response = axios.post(proxy.globalInfo.url_f+'/forum/search', {
    
      pageNo: articleListInfo.value.pageNo,
      keyword: searchword.value,
  
});
    response.then(respon => {
  const result = respon.data;
  console.log("result在这-----------")

  console.log(result);
  articleListInfo.value=result.data;
  loading.value = false;
  iswaiting.value=false;
    })
    

  };


const changeInput = () => {
  if (formData.value.keyword == "") {
    articleListInfo.value = {};
  }
};

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
.search-body {
  background: #fff;
  padding: 10px;
  min-height: calc(100vh - 210px);
  .search-panel {
    display: flex;
    justify-content: center;
    .el-input {
      width: 700px;
    }
  }
}
</style>