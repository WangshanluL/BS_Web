<template>
  <v-dialog
      v-model="dialog1"
      width="auto"
    >
    <v-card
          variant="outlined"
          class="mx-auto"
          width="1050px"
          
          style="background-color: white;"
         
        >
          <!-- <v-card-item>
            <div>
              <div class="text-overline mb-1">
                {{ variant }}
              </div>
              <div class="text-h6 mb-1">
                Headline
              </div>
              <div class="text-caption">Greyhound divisely hello coldly fonwderfully</div>
            </div>
          </v-card-item> -->
          <v-card color="white" width="1050px"  style="margin: 10px auto">
      <v-card-title class="text-center justify-center py-6">
        <h1 class="font-weight-bold text-h2 text-basil">症状列表</h1>
      </v-card-title>
      <!-- v-model="tab"  这个是哪个被选中 -->
      <v-tabs
        v-model="tab"
        bg-color="transparent"
        color="green"
        next-icon="mdi-arrow-right-bold-box-outline"
        prev-icon="mdi-arrow-left-bold-box-outline"
        show-arrows
        grow
      >
        <v-tab v-for="item in items" :key="item" :value="item">
          {{ item }}
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item v-for="item in items" :key="item" :value="item">
          <v-card color="white" flat>
            <!-- <v-card-text>{{ text }}</v-card-text> -->

            <!-- 添加嵌套的选项卡 -->
            <v-tabs v-model="nestedTab[item]" color="green" grow>
              <v-tab
                v-for="subItem in nestedItems[item]"
                :key="subItem"
                :value="subItem"
              >
                <!-- 修改这里 -->
                {{ subItem }}
              </v-tab>
            </v-tabs>

            <!-- 显示嵌套选项卡内容 -->
            <v-window v-model="nestedTab[item]">
              <!-- 修改这里 -->
              <v-window-item
                v-for="subItem in nestedItems[item]"
                :key="subItem"
                :value="subItem"
              >
                <!-- 修改这里 -->
                <v-card color="white" flat>
                  <!-- <v-card-text>{{ subItem }} Content</v-card-text> -->
                  <v-chip-group
                    v-model="amenities[item][subItem]"
                    column
                    multiple
                    style="margin: 0px 10px"
                    selected-class="text-green-accent-4"
                  >
                    <v-chip
                      variant="outlined"
                      filter
                      v-for="iitem in subsubItems[subItem]"
                      :key="iitem"
                      :value="iitem">
                      {{ iitem }}
                    </v-chip>
                  </v-chip-group>
                </v-card>
              </v-window-item>
            </v-window>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
          <v-card-actions >
            <div style="float: right;margin-left: auto; "> <el-button type="primary" @click="dialog1=false">取消</el-button>
            <el-button type="primary" @click="confirmClick">确认</el-button></div>
           
          </v-card-actions>
        </v-card>



    
  
  </v-dialog>

  

  <!-- ---------------------------------------------------------------------------------------------------------------------------- -->
  <div class="chat-bot">
    <el-dialog
      v-model="dialogVisible"
      title="Tips"
      width="500"
      :before-close="handleClose"
    >
      <span>请问你确定删除聊天记录吗？一旦删除，无法恢复</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="clearchatmessages">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <div class="messsage-area">
      <perfect-scrollbar v-if="messages.length > 0" class="message-container">
        <template v-for="(message, index) in displayMessages" :key="index">
          <div v-if="message.role === 'user'">
            <div class="pa-4 user-message">
              <v-avatar class="ml-4" rounded="sm" variant="elevated">
                <img
                  :src="proxy.globalInfo.avatarUrl + userInfo.userId + '.jpg'"
                  alt="alt"
                />
              </v-avatar>
              <v-card class="text-pre-wrap" theme="dark" color="blue-grey">
                <v-card-text>
                  <b> {{ message.content }}</b></v-card-text
                >
              </v-card>
            </div>
          </div>
          <div v-else>
            <div class="pa-2 pa-md-5 assistant-message">
              <v-avatar
                class="d-none d-md-block mr-2 mr-md-4"
                rounded="sm"
                variant="elevated"
              >
                <img src="@/assets/s1.png" alt="alt" />
              </v-avatar>
              <v-card>
                <div>
                  <v-card class="text-pre-wrap" theme="dark" color="primary">
                    <v-card-text>
                      <b> {{ message.content }}</b></v-card-text
                    >
                    <div v-if="index==0">
                      <v-chip-group
                        v-model="selection"
                        selected-class="text-green-accent-4"
                        mandatory
                        @click="changeOne"
                        style="margin-left: 10px;"
                      >
                      <!-- const Ages=["0-3个月","3个月-1岁","2-4岁","5-14岁","14-18岁","19-35岁","35-59岁","60岁以上"]; -->
                        <v-chip variant="outlined"
          filter>0-3个月</v-chip>
                        <v-chip variant="outlined"
          filter>3个月-1岁</v-chip>
                        <v-chip variant="outlined"
          filter>2-4岁</v-chip>
                        <v-chip variant="outlined"
          filter>5-14岁</v-chip>
          <v-chip variant="outlined"
          filter>14-18岁</v-chip>
          <v-chip variant="outlined"
          filter>19-35岁</v-chip>
          <v-chip variant="outlined"
          filter>35-59岁</v-chip>
          <v-chip variant="outlined"
          filter>60岁以上</v-chip>
                      </v-chip-group>
                    </div>
                    <div v-if="index==2">
                      <v-chip-group
                        v-model="selectionTwo"
                        selected-class="text-green-accent-4"
                        mandatory
                        @click="changeTwo"
                        style="margin-left: 10px;"
                      >
               
                        <v-chip variant="outlined"
          filter>男</v-chip>
                        <v-chip variant="outlined"
          filter>女</v-chip>
                        
                      </v-chip-group>
                    </div>
                    <div v-if="index==4">
                      <v-btn color="green" style="margin: 5px 5px;" @click="dialog1 = true">
                        症状列表
                      </v-btn>
                    
                    </div>
                  </v-card>
                </div>
              </v-card>
            </div>
          </div>
        </template>
        <div v-if="isLoading">
          <div class="pa-6">
            <div class="message">
              <AnimationAi :size="100" />
            </div>
          </div>
        </div>
        <div v-if="iswaiting">
          <div class="pa-6">
            <div class="message">
              <AnimationWaiting :size="150" />
            </div>
          </div>
        </div>
      </perfect-scrollbar>
      <div class="no-message-container" v-else>
        <h1 class="text-h1 text-md-h1 font-weight-bold" style="color: #344767">
          Chat With Me
        </h1>
        <Vue3Lottie :animationLink="animationUrl" :height="500" :width="500" />
      </div>
    </div>
    <div class="input-area">
      <v-sheet
        color="transparent"
        elevation="0"
        class="input-panel d-flex align-end pa-1"
      >
        <v-btn
          class="mb-1"
          variant="elevated"
          style="margin-right: 10px"
          icon
          @click="dialogVisible = true"
        >
          <v-icon class="text-primary">mdi-close-circle-outline</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            text="删除聊天记录"
          ></v-tooltip>
        </v-btn>

        <transition name="fade">
          <v-textarea
            class="mx-2"
            color="primary"
            type="text"
            clearable
            variant="solo"
            ref="input"
            v-model="userMessage"
            placeholder="Ask Anything"
            hide-details
            @keydown="handleKeydown"
            :rows="inputRow"
            @focus="inputRow = 3"
            @blur="inputRow = 1"
          >
          </v-textarea>
        </transition>

        <v-btn class="mb-1" variant="elevated" icon>
          <v-icon @click="sendMessage" class="text-primary">mdi-send</v-icon>
        </v-btn>
      </v-sheet>
    </div>
  </div>
