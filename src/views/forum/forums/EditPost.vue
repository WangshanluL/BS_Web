<template>
  <div class="edit-post">
    <el-form
      :model="formData"
      :rules="rules"
      ref="formDataRef"
      class="post-panel"
      label-width="60px"
    >
      <div class="post-editor">
        <el-card :body-style="{ padding: '5px' }">
          <template #header>
            <div class="post-editor-title">
              <span>正文</span>
              <div class="change-editor-type">
                <span class="iconfont icon-change" @click="changeEditor">
                  切换为{{
                    editorType == 0 ? "markdown编辑器" : "富文本编辑器"
                  }}
                </span>
              </div>
            </div>
          </template>
          <!--input输入-->
          <el-form-item prop="content" label-width="0">
            <EditorHtml
              :height="htmlEditorHeight"
              v-if="editorType == 0"
              v-model="formData.content"
            ></EditorHtml>
            <EditorMarkdown
              :height="markdownHeight"
              v-if="editorType == 1"
              v-model="formData.markdownContent"
              @htmlContent="setHtmlContent"
            >
            </EditorMarkdown>
          </el-form-item>
        </el-card>
      </div>
      <div class="post-setting">
        <el-card :body-style="{ padding: '5px' }">
          <template #header>
            <span>设置</span>
          </template>
          <div class="setting-inner">
            <!--input输入-->
            <el-form-item label="标题" prop="title">
              <el-input
                clearable
                :maxlength="150"
                placeholder="提示信息"
                v-model="formData.title"
              ></el-input>
            </el-form-item>
            <el-form-item label="板块" prop="boardIds">
              <el-cascader
                placeholder="请选择板块"
                :options="boardList"
                :props="boardProps"
                clearable
                v-model="formData.boardIds"
                :style="{ width: '100%' }"
              />
            </el-form-item>
            <el-form-item label="封面" prop="cover">
              <CoverUpload v-model="formData.cover"></CoverUpload>
            </el-form-item>
            <!--textarea输入-->
            <el-form-item label="摘要" prop="summary">
              <el-input
                clearable
                placeholder="提示信息"
                type="textarea"
                :rows="5"
                :maxlength="200"
                resize="none"
                show-word-limit
                v-model="formData.summary"
              ></el-input>
            </el-form-item>
            <el-form-item label="附件" prop="cover">
              <AttachmentSelector
                v-model="formData.attachment"
              ></AttachmentSelector>
            </el-form-item>
            <!--input输入-->
            <el-form-item
              label="积分"
              prop="integral"
              v-if="formData.attachment"
            >
              <el-input
                clearable
                placeholder="请输入积分"
                v-model="formData.integral"
              ></el-input>
              <span class="tips">附件下载积分，0表示无需积分下载</span>
            </el-form-item>
            <!--input输入-->
            <el-form-item label="" prop="">
              <el-button
                type="primary"
                :style="{ width: '100%' }"
                @click="postHandler"
                >保存</el-button
              >
            </el-form-item>
          </div>
        </el-card>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  getCurrentInstance,
  watch,
  onMounted,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessageBox } from "element-plus";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const markdownHeight = window.innerHeight - 80 - 60;
const htmlEditorHeight = window.innerHeight - 80 - 140;

const currentUserInfo = ref({});
onMounted(() => {
  loadBoardList();
  const userInfoData = localStorage.getItem("userInfo");

  // 如果存在该数据，则将其解析为 JavaScript 对象
  if (userInfoData) {
    const userinf = JSON.parse(userInfoData);
    currentUserInfo.value = userinf; // 然后你可以在这里继续处理获取到的数据
  } else {
    // 如果 localStorage 中不存在名为 'userInfo' 的数据，可能是因为之前没有设置过，或者被清除了
    console.log('localStorage 中不存在名为 "userInfo" 的数据');
  }
});



import axios from 'axios';

const articleId = ref(null);

