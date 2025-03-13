<template>
  <div>
    <div class="header" v-if="showHeader">
      <div
        class="header-content"
        :style="{ width: proxy.globalInfo.bodyWidth + 'px' } "
      >
        <!--logo-->
        <router-link to="/" class="logo">
          <!-- <div
        style="
          justify-content: center;
          text-align: center;
          font-family: 'SourceHanSansCN-Bold';
          font-size: 30px;
          height: 30px;
          width: 100%;
          margin-bottom: 10px;
        "
      >
        医智伴行
      </div> --><img
          
          width="70"
          src="@/assets/logo/logo2_light.jpg"
          alt=""
        /><v-tooltip
            activator="parent"
            location="top"
            text="点我返回问答系统"
          ></v-tooltip>
        </router-link>
        <!--板块信息-->
        <div class="menu-panel">
          <router-link
            :class="[
              'menu-item home',
              activePboardId == undefined ? 'active' : '',
            ]"
            to="/forum"
            >首页</router-link
          >
          <template v-for="board in boardList" :key="board">
            <el-popover placement="bottom-start"  :width="300"  trigger="hover" v-if="board.children.length > 0">
              <template #reference>
                <span
                  :class="[
                    'menu-item',
                    board.boardId == activePboardId ? 'active' : '',
                  ]" 
                  @click="boardClickHandler(board)"
                  >{{ board.boardName }}</span
                >
              </template>
              <div class="sub-board-list">
                <span
                  :class="[
                    'sub-board',
                    subBoard.boardId == activeBoardId ? 'active' : '',
                  ]"
                  v-for="subBoard in board.children" :key="subBoard"
                  @click="subBoardClickHandler(subBoard)"
                  >{{ subBoard.boardName }}</span
                >
              </div>
            </el-popover>
            <span
              :class="[
                'menu-item',
                board.boardId == activePboardId ? 'active' : '',
              ]"
              v-else
              @click="boardClickHandler(board)"
              >{{ board.boardName }}</span
            >
          </template>
        </div>

        <div class="user-info-panel">
          <!-- 发帖和搜索 -->
          <div class="op-btn">
            <v-btn
              height="32"
              min-width="40"
              @click="newPost"
              color="primary"
              style="margin-right: 10px"
              >发帖<span class="iconfont icon-add"></span
            ></v-btn>
            <v-btn
              height="32"
              min-width="40"
              @click="goSearch"
              color="primary"
              style="margin-right: 10px"
              >搜索<span class="iconfont icon-search"></span
            ></v-btn>
            <!-- <el-button type="primary" class="op-btn" @click="newPost">
              发帖<span class="iconfont icon-add"></span>
            </el-button>
            <el-button type="primary" class="op-btn" @click="goSearch">
              搜索<span class="iconfont icon-search"></span>
            </el-button> -->
          </div>
          <!--显示用户信息-->
          <template v-if="userInfo.userId">
            <div class="d-flex">
              <ToolbarNotifications />
              <v-divider
                vertical
                thickness="2"
                inset
                class="ml-5 mr-1"
              ></v-divider>
              <ToolbarUser />
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="body-content">
      <router-view />
      
    </div>

    <el-backtop :right="100" :bottom="100"></el-backtop>
  </div>
</template>