</template>
  
  <script lang="ts" setup>
// -------------------------------------------------------------------------------------------------------------------------------------------
import { ref } from "vue";

const tab = ref("全身");
const nestedTab = ref({});
const amenities = ref({});
const items = [
    "全身",
    "四肢",
    "头部",
    "心理",
    "男性生殖",
    "盆腔",
    "肩部",
    "胸部",
    "腹部",
    "躯干",
    "颈部"
];

const nestedItems = {
    "全身": [
        "皮肤",
        "大小便",
        "肌肉",
        "血液血管",
        "骨及关节"
    ],
    "四肢": [
        "手",
        "肘",
        "脚",
        "腿",
        "膝",
        "臂",
        "踝"
    ],
    "头部": [
        "眼",
        "耳",
        "面部",
        "颅脑",
        "鼻"
    ],
    "心理": [
        "假期综合症",
        "偏执型人格障碍",
        "内向性思维",
        "分裂型人格障碍",
        "喜怒无常",
        "噩梦",
        "坐立不安",
        "多疑"
    ],
    "男性生殖": [
        "射精疼",
        "尿后滴白",
        "尿道口肿块",
        "尿道局部肿胀",
        "性交困难",
        "无痛性阴囊内肿块",
        "梦遗滑泄"
    ],
    "盆腔": [
        "尿道口有红斑和",
        "水肿",
        "尿道口疼",
        "慢性盆腔痛",
        "排尿前后膀胱区痛",
        "排尿异物感"
    ],
    "肩部": [
        "肩部",
        "腋窝"
    ],
    "胸部": [
        "下垂乳房",
        "不典型胸痛",
        "乳头发炎",
        "乳头溢出血性或棕色浆液性液体",
        "乳头破碎"
    ],
    "腹部": [
        "一侧性下腹剧烈疼痛",
        "一侧腰腹突发“刀割”样绞痛",
        "上腹不适",
        "上腹及腰背部有“束带感",
        "上腹弥漫性压痛"
    ],
    "躯干": [
        "其他",
        "背部",
        "腰部",
        "臀部"
    ],
    "颈部": [
        "咽喉",
        "甲状腺",
        "颈部"
    ]
};

