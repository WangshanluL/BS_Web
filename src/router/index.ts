import { createRouter, createWebHistory ,createWebHashHistory} from "vue-router";

import AuthRoutes from "./auth.routes";

import UtilityRoutes from "./utility.routes";

import ControlRoutes from "./control.routes";
import AiRoutes from "./ai.routes";
import ForumRoutes from "./forum.routes";
export const routes = [
  {
    path: "/",
    redirect: "/ai/chatbot_v1",
    meta: {},
  } as any,
  
  {
    path: "/:pathMatch(.*)*",
    name: "error",
    component: () =>
      import(/* webpackChunkName: "error" */ "@/views/errors/NotFoundPage.vue"),
  },

  ...AuthRoutes,

  ...UtilityRoutes,


  ...ControlRoutes,
  ...AiRoutes,
  ...ForumRoutes,
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [];

const router = createRouter({
  history: createWebHashHistory(),
  // hash模式：createWebHashHistory，history模式：createWebHistory
  // process.env.NODE_ENV === "production"

  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});
router.beforeEach((to, from, next) => {
  if (to.path == '/auth/signin' || to.path == '/auth/signup') {
      // 登录或者注册才可以往下进行
      localStorage.removeItem('userInfo');
      next();
  } else {
      // 获取 token
      const token = localStorage.getItem('userInfo'); 
      // token 不存在
      
      if (token === null || token === '') {
        
          next('/auth/signin');
      } else {
          next();
      }
  }
});



export default router;
