// users Data Page
export default [
    {
        path: "/forum",
        component: () => import("@/views/forum/Layout.vue"),
        children:[{
            path:"/forum",
            title:"所有文章",
            component:() => import("@/views/forum/forums/ArticleList.vue"),
        }, {
          path: '/forum/:pBoardId',
          name: "一级板块",
          component: () => import('@/views/forum/forums/ArticleList.vue'),
        }, {
          path: '/forum/:pBoardId/:boardId/',
          name: "二级板块",
          component: () => import('@/views/forum/forums/ArticleList.vue'),
        }, {
          path: '/post/:articleId/',
          name: "文章详情",
          component: () => import('@/views/forum/forums/ArticleDetail.vue'),
        }, {
          path: '/newPost',
          name: "发布文章",
          component: () => import('@/views/forum/forums/EditPost.vue'),
        }, {
          path: '/editPost/:articleId',
          name: "编辑文章",
          component: () => import('@/views/forum/forums/EditPost.vue'),
        }, {
          path: '/user/:userId',
          name: "用户信息",
          component: () => import('@/views/forum/ucenter/Ucenter.vue'),
        }, {
          path: '/user/message/:type',
          name: "消息",
          component: () => import('@/views/forum/ucenter/MessageList.vue'),
        }, {
          path: '/search',
          name: "搜索",
          component: () => import('@/views/forum/Search.vue'),
        }],
        meta: {
          requiresAuth: true,
          layout: "default",
          category: "FORUM",
          title: "forum",
        },

        


      },
  ];
  