const subsubItems = {
    "大小便": [
        "一时性便秘",
        "一过性肉眼血尿",
        "习惯性便秘",
        "便下恶臭",
        "便秘伴剧烈腹痛",
        "便秘伴腹部包块",
        "便血",
        "便血且血与粪便混合",
        "便血鲜红"
    ],
    "皮肤": [
        "上行性皮肤麻木",
        "丘疹",
        "丘疹性痤疮",
        "久不消退的红色皮肤疤",
        "乳头湿疹",
        "伤口形成一个搏动性肿块",
        "伤口愈合发痒",
        "伤口结疤",
        "体毛脱落",
        "光感性皮肤损害",
        "光过敏"
    ],
    "肌肉": [
        "乏力",
        "全身骨骼肌收缩",
        "全身骨骼肌痉挛",
        "功能性震颤",
        "反复抽搐"
    ],
    "血液血管": [
        "异常出血",
        "心前区重压感",
        "情绪性高血压",
        "慢性贫血",
        "毛细血管扩张",
        "毛细血管搏动"
    ],
    "骨及关节": [
        "关节僵直",
        "关节响痛",
        "关节强直",
        "关节强硬",
        "关节游走性疼痛肿胀",
        "关节畸形",
        "关节疼痛",
        "关节痛"
    ],
    "手": [
        "中指指甲凹陷",
        "伸指无力",
        "凹甲匙状指(趾)",
        "双手活动软弱无力",
        "双手轮替动作笨拙"
    ],
    "肘": [
        "肘痛",
        "肘部剧烈疼痛,压痛肿胀",
        "肘部外翻角增大",
        "肘部扭伤",
        "肘部的肿胀压痛"
    ],
    "脚": [
        "仰趾外翻",
        "八字脚步态",
        "双足红肿热痛",
        "外踝呈现凹陷",
        "头重足轻",
        "干性脚气",
        "弓形足"
    ],
    "腿": [
        "下肢动作沉重",
        "下肢发凉",
        "下肢呈剪刀步态",
        "下肢外展",
        "下肢弥漫性水肿"
    ],
    "膝": [
        "膝关节疼痛",
        "膝关节肿大",
        "膝关节肿胀积血",
        "膝内翻",
        "膝前疼痛"
    ],
    "臂": [
        "上肢无力",
        "上肢水肿",
        "上肢突然出现肿胀酸痛",
        "上肢麻木",
        "上肢麻痹"
    ],
    "踝": [
        "外踝前下方肿胀和疼痛",
        "踝关节疼痛",
        "踝关节肿胀",
        "踝部凹陷性水肿"
    ],
    "眼": [
        "两眼上视障碍",
        "两眼下视不能",
        "两眼刺痛",
        "两眼干涩",
        "乌珠生翳如葱白",
        "交叉注视"
    ],
    "耳": [
        "听力下降",
        "听力减退",
        "听力缺陷",
        "听觉疲劳",
        "听觉过敏",
        "听觉障碍",
        "复听",
        "复聪现象"
    ],
    "面部": [
        "下巴长痘",
        "下颌前突",
        "下颌角外翻",
        "人中圆凸",
        "前额及颧骨突出",
        "单侧面部萎缩"
    ],
    "颅脑": [
        "中度或轻度头痛",
        "中风偏瘫",
        "以头昏为主的眩晕",
        "体位性震颤",
        "偏侧不注意"
    ],
    "鼻": [
        "反复感冒",
        "反复鼻出血",
        "变应性鼻炎",
        "口角和鼻周出现黄白色水疱",
        "口鼻生疮"
    ],
    "肩部": [
        "张口抬肩",
        "持续性剧烈的肩痛",
        "肋间肩胛带疼痛",
        "肩关节活动受限",
        "肩关节痛"
    ],
    "腋窝": [
        "腋窝多汗",
        "腋窝有异味",
        "腋窝痛",
        "腋部肿块"
    ],
    "背部": [
        "背部酸痛",
        "背部长痘",
        "脊柱侧弯",
        "脊柱弯曲",
        "脊椎僵直"
    ],
    "腰部": [
        "反射性腰痛",
        "右腰部压痛",
        "尾骶部疼痛",
        "左、右腰腹痛",
        "左腰部压痛",
        "弯腰时腰痛"
    ],
    "臀部": [
        "停止排气",
        "排气多",
        "排粪时肛门灼痛",
        "放屁频频",
        "炎性外痔"
    ],
    "咽喉": [
        "反酸",
        "发作性咳喇",
        "发音改变",
        "发音障碍",
        "变应性咳嗽",
        "口咽异物"
    ],
    "甲状腺": [
        "甲状腺结节",
        "颈部不适"
    ],
    "颈部": [
        "梗噎",
        "椎间盘脱出",
        "短颈",
        "肩背颈项痛"
    ],
    "假期综合症": [
        "假期焦虑",
        "假期抑郁",
        "假期孤独感",
        "假期失眠"
    ],
    "偏执型人格障碍": [
        "偏执妄想",
        "偏执狂",
        "偏执表现",
        "偏执疑虑"
    ],
    "内向性思维": [
        "内向型性格",
        "内向表现",
        "内向性格特点",
        "内向思考方式"
    ],
    "分裂型人格障碍": [
        "分裂症",
        "分裂型表现",
        "分裂型幻觉",
        "分裂型情感混乱"
    ],
    "喜怒无常": [
        "情绪不稳定",
        "情绪波动",
        "喜怒无常表现",
        "情绪失控"
    ],
    "噩梦": [
        "梦魇",
        "恶梦频发",
        "噩梦内容",
        "噩梦影响睡眠"
    ],
    "坐立不安": [
        "焦虑不安",
        "坐立不安行为",
        "坐立不安表现",
        "坐立不安心理"
    ],
    "多疑": [
        "疑神疑鬼",
        "多疑心理",
        "多疑型人格",
        "多疑症状"
    ],
    "射精疼": [
        "射精",
        "射精疼痛",
        "射精异常",
        "射精无力",
        "射精障碍"
    ],
    "尿后滴白": [
        "尿不尽",
        "尿后滴白症状",
        "尿道刺痛",
        "尿道内结石",
        "尿道内阻塞"
    ],
    "尿道口肿块": [
        "尿道上端肿块",
        "尿道下端肿块",
        "尿道口分泌物增多",
        "尿道口发痒",
        "尿道口水肿"
    ],
    "尿道局部肿胀": [
        "尿道内感觉异物",
        "尿道局部肿胀压痛",
        "尿道局部疼痛",
        "尿道局部痛",
        "尿道局部麻木"
    ],
    "性交困难": [
        "性交困难原因",
        "性交困难表现",
        "性交困难诊断",
        "性交困难症状",
        "性交困难的解决方法"
    ],
    "无痛性阴囊内肿块": [
        "无痛性睾丸肿块",
        "无痛性睾丸硬结",
        "无痛性睾丸肿大",
        "无痛性睾丸肿物",
        "无痛性睾丸肿胀"
    ],
    "梦遗滑泄": [
        "梦遗",
        "梦遗多",
        "梦遗滑泄原因",
        "梦遗滑泄症状",
        "梦遗滑泄表现"
    ],
    "尿道口有红斑和": [
        "尿道口疼痛",
        "尿道口疼痛灼热",
        "尿道口红斑",
        "尿道口红斑疼痛",
        "尿道口肿胀"
    ],
    "水肿": [
        "水肿症状",
        "水肿原因",
        "水肿检查",
        "水肿的治疗",
        "水肿的预防"
    ],
    "慢性盆腔痛": [
        "盆腔疼痛",
        "盆腔疼痛的症状",
        "盆腔疼痛的原因",
        "盆腔疼痛的诊断",
        "盆腔疼痛的治疗"
    ],
    "排尿前后膀胱区痛": [
        "排尿后腹部疼痛",
        "排尿后膀胱区痛",
        "排尿前膀胱区痛",
        "排尿时腹痛",
        "排尿疼痛"
    ],
    "排尿异物感": [
        "排尿感觉异常",
        "排尿感觉异常的原因",
        "排尿感觉异常的诊断",
        "排尿感觉异常的治疗",
        "排尿感觉异常的预防"
    ],
    "下垂乳房": [
        "乳房大小不一",
        "乳房外形改变",
        "乳房延缓发育",
        "乳房扁平",
        "乳房无感"
    ],
    "不典型胸痛": [
        "不典型性胸痛",
        "不典型胸痛的症状",
        "不典型胸痛的原因",
        "不典型胸痛的诊断",
        "不典型胸痛的治疗"
    ],
    "乳头发炎": [
        "乳头感染",
        "乳头发红",
        "乳头发炎的原因",
        "乳头发炎的症状",
        "乳头发炎的治疗"
    ],
    "乳头溢出血性或棕色浆液性液体": [
        "乳头溢液",
        "乳头溢液的原因",
        "乳头溢液的症状",
        "乳头溢液的诊断",
        "乳头溢液的治疗"
    ],
    "乳头破碎": [
        "乳头破裂",
        "乳头破裂的原因",
        "乳头破裂的症状",
        "乳头破裂的诊断",
        "乳头破裂的治疗"
    ],
    "一侧性下腹剧烈疼痛": [
        "下腹剧烈疼痛",
        "下腹剧烈疼痛的原因",
        "下腹剧烈疼痛的诊断",
        "下腹剧烈疼痛的治疗",
        "下腹剧烈疼痛的预防"
    ],
    "一侧腰腹突发“刀割”样绞痛": [
        "腰腹绞痛",
        "腰腹绞痛的原因",
        "腰腹绞痛的诊断",
        "腰腹绞痛的治疗",
        "腰腹绞痛的预防"
    ],
    "上腹不适": [
        "上腹不适的原因",
        "上腹不适的症状",
        "上腹不适的诊断",
        "上腹不适的治疗",
        "上腹不适的预防"
    ],
    "上腹及腰背部有“束带感": [
        "腰背部束带感",
        "腰背部束带感的原因",
        "腰背部束带感的症状",
        "腰背部束带感的诊断",
        "腰背部束带感的治疗"
    ],
    "上腹弥漫性压痛": [
        "上腹压痛",
        "上腹压痛的原因",
        "上腹压痛的症状",
        "上腹压痛的诊断",
        "上腹压痛的治疗"
    ],
    "其他": [
        "心血管疾病",
        "恶性肿瘤",
        "肝胆胰脾",
        "消化道",
        "肺部",
        "泌尿生殖",
        "内分泌",
        "神经",
        "免疫"
    ],
    "背部": [
        "慢性背痛",
        "背痛",

    ],
    "腰部": [
        "腰痛",

    ],
    "臀部": [
        "臀部疼痛",

    ],
    "停止排气": [
        "排气困难",

    ],
    "排气多": [
        "排气",

    ],
    "排粪时肛门灼痛": [
        "排粪疼痛",

    ],
    "放屁频频": [
        "屁多",

    ],
    "炎性外痔": [
        "外痔",

    ],
    "反酸": [
        "反流性食管炎",
        "反酸",

    ],
    "发作性咳喇": [
        "干咳",
    ],
    "发音改变": [
        "声音嘶哑",

    ],
    "发音障碍": [
        "发音困难",

    ],
    "变应性咳嗽": [
        "变应性咳嗽",
        
    ],
    "口咽异物": [
        "吞咽困难",
     
    ],
    "甲状腺结节": [
        "甲状腺增生",
       
    ],
    "颈部": [
        "颈部疼痛",
       
    ]
};
const clearLists = () => {
  for (const item of items) {
    amenities.value[item] = {};
    const nestedList = nestedItems[item] || []; // 如果不存在对应的 nestedItems，则使用空数组
    for (const nestedItem of nestedList) {
      amenities.value[item][nestedItem] = ref([]);
    }
  }
};
clearLists();
// 将 amenities[item][nestedItem] 中的所有列表值合并到一个列表中
function mergeLists(mergedList: any[]) {
  for (const item in amenities.value) {
    for (const nestedItem in amenities.value[item]) {
      mergedList.push(...amenities.value[item][nestedItem]);
    }
  }
}
const mergedList = ref([]);
import { ElMessageBox } from "element-plus";



