
<script setup lang="ts">
import { onMounted } from 'vue';
// import Neovis from 'neovis.js';
import { useSnackbarStore } from "@/stores/snackbarStore";
const snackbarStore = useSnackbarStore();
import { Vue3Lottie } from "vue3-lottie";

import NeoVis from 'neovis.js/dist/neovis';
import { ref } from "vue";
const variants = ['elevated', 'tonal', 'outlined']
const search = ref("");
const showExample = ref(false);
const loading = ref(false);
interface Item {
  title: string;
  text: string;
}

const customItems: Item[] = [
  { title: '示例数据 1', text: '小明今天晚上要去同学聚会，但他得了脊椎病，他能喝点白酒吗？' },
  { title: '示例数据 2', text: '小明感到身体不适，而后被诊断出患上了疱疹。在吃药的同时他渴望能够尽快恢复健康。所以有哪些食物能益于他恢复呢？' },
  { title: '示例数据 3', text: '小明前端时间得了脑膜炎，但是他又没办法去医院就诊，你推荐他买些什么药呢' }
]
import axios from 'axios';
const items = ref(customItems);
const close = () => {
  showExample.value = false;
};
const handleCardClick = (text) => {
  search.value = text;
console.log(text);
close();
}
import { getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
const onClick = () => {
  console.log(search.value);
  loading.value = true;
  axios.post(proxy.globalInfo.url_f+'/getNeo4j',{
    askInfo:search.value
  })
    .then(response => {

      showSecond.value= response.data.data;
      init_cypher.value=showSecond.value[1];
      runneo4j();
      snackbarStore.showSuccessMessage("获取成功");
      loading.value = false;
      
      
    })
    .catch(error => {
      console.error('Error fetching data: ', error);
      loading.value = false;
      throw error;
    });

// MATCH p=()-[r:no_eat]->() RETURN p LIMIT 25

  
};
const init_cypher=ref("MATCH p=()-[r:no_eat]->() RETURN p LIMIT 75");
const neo4jConfig= {
  container_id: "viz",
        server_url: "bolt://localhost:7687",
        server_user: "neo4j",
        server_password: "123456789",

        labels: {
          "Disease": {caption:"name",color: "#FF5733", size: 200, font: { size: 25, color: "#000000", },"title_properties": [
							"name",
							"symptoms","prevent","cause"
						] },
          "Drug": { caption:"name",color: "#C70039", size: 170, font: { size: 15, color: "#000000", } },
          "Food": { caption:"name",color: "#900C3F", size: 170, font: { size: 15, color: "#000000", } },
          "Producer": { caption:"name",color: "#581845", size: 170, font: { size: 15, color: "#000000", } },
          "Symptom": { caption:"name",color: "#FFC300", size: 170, font: { size: 15, color: "#000000", } },
          "Check": { caption:"name",color: "#DAF7A6", size: 150, font: { size: 15, color: "#000000", } },
          "Department": { caption:"name",color: "#DAF7A6", size: 150, font: { size: 15, color: "#000000", } },
        },
     relationships: {

     },
     arrows: true,
        hierarchical: false,
    
        initial_cypher: init_cypher.value

};
const runneo4j=()=>{
  const neo4jConfigNew= {
  container_id: "viz",
        server_url: "bolt://localhost:7687",
        server_user: "neo4j",
        server_password: "123456789",

        labels: {
          "Disease": {caption:"name",color: "", size: 200, font: { size: 25, color: "#000000", }, "title_properties": [
							"name",
							"symptoms","prevent","cause"
						]},
          "Drug": { caption:"name",color: "", size: 150, font: { size: 15, color: "#000000", } },
          "Food": { caption:"name",color: "", size: 150, font: { size: 15, color: "#000000", } },
          "Producer": { caption:"name",color: "", size: 150, font: { size: 15, color: "#000000", } },
          "Symptom": { caption:"name",color: "", size: 150, font: { size: 15, color: "#000000", } },
          "Check": { caption:"name",color: "", size: 150, font: { size: 15, color: "#000000", } },
          "Department": { caption:"name",color: "", size: 150, font: { size: 15, color: "#000000", } },
        },
     relationships: {

     },
     arrows: true,
        hierarchical: false,
    
        initial_cypher: init_cypher.value

};
try {
    const viz = new NeoVis(neo4jConfigNew);
    
    viz.render();
  } catch (error) {
    console.error('Failed to load Neovis', error);
  }

}




onMounted(() => {
 
  
  try {
    const viz = new NeoVis(neo4jConfig);
    viz.render();
  } catch (error) {
    console.error('Failed to load Neovis', error);
  }

}
  
);
const showFirst=ref(["输入问题：","生成cypher语句：","回答问题："]);
const showSecond=ref(["","",""]);
const color = ref('primary')
</script>

<template>
 <v-container>
    <v-card class="mx-auto" color="primary" max-width="100%">
      <v-card-text style="display: flex;">
        <v-text-field
          v-model="search"
          :loading="loading"
          append-inner-icon="mdi-magnify"
          density="compact"
          label="请输入问题"
          variant="solo"
          hide-details
          style="width: 70%;margin-right: 20px"
          single-line
          @click:append-inner="onClick"
        ></v-text-field>
        <v-btn
          class="mb-1"
          variant="elevated"
          icon
          @click="showExample = true"
        >
          <v-icon size="30" class="text-primary">mdi-comment-text-multiple</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            text="样例数据"
          ></v-tooltip>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
  <v-container> <v-sheet elevation="0" class="mx-auto" color="transparent" max-width="1600">
    <v-row>
      <v-col cols="12" md="5" lg="4" sm="4">
        <v-row align="center" justify="center">
      <v-col
        v-for="(variant, i) in variants"
        :key="i"
        cols="auto"
      >
        <v-card
          :color="color"
          :variant="variant"
          class="mx-auto"
          width="500px"
          max-width="600"
        >
          <v-card-item>
            <v-card-title class="py-7 font-weight-bold text-h4" style="max-width: 100%; word-wrap: break-word;">
            {{showFirst[i]  }}
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-7 text-h6"><b>{{ showSecond[i] }}</b></v-card-text>
          </v-card-item>

  
        </v-card>
      </v-col>
    </v-row>
      </v-col>
      <v-col cols="12" md="1" lg="1" sm="1"></v-col>
      <v-col cols="12" md="6" lg="7" sm="7">
        <v-card class="mb-5">
          <v-card-title class="bg-white py-4 font-weight-bold">
            {{ init_cypher }}
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-7">
            <div id="viz" style="height: 600px;"></div>
          </v-card-text>
            
        
        </v-card>
        
        
      </v-col>
    </v-row>
  </v-sheet></v-container>
 
  <v-dialog v-model="showExample" width="600">
    <v-card>
      <v-card-title class="font-weight-bold pa-5">
        示例数据</v-card-title>
      <v-divider />
      <v-card-text>
        <v-data-iterator :items="items" >
          <template v-slot:default="{ items }">
            <template v-for="(item) in items" :key="item">
              <v-card v-bind="item.raw"  style="cursor:pointer;"  @click="handleCardClick(item.raw.text)"></v-card>
              <br>
            </template>
          </template>
        </v-data-iterator>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="primary" @click="close">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
// 
</style>
