
import admin from "./menus/admin.menu";
import menuAi from "./menus/ai.menu";

import forumMenu from "./menus/forum.menu";



export default {
  menu: [
    {
      text: "问答中心",
      items: menuAi,
    },
    
    
    {
      text:"论坛中心",
      items:forumMenu,
    },

 

  
  ],
  adminMenu:[
    {
      text: "管理中心",
      items: admin,
    },
    {
      text:"论坛中心",
      items:forumMenu,
    },

  ]



};
