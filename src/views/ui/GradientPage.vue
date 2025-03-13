<template>
  <el-button type="primary" style="margin-left: 16px" @click="drawer2 = true">
    with footer
  </el-button>

  <el-drawer v-model="drawer2" :direction="direction" size="50%">
    <template #header>
      <h4>set title by slot</h4>
    </template>
    <v-card color="basil">
      <v-card-title class="text-center justify-center py-6">
        <h1 class="font-weight-bold text-h2 text-basil">BASiL</h1>
      </v-card-title>

      <v-tabs
        v-model="tab"
        bg-color="transparent"
        color="basil"
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
          <v-card color="basil" flat>
            <!-- <v-card-text>{{ text }}</v-card-text> -->

            <!-- 添加嵌套的选项卡 -->
            <v-tabs v-model="nestedTab[item]" color="basil" grow>
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
                <v-card color="basil" flat>
                  <!-- <v-card-text>{{ subItem }} Content</v-card-text> -->
                  <v-chip-group v-model="amenities" column multiple>
                    <v-chip variant="outlined" filter v-for="iitem in subsubItems[subItem]" :key="iitem" :value="iitem"> {{ iitem }}  </v-chip>
                   
                  </v-chip-group>
                </v-card>
              </v-window-item>
            </v-window>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">cancel</el-button>
        <el-button type="primary" @click="confirmClick">confirm</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref } from "vue"; // 引入ref

// 使用ref创建响应式对象
const tab = ref("Appetizers");
const nestedTab = ref({});
const amenities = ref([]);
const items = [
  "Appetizers",
  "Entrees",
  "Deserts",
  "Cocktails",
  "dwawadwwda",
  "dwawawdawda",
  "dwawdawdawdawdawd",
  "dwwdadawdwa",
  "Appetizers",
  "Entrees",
  "Deserts",
  "Cocktails",
  "dwawadwwda",
  "dwawawdawda",
  "dwawdawdawdawdawd",
  "dwwdadawdwa",
];

const nestedItems = {
  Appetizers: ["SubItem1", "SubItem2", "SubItem3"],
  Entrees: ["SubItemA", "SubItemB", "SubItemC"],
  Deserts: ["Sub Item X", "Sub Item Y", "Sub Item Z"],
  Cocktails: ["Sub Item Alpha", "Sub Item Beta", "Sub Item Gamma"],
  dwawadwwda: ["Sub Item Delta", "Sub Item Epsilon", "Sub Item Zeta"],
  dwawawdawda: ["Sub Item Phi", "Sub Item Chi", "Sub Item Psi"],
  dwawdawdawdawdawd: ["Sub Item Omega", "Sub Item Omicron", "Sub Item Delta"],
  dwwdadawdwa: ["Sub Item Theta", "Sub Item Kappa", "Sub Item Lambda"],
};
const subsubItems = {
  SubItem1: ["Sub Item 1", "Sub Item 2", "Sub Item 3"],
  SubItem2: ["Sub Item A", "Sub Item B", "Sub Item C"],
  SubItem3: ["Sub Item X", "Sub Item Y", "Sub Item Z"],
  SubItemA: ["Sub Item Alpha", "Sub Item Beta", "Sub Item Gamma"],
  SubItemB: ["Sub Item Delta", "Sub Item Epsilon", "Sub Item Zeta"],
  SubItemC: ["Sub Item Phi", "Sub Item Chi", "Sub Item Psi"],
  dwawdawdawdawdawd: ["Sub Item Omega", "Sub Item Omicron", "Sub Item Delta"],
  dwwdadawdwa: ["Sub Item Theta", "Sub Item Kappa", "Sub Item Lambda"],
};

const text =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

// 监听tab变化
const onTabChange = (newTab: string) => {
  // 使用ref创建响应式对象，确保每个tab都有一个对应的nestedTab对象
  if (!nestedTab.value[newTab]) {
    nestedTab.value[newTab] = null;
  }
};

import { ElMessageBox } from "element-plus";

// const drawer = ref(false)
const drawer2 = ref(false);
const direction = ref("ttb");

const handleClose = (done: () => void) => {
  ElMessageBox.confirm("Are you sure you want to close this?")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};
function cancelClick() {
  drawer2.value = false;
}
function confirmClick() {
  ElMessageBox.confirm(`Are you confirm to chose ?`)
    .then(() => {

      // console.log(nestedTab[tab.value]);
      console.log(amenities.value);
      drawer2.value = false;
    })
    .catch(() => {
      // catch error
    });
}
</script>

<style>
/* Helper classes */
.bg-basil {
  background-color: #fffbe6 !important;
}
.text-basil {
  color: #356859 !important;
}
</style>
