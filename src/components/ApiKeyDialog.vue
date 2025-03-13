
<script setup lang="ts">
import { useChatGPTStore } from "@/stores/chatGPTStore";
import {  defineEmits } from 'vue';

interface Item {
  title: string;
  text: string;
}


const emit = defineEmits();

const handleCardClick = (text) => {

  console.log(text);
  emit('click', text);
}

const chatGPTStore = useChatGPTStore();

const close = () => {
  chatGPTStore.configDialog = false;
};

// const handleCardClick = (item: Item) => {
//   // Handle click event here
//   console.log(`Clicked on item:`, item)
// }

import { ref } from 'vue'

interface Item {
  title: string;
  text: string;
}

const customItems: Item[] = [
  { title: 'Custom Item 1', text: 'Custom Text 1' },
  { title: 'Custom Item 2', text: 'Custom Text 2' },
  { title: 'Custom Item 3', text: 'Custom Text 3' }
]

const items = ref(customItems);





</script>
 
<template>
  <v-dialog v-model="chatGPTStore.configDialog" width="600">
    <v-card>
      <v-card-title class="font-weight-bold pa-5">
        示例数据</v-card-title>
      <v-divider />
      <v-card-text>
        <v-data-iterator :items="items" >
          <template v-slot:default="{ items }">
            <template v-for="(item) in items" :key="item">
              <v-card v-bind="item.raw"  style="cursor:pointer;"  @click="handleCardClick(item.text)"></v-card>
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

<style scoped lang="scss"></style>
