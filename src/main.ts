
import App from "./App.vue";

import VueCookies from 'vue-cookies'
import '@/assets/icon/iconfont.css'
import './assets/base.scss'
import store from './store/index.js'

import Verify from '@/utils/Verify.js'
import Message from '@/utils/Message.js'
import Request from '@/utils/Request.js'
import Utils from "@/utils/Utils.js"
import Confirm from "@/utils/Confirm.js"

// Composables
import { createApp } from "vue";
import vuetify from "./plugins/vuetify";
import MasonryWall from "@yeger/vue-masonry-wall";
import VueVirtualScroller from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import VueApexCharts from "vue3-apexcharts";
import piniaPersist from "pinia-plugin-persist";
import PerfectScrollbar from "vue3-perfect-scrollbar";
import "@/styles/main.scss";
import router from "./router";
import i18n from "./plugins/i18n";
import Vue3Lottie from "vue3-lottie";
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

//全局组件
import Dialog from "@/components/Dialog.vue"
import Avatar from "@/components/Avatar.vue"
import Cover from "@/components/Cover.vue"
import DataList from "@/components/DataList.vue"
import NoData from "@/components/NoData.vue"
import ImageViewer from "@/components/ImageViewer.vue"
import EditorHtml from "@/components/EditorHtml.vue"
import EditorMarkdown from "@/components/EditorMarkdown.vue"
import CoverUpload from "@/components/CoverUpload.vue"
import AttachmentSelector from "@/components/AttachmentSelector.vue"

const pinia = createPinia();
pinia.use(piniaPersist);
const app = createApp(App);
app.use(ElementPlus);
app.use(router);
// 新加
app.use(store)
app.config.globalProperties.VueCookies = VueCookies;
app.config.globalProperties.globalInfo = {
    bodyWidth: 1100,  //修改屏幕的大小
    coverImage:"http://127.0.0.1:5000/cover/",
    avatarUrl: "http://127.0.0.1:5000/picture/",
    imageUrl: "http://127.0.0.1:5000/picture/",
    commentImage:"http://127.0.0.1:5000/commentPic/",
    url_f:"http://127.0.0.1:5000",


}
app.config.globalProperties.Verify = Verify;
app.config.globalProperties.Message = Message;
app.config.globalProperties.Request = Request;
app.config.globalProperties.Utils = Utils;
app.config.globalProperties.Confirm = Confirm;
app.component("Dialog", Dialog);
app.component("Avatar", Avatar);
app.component("Cover", Cover);
app.component("DataList", DataList);
app.component("NoData", NoData);
app.component("ImageViewer", ImageViewer);
app.component("EditorHtml", EditorHtml);
app.component("EditorMarkdown", EditorMarkdown);
app.component("CoverUpload", CoverUpload);
app.component("AttachmentSelector", AttachmentSelector);







app.use(PerfectScrollbar);
app.use(MasonryWall);
app.use(VueVirtualScroller);
app.use(VueApexCharts);
app.use(pinia);
app.use(i18n);
app.use(Vue3Lottie, { name: "LottieAnimation" });
app.use(autoAnimatePlugin);
app.use(vuetify);
app.mount("#app");
