<template>
  <div class="d-flex text-center flex-grow-1">
    <v-sheet
      class="layout-side d-none d-md-flex flex-column justify-space-between"
    >
      <div class="mt-3 mt-md-10 pa-2">
        <div
          class="text-primary text-h2 font-weight-bold"
          style="margin-bottom: 100px; margin-top: 100px"
        >
          医智伴行
        </div>
        <!-- <div class="title my-2" >
          
        </div> -->
        <!-- <Vue3Lottie
                :animationLink="animationUrl"
                :height="400"
                :width="400"
              /> -->
        
      </div>
      <div class="card">
          <div class="wrapper">
            <img src="@/assets/images/2.png" class="cover-image" />
          </div>
          <!-- <img
                src="https://ggayane.github.io/css-experiments/cards/dark_rider-title.png"
                class="title"
              /> -->
          <!-- <b class="title" style="font-size: 30px;">多智能体协同的医疗问答系统</b> -->
          <img src="@/assets/images/e.png" class="character" />
        </div>
    </v-sheet>
    <v-card
      variant="outlined"
      class="flex-grow-1 d-flex align-center justify-center flex-column"
    >
      <div class="layout-content ma-auto w-full">
        <slot></slot>
      </div>
      <div class="pa-5">多智能体协同的医疗问答系统</div>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { Vue3Lottie } from "vue3-lottie";
const animationUrl =
  "https://lottie.host/ca50b51e-bb42-49b0-bf96-a06c3af44b9a/e0gnNucSCb.json";
</script>
<style lang="scss" scoped>
.layout-side {
  width: 420px;
}

.layout-content {
  max-width: 480px;
}
.card {
  max-width: 420px;
  height: 400px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  
  perspective: 2500px;
  margin: 50px auto;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wrapper {
  transition: all 0.5s;
  
  width: 100%;
  z-index: -1;
}

.card:hover .wrapper {
  transform: perspective(900px) translateY(-5%) rotateX(25deg) translateZ(0);
  box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
  -webkit-box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 2px 35px 32px -8px rgba(0, 0, 0, 0.75);
}

.wrapper::before,
.wrapper::after {
  content: "";
  opacity: 0;
  width: 100%;
  height: 80px;
  transition: all 0.5s;
  position: absolute;
  left: 0;
}
.wrapper::before {
  top: 0;
  height: 100%;
  background-image: linear-gradient(
    to top,
    transparent 46%,
    rgba(12, 13, 19, 0.5) 68%,
    rgba(12, 13, 19) 97%
  );
}
.wrapper::after {
  bottom: 0;
  opacity: 1;
  background-image: linear-gradient(
    to bottom,
    transparent 46%,
    rgba(12, 13, 19, 0.5) 68%,
    rgba(12, 13, 19) 97%
  );
}

.card:hover .wrapper::before,
.wrapper::after {
  opacity: 1;
}

.card:hover .wrapper::after {
  height: 120px;
}
.title {
  width: 100%;
  transition: transform 0.5s;
}
.card:hover .title {
  transform: translate3d(0%, -50px, 100px);
}

.character {
  width: 100%;
  opacity: 0;
  transition: all 0.7s;
  position: absolute;
  z-index: -1;
}

.card:hover .character {
  opacity: 1;
  transform: translate3d(0%, -50%, 400px);
}
</style>
