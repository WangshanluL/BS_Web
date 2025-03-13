// users Data Page
export default [
  {
    path: "/ai/chatbot_v1",
    component: () => import("@/views/chatgpt/ChatBotV1.vue"),
    meta: {
      requiresAuth: true,
      layout: "landing",
      category: "AI",
      title: "ChatBotV1",
    },
  },

  {
    path: "/ai/file-upload-chatbot",
    component: () => import("@/views/chatgpt/SkinChat.vue"),
    meta: {
      requiresAuth: true,
      layout: "landing",
      category: "AI",
      title: "FileUploadPreview",
    },
  },
  {
    path: "/ai/neo4j",
    component: () => import("@/views/chatgpt/Neo4jVisual.vue"),
    meta: {
      requiresAuth: true,
      layout: "landing",
      category: "AI",
      title: "Neo4jVisual",
    },
  },
  {
    path: "/profile",
    name: "profile",
    component: () =>
      import(/* webpackChunkName: "profile" */ "@/views/users/ProfilePage.vue"),
    meta: {
      requiresAuth: true,
      layout: "landing",
      title: "Profile",
      category: "AI",
    },
  },
  {
    path: "/ai/AiDetect",
    component: () => import("@/views/chatgpt/AIdetect.vue"),
    meta: {
      requiresAuth: true,
      layout: "landing",
      category: "AI",
      title: "Detect",
    },
  },

];