<script setup>
import { Vue3Lottie } from "vue3-lottie";
const animationUrl ="https://lottie.host/ca50b51e-bb42-49b0-bf96-a06c3af44b9a/e0gnNucSCb.json"
import ToolbarNotifications from "@/components/toolbar/ToolbarNotifications.vue";
import ToolbarUser from "@/components/toolbar/ToolbarUser.vue";
import { ref, reactive, getCurrentInstance, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();

const logoInfo = ref([
  {
    letter: "医",
    color: "#3285FF",
  },
  {
    letter: "智",
    color: "#3285FF",
  },
  {
    letter: "伴",
    color: "#3285FF",
  },
  {
    letter: "行",
    color: "#3285FF",
  },
]);

const showHeader = ref(true);

//获取滚动条的高度
const getScrollTop = () => {
  let scrollTop =
    document.documentElement.scrollTop ||
    window.pageYOffset ||
    document.body.scrollTop;
  return scrollTop;
};

const initScroll = () => {
  let initScrollTop = getScrollTop();
  let scrollType = 0;
  window.addEventListener("scroll", () => {
    let currentScrollTop = getScrollTop();
    if (currentScrollTop > initScrollTop) {
      //往下滚动
      scrollType = 1;
    } else {
      //往上滚动
      scrollType = 0;
    }
    initScrollTop = currentScrollTop;
    if (scrollType == 1 && currentScrollTop > 100) {
      showHeader.value = false;
    } else {
      showHeader.value = true;
    }
  });
};

const userInfo = ref({});
onMounted(() => {
  const userInfoData = localStorage.getItem("userInfo");
  if (userInfoData) {
    const userinf = JSON.parse(userInfoData);
    userInfo.value = userinf;
  } else {
    // 如果 localStorage 中不存在名为 'userInfo' 的数据，可能是因为之前没有设置过，或者被清除了
    console.log('localStorage 中不存在名为 "userInfo" 的数据');
  }

  initScroll();
  loadBoard();
});

//获取板块信息
const boardList = ref([]);
const loadBoard = async () => {
  axios
    .post(proxy.globalInfo.url_f + "/board/loadBoard")
    .then((response) => {
      if (response.data.status === "success") {
        boardList.value = response.data.data;
        store.commit("saveBoardList", response.data.data);
      } else {
        console.error("请求失败:", responseData.info);
      }
    })
    .catch((error) => {
      console.error("发生错误:", error);
    });
};

//板块点击
const boardClickHandler = (board) => {
  router.push(`/forum/${board.boardId}`);
};

//二级板块
const subBoardClickHandler = (subBoard) => {
  console.log("subBoadr")
  console.log(subBoard)
  router.push(`/forum/${subBoard.pBoardId}/${subBoard.boardId}`);
};

//当前选中的板块
const activePboardId = ref(0);
watch(
  () => store.state.activePboardId,
  (newVal, oldVal) => {
    if (newVal !== 0) {
      activePboardId.value = newVal;
    }
  },
  { immediate: true, deep: true }
);

const activeBoardId = ref(0);
watch(
  () => store.state.activeBoardId,
  (newVal, oldVal) => {
    activeBoardId.value = newVal;
  },
  { immediate: true, deep: true }
);

//发帖
const newPost = () => {
  router.push("/newPost");
};

const gotoUcenter = (userId) => {
  router.push(`/user/${userId}`);
};

//消息相关
const gotoMessage = (type) => {
  router.push(`/user/message/${type}`);
};

//退出
const logout = () => {
  proxy.Confirm("确定要退出吗?", async () => {
    router.push("/auth/signin");
  });
};

const goSearch = () => {
  router.push("/search");
};

//是否展示底部
const showFooter = ref(true);
watch(
  () => route.path,
  (newVal, oldVal) => {
    if (newVal.indexOf("newPost") != -1 || newVal.indexOf("editPost") != -1) {
      showFooter.value = false;
    } else {
      showFooter.value = true;
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.header {
  top: 0px;
  width: 100%;
  position: fixed;
  box-shadow: 0 2px 6px 0 #ddd;
  z-index: 1000;
  background: #fff;
  margin-bottom: 20px;
  .header-content {
    margin: 0px auto;
    align-items: center;
    height: 70px;
    display: flex;
    align-items: center;
    .logo {
      display: block;
      text-decoration: none;
      margin-right: 5px;
      span {
        font-size: 35px;
      }
    }
    .menu-panel {
      flex: 1;
      font-size: large;
      font-family: kaiti;
      .menu-item {
        margin-left: 20px;
        cursor: pointer;
      }
      .home {
        text-decoration: none;
        color: #000;
      }
      .active {
        color: var(--link);
      }
    }
    .user-info-panel {
      width: 350px;
      display: flex;
      align-items: center;
      .op-btn {
        .iconfont {
          margin-left: 5px;
        }
        .el-button + .el-button {
          margin-left: 5px;
        }
      }
      .message-info {
        margin-left: 5px;
        margin-right: 25px;
        cursor: pointer;
        .icon-message {
          font-size: 25px;
          color: rgb(147, 147, 147);
        }
      }
    }
  }
}

.sub-board-list {
  display: flex;
  flex-wrap: wrap;
  .sub-board {
    padding: 0px 10px;
    border-radius: 20px;
    margin-right: 10px;
    background: rgb(239, 239, 239);
    border: 1px solid #ddd;
    color: rgb(119, 118, 118);
    margin-top: 10px;
    cursor: pointer;
  }

  .sub-board:hover {
    color: var(--link);
  }
  .active {
    background: var(--link);
    color: #fff;
  }
  .active:hover {
    color: #fff;
  }
}

.body-content {
  margin-top: 80px;
  position: relative;
  min-height: calc(100vh - 210px);
}

.message-item {
  display: flex;
  justify-content: space-around;
  .text {
    flex: 1;
  }
  .count-tag {
    height: 15px;
    line-height: 15px;
    min-width: 20px;
    display: inline-block;
    background: #f56c6c;
    border-radius: 10px;
    font-size: 13px;
    text-align: center;
    color: #fff;
    margin-left: 10px;
  }
}

.footer {
  background: #e9e9e9;

  margin-top: 10px;
  .footer-content {
    margin: 0px auto;
    height: 30px;
    padding-top: 10px;
    .item {
      text-align: left;
      .title {
        font-size: 18px;
        margin-bottom: 10px;
      }
      a {
        font-size: 14px;
        text-decoration: none;
        color: var(--text2);
        line-height: 25px;
      }
    }

    .logo {
      .logo-letter {
        font-size: 30px;
      }
      .info {
        margin-top: 10px;
        color: rgb(93, 91, 91);
      }
    }
  }
}
</style>