function confirmClick() {
  // ElMessageBox.confirm(`Are you confirm to chose ?`)
  //   .then(() => {

      mergeLists(mergedList.value);
      clearLists();
      // 这里应该再初始化一下tab
      // console.log(nestedTab[tab.value]);
      
      userMessage.value= mergedList.value.join(",");
      console.log(userMessage.value);
      dialog1.value=false;
    // })
    // .catch(() => {
    //   // catch error
    // });
}
// -------------------------------------------------------------------------------------------------------------------------------------------
import { onMounted, watch } from "vue";
import { useSnackbarStore } from "@/stores/snackbarStore";

import AnimationAi from "@/components/animations/AnimationBot1.vue";
import AnimationWaiting from "@/components/animations/AnimationSearch1.vue";
import { countAndCompleteCodeBlocks } from "@/utils/aiUtils";
import { scrollToBottom } from "@/utils/common";
import { getCurrentInstance } from "vue";
import { Vue3Lottie } from "vue3-lottie";
const animationUrl =
  "https://lottie.host/ca50b51e-bb42-49b0-bf96-a06c3af44b9a/e0gnNucSCb.json";
const { proxy } = getCurrentInstance();
import "md-editor-v3/lib/style.css";
const selection=ref(-1);
const selectionTwo = ref(-1);
const Ages=["0-3个月","3个月-1岁","2-4岁","5-14岁","14-18岁","19-35岁","35-59岁","60岁以上"];
const Sexs=["男","女"];
const dialog1=ref(false);
const changeOne=()=>{
  console.log("哈哈哈哈哈哈哈哈哈哈哈")
  userMessage.value=Ages[selection.value];

}

