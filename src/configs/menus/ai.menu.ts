export default [
  {
    icon: "mdi-robot-excited-outline",
    key: "menu.chatbot_v1",
    text: "Chatbot_V1",
    link: "/ai/chatbot_v1",
  },
  // {
  //   icon: "mdi-robot-love-outline",
  //   key: "menu.chatbot_v2",
  //   text: "Chatbot_V2",
  //   link: "/ai/chatbot_v2",
  // },
  {
    icon: "mdi-image-multiple-outline",
    text: "File Upload Preview",
    link: "/ai/file-upload-chatbot",
    key: "menu.data.fileUploadPreview",//也就是对应zhhan.ts就是中文的那个
  },{
    // mdi-database
    icon: "mdi-face-woman-shimmer-outline",
    text: "智能导诊",
    link: "/ai/AiDetect",
    key: "menu.detect",
  },{
    // mdi-database
    icon: "mdi-database",
    text: "知识图谱可视化",
    link: "/ai/neo4j",
    key: "menu.neo4j",
  }
  
];
