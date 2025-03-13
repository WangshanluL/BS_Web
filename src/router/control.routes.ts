
export default [
  

    {
      path: "/control/users",
      component: () => import("@/views/manage/userControl.vue"),
      meta: {
        requiresAuth: true,
        layout: "landing",
        category: "Data",
        title: "用户管理",
      },
    },    {
        path: "/control/forumArticle",
        component: () => import("@/views/manage/forumArticleControl.vue"),
        meta: {
          requiresAuth: true,
          layout: "landing",
          category: "Data",
          title: "帖子管理",
        },
      },    {
        path: "/control/commentControl",
        component: () => import("@/views/manage/commentControl.vue"),
        meta: {
          requiresAuth: true,
          layout: "landing",
          category: "Data",
          title: "评论管理",
        },
      },
  ];
  