const changeTwo=()=>{
  userMessage.value=Sexs[selectionTwo.value];
}



const snackbarStore = useSnackbarStore();

interface Message {
  content: string;
  role: "user" | "assistant" | "system";
}
// User Input Message
const userMessage = ref("");
const tempMessage = ref("");
const messages = ref<Message[]>([]);
const userInfo = ref({});
onMounted(() => {
  const userInfoData = localStorage.getItem("userInfo");
  const userinf = JSON.parse(userInfoData);
  userInfo.value = userinf;
  initMessages();
  console.log("hhhhhhhhhhhhhhh");
  console.log(messages.value);
});
watch(messages.value, (newMessages, oldMessages) => {
  scrollToBottom(document.querySelector(".message-container"));
  if (newMessages.length === 0) {
    // 当 messages 数组长度为 0 时执行的操作
    messages.value.push({ content: "请选择问诊人年龄", role: "assistant" });
    // 在这里执行你的操作
  } else if (newMessages.length === 2) {
    // 当 messages 数组长度为 2 时执行的操作
    messages.value.push({ content: "请选择问诊人性别", role: "assistant" });
    console.log("消息数组长度为2，执行某些操作");
    // 在这里执行你的操作
  } else if (newMessages.length === 4) {
    // 当 messages 数组长度为 2 时执行的操作
    messages.value.push({
      content:
        "请输入您的症状，不同症状用逗号隔开，也可从下方“症状列表”直接选择",
      role: "assistant",
    });
    console.log("消息数组长度为4，执行某些操作");
    // 在这里执行你的操作
  }
});
//发送到后端，每次更新都保存
// const updateMessages= async(Chatmessages)=>{
//   const response = await axios.post(proxy.globalInfo.url_f + "/updateChatMessages", {
//       userId: userInfo.value.userId,
//       kill: Chatmessages,
//     });
// };
const initMessages = () => {
  messages.value.push({ content: "请选择问诊人年龄", role: "assistant" });

};