const getArticleDetail = () => {
  nextTick(async () => {
    formDataRef.value.resetFields();
    if (articleId.value) {
      try {
        let response = await axios.post(proxy.globalInfo.url_f+'/forum/articleDetail4Update', {
          articleId: articleId.value
        });
        let result = response.data;
        console.log("传的更改")
        console.log(result)
        if (result.status === 'success') {
          let articleInfo = result.data.forumArticle;
          // 设置编辑器
          editorType.value = articleInfo.editorType;
          // 设置板块信息
          articleInfo.boardIds = [];
          articleInfo.boardIds.push(articleInfo.pBoardId);
          if (articleInfo.boardId != null && articleInfo.boardId != 0) {
            articleInfo.boardIds.push(articleInfo.boardId);
          }
          // 设置封面信息
          if (articleInfo.cover) {
            articleInfo.cover = { imageUrl: articleInfo.cover };
          }
          // 设置附件
          if (result.data.attachment) {
            articleInfo.attachment = {
              name: result.data.attachment.fileName,
            };
            articleInfo.integral = result.data.attachment.integral;
          }
          formData.value = articleInfo;
          console.log(articleInfo.editorType);
          console.log(formData.value.content);
          console.log(formData.value.markdownContent);
        }
      } catch (error) {
        console.error('Error getting article detail:', error);
      }
    } else {
      formData.value = {};
      editorType.value = proxy.VueCookies.get("editorType") || 0;
    }
  });
};

//设置markdown编辑器的富文本信息
const setHtmlContent = (htmlContent) => {
  formData.value.content = htmlContent;
};

watch(
  () => route,
  (newVal, oldVal) => {
    if (
      newVal.path.indexOf("/editPost") != -1 ||
      newVal.path.indexOf("/newPost") != -1
    ) {
      articleId.value = newVal.params.articleId;
      getArticleDetail();
    }
  },
  { immediate: true, deep: true }
);

const formData = ref({});
const formDataRef = ref();
const rules = {
  title: [{ required: true, message: "请输入标题" }],
  boardIds: [{ required: true, message: "请选择板块" }],
  content: [{ required: true, message: "请输入正文" }],
  integral: [
    { required: true, message: "请输入下载所需积分" },
    { validator: proxy.Verify.number, message: "积分只能是数字" },
  ],
};


const postHandler = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    //设置板块ID
    if (params.boardIds.length == 1) {
      params.pBoardId = params.boardIds[0];
    } else if (params.boardIds.length == 2) {
      params.pBoardId = params.boardIds[0];
      params.boardId = params.boardIds[1];
    }
    delete params.boardIds;
    //设置编辑器类型
    params.userId=currentUserInfo.value.userId;
    params.editorType = editorType.value;
    //获取内容
    const contentText = params.content.replace(/<(?!img).*?>/g, "");
    if (contentText == "") {
      proxy.message.warning("正文不能为空");
      return;
    }
    if (params.attachment != null) {
      params.attachmentType == 1;
    } else {
      params.attachmentType = 0;
    }

    //封面
    if (!(params.cover instanceof File)) {
      delete params.cover;
    }
    //附件不是文件乐行，值设置为空
    if (!(params.attachment instanceof File)) {
      delete params.attachment;
    }
    console.log("params在这里");
    console.log(params);
    let result = await proxy.Request({
      url: params.articleId ?  proxy.globalInfo.url_f+'/forum/updateArticle' : proxy.globalInfo.url_f+'/forum/postArticle',
      params: params,
    });
    if (!result) {
      return;
    }
    proxy.Message.success("保存成功");
    router.push(`/post/${result.data}`);
  });
};


//板块信息
const boardProps = {
  multiple: false,
  checkStrictly: true,
  value: "boardId",
  label: "boardName",
};


const boardList = ref([]);

const loadBoardList = async () => {
  try {
    const response = await axios.post(
      proxy.globalInfo.url_f+'/forum/loadBoard4Post'
    );
    if (response.data.status === "success") {
      boardList.value = response.data.data;
    } else {
      console.error("Failed to load board list:", response.data.info);
    }
  } catch (error) {
    console.error("Error loading board list:", error);
  }
};



//编辑器类型 0：富文本  1:markdown
const editorType = ref(null);
const changeEditor = () => {
  proxy.Confirm("切换编辑器会清空正在编辑的内容，确定要切换吗？", () => {
    editorType.value = editorType.value == 0 ? 1 : 0;
    formData.value.content = "";
    formData.value.markdownContent = "";
    proxy.VueCookies.set("editorType", editorType.value, -1);
  });
};
</script>

<style lang="scss">
.edit-post {
  .post-panel {
    display: flex;
    .el-card__header {
      padding: 10px;
    }
    .post-editor {
      flex: 1;
      .post-editor-title {
        display: flex;
        justify-content: space-between;
        .change-editor-type {
          .iconfont {
            cursor: pointer;
            color: var(--link);
            font-size: 14px;
          }
        }
      }
    }
    .post-setting {
      margin-left: 10px;
      width: 450px;
      .setting-inner {
        max-height: calc(100vh - 120px);
        overflow: auto;
        .el-form-item {
          align-items: flex-start;
        }
      }
      .tips {
        color: #797979;
        font-size: 13px;
      }
    }
  }
}
</style>