const dialogVisible = ref(false);

const handleClose = (done: () => void) => {
  ElMessageBox.confirm("你确定关闭对话框吗?")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

const clearchatmessages = () => {
  messages.value.length = 0;
  clearLists();
  symptoms.value=([]);
  //   const response = axios.post(proxy.globalInfo.url_f + "/clearchatmessages", {
  //       userId: userInfo.value.userId,
  //     });
  //     response.then(response => {
  //   // 成功处理响应数据
  //   console.log("响应数据:", response.data.data);
  //       messages.value=<Message[]>([]);
  dialogVisible.value = false;
  snackbarStore.showSuccessMessage("删除成功");
  }

const isLoading = ref(false);
const iswaiting = ref(false);

const symptoms = ref([]);
// Send Messsage
const sendMessage = async () => {
  if (userMessage.value) {
    // Add the message to the list
    messages.value.push({
      content: userMessage.value,
      role: "user",
    });
    if (messages.value.length == 2) {
      symptoms.value.push("年龄:" + userMessage.value);
    } else if (messages.value.length == 4) {
      symptoms.value.push("性别:" + userMessage.value);
    } else if (messages.value.length == 6) {
      symptoms.value.push("症状为:" + userMessage.value);
    }

    tempMessage.value = userMessage.value;
    userMessage.value = "";
    // console.log("症状列表")
    // console.log(symptoms.value)
  }
  if (messages.value.length == 6) {
    await createCompletion();
  }
};
//这里是发送请求的，只需要改这个接口
const createCompletion = async () => {
  // 获取内容
  const content = symptoms.value; // 问话请求的内容

  try {
    // 创建完成
    iswaiting.value = true;
    const response = await fetch(proxy.globalInfo.url_f + "/aiDetect", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ content: content }),
    });
    iswaiting.value = false;

    if (!response.ok) {
      const errorData = await response.json();
      snackbarStore.showErrorMessage(errorData.error.message);
      return;
    }

    // 读取响应数据
    const responseData = await response.json();
    messages.value.push({
      content: responseData.processed_content,
      role: "assistant",
    });
  } catch (error) {
    snackbarStore.showErrorMessage(error.message);
  }
};

const displayMessages = computed(() => {
  const messagesCopy = messages.value.slice(); // 创建原始数组的副本
  const lastMessage = messagesCopy[messagesCopy.length - 1];
  const updatedLastMessage = {
    ...lastMessage,
    content: countAndCompleteCodeBlocks(lastMessage.content),
  };
  messagesCopy[messagesCopy.length - 1] = updatedLastMessage;
  return messagesCopy;
});

const handleKeydown = (e) => {
  if (e.key === "Enter" && (e.altKey || e.shiftKey)) {
    // 当同时按下 alt或者shift 和 enter 时，插入一个换行符
    e.preventDefault();
    userMessage.value += "\n";
  } else if (e.key === "Enter") {
    // 当只按下 enter 时，发送消息
    e.preventDefault();
    sendMessage();
  }
};
const inputRow = ref(1);
</script>
  
  <style scoped lang="scss">
/* Helper classes */

.el-drawer__header {
  margin-bottom: 0px;
}
.bg-basil {
  background-color: #fffbe6 !important;
}
.text-basil {
  color: #356859 !important;
}
.chat-bot {
  background-repeat: repeat;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  .messsage-area {
    flex: 1;
    height: 80%;
  }

  .input-area {
    position: absolute;
    width: 100%;
    bottom: 0;
    // padding: 1rem;

    align-items: center;

    .input-panel {
      border-radius: 5px;
      max-width: 1200px;
      margin: 0 auto;
    }
  }
}

.user-message {
  display: flex;
  align-content: center;
  justify-content: end;
  flex-direction: row-reverse;
}

.assistant-message {
  display: flex;
  align-content: center;
  justify-content: start;
  flex-direction: row;
  margin-right: 20%;
}

.message {
  margin: 0 auto;
  max-width: 1200px;
  display: flex;
}

.message-container {
  height: calc(80vh);
}

.no-message-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h1 {
    font-size: 2rem;
    font-weight: 500;
  }
}

:deep(.md-editor-preview-wrapper) {
  padding: 5px 15px;
}

.font-1 {
  font-size: 13px !important;
}

@media screen and (max-width: 768px) {
  :deep(#md-editor-v3-preview),
  .user-message {
    font-size: 14px !important;
  }
}
.el-drawer__header {
    display: none;
}
.el-drawer {
    --el-drawer-bg-color: var(--el-dialog-bg-color, var(--el-bg-color));
    --el-drawer-padding-primary: ;
}
</style>
  