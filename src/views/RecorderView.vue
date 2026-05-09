<template>
  <v-container fluid v-if="state == 'init'">
    <div class="d-flex align-center justify-center mt-4">
      Press 'START' to begin
    </div>
    <div class="d-flex align-center justify-center mt-4">
      <v-btn @click="start">START <v-icon>chevron_right</v-icon></v-btn>
    </div>
  </v-container>
  <v-container fluid v-else id="main-container">
    <div class="d-flex align-center justify-center mt-4" v-if="store.selectedTask.type == 'sentence'">
      <h2 class="font-weight-regular"
        :class="store.currentItem?.font == 'GRF Chinese Font' ? 'traditional-chinese' : ''">{{
          store.currentItem?.sentence }}</h2>
    </div>
    <!-- North Wind Sun screenshot -->
    <div v-if="store.selectedTask.type == 'passage'">
      <v-img :src="'data/materials/nwsImages/' + store.items[0].file">
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
          </div>
        </template>
      </v-img>
    </div>

    <!-- Story pictures -->
    <div v-if="store.selectedTask.type == 'picture'">
      <v-img height="90vh" :src="'data/materials/storyImages/' + store.items[0].file">
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
          </div>
        </template>
      </v-img>
    </div>

    <!-- Q&A series of sentence prompts -->
    <div v-if="store.selectedTask.type == 'series'">
      <div class="d-flex align-center justify-center mt-4" v-if="store.selectedTask.type == 'series'">
      <ul class="font-weight-regular"
        :class="store.currentItem?.font == 'GRF Chinese Font' ? 'traditional-chinese' : ''">
          <li v-for="sentence, id of store.currentItem?.sentence" :key="id">
            {{sentence}}
          </li>
      </ul>
    </div>
    </div>
    <div class="d-flex flex-column align-center justify-center mt-4">
      <v-btn :disabled="buttonsDisabled" @click="next()" color="primary" class="mb-4"
        size="large"><v-icon>chevron_right</v-icon></v-btn>
      <v-btn :disabled="buttonsDisabled" @click="next(true)" color="warning" variant="outlined"
        size="small"><v-icon>cached</v-icon></v-btn>
    </div>
    <p class="text-center mt-4 text-medium-emphasis">{{ progress }}</p>

    <div style="position:relative;height:26px;width:24px;margin-left:auto;margin-right:auto">
      <v-icon style="position:absolute;top:0%;left:0%;color:gainsboro;" size="x-large">mic</v-icon>
      <v-icon style="position:absolute;top:0%;left:0%;color:red;" :style="{clipPath: 'polygon(0 ' + loudness + '%, 100% ' + loudness + '%, 100% 100%, 0% 100%)'}" size="x-large">mic</v-icon>
    </div>
    <div style="position:absolute;bottom:0;width:100%">
      <a href @click.prevent="router.push('/end')">exit</a>
    </div>
  </v-container>
</template>


<script setup>
import { computed, onMounted, onUnmounted, ref, } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from "@/stores/useStore";
import UseMediaRecorder from '@/composables/UseMediaRecorder';
import gsap from 'gsap';
import * as Tone from 'tone';

//import Papa from 'papaparse';

const store = useStore();
const router = useRouter();
const state = ref("init");//init, run
const { getMic, stopRecorder, startRecorder } = UseMediaRecorder();

let timestamps;
let startTime;
let endTime;
let timer;

const start = async () => {
  //start microphone here
  await getMic();
  startRecorder();
  state.value = "run";

  //keep track of next button click timepoints
  timestamps = "startTime\tendTime\tutterance\n";
  startTime = 0;
  timer = performance.now() / 1000;
}

const next = async (retry = false) => {
  keySpamProtection();
  gsap.to("#main-container", { opacity: 0, duration: 0 });
  endTime = performance.now() / 1000 - timer + startTime;
  let utterance;
  if (retry == true) {
    utterance = "!X";
  } else {
    if (store.currentItem.sentence != null) {
      utterance = store.currentItem.sentence;
    } else {
      utterance = store.currentItem.taskName;
    }
  }

  timestamps += (startTime).toFixed(3) + "\t" + (endTime).toFixed(3) + "\t" + utterance + "\n";
  startTime = endTime;
  timer = performance.now() / 1000;

  if (retry == false) {
    if (store.incrementIndex() == "end") {
      //store mic and create wav file here
      stopRecorder(store.filename + ".wav", store.directoryHandle);

      //save timestamps
      const fileHandle = await store.directoryHandle.getFileHandle(store.filename + ".txt", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(timestamps);
      await writable.close();

      //go to end route
      router.push("/end");
    }
  }


  gsap.to("#main-container", { delay: 0.5, opacity: 1, duration: 0.25 });
}

const buttonsDisabled = ref(false);
function keySpamProtection() {
  buttonsDisabled.value = true;
  let t = setTimeout(() => {
    buttonsDisabled.value = false;
    clearTimeout(t);
  }, 1000);
}

//progress indicator
const progress = computed(() => (store.index + 1) + "/" + store.items.length);

//mic loudness meter
const loudness = ref(0)
const meter = new Tone.Meter();
meter.normalRange = true;
const mic = new Tone.UserMedia();
let micInterval;
onMounted(()=>{
  mic.open();
  mic.connect(meter);
  micInterval = setInterval(() => {
  let meterValue = meter.getValue();
  let logMeter = 1-(Math.log10(meterValue)/Math.log10(0.0001));
  loudness.value = 100 - (Math.round(logMeter * 100))
  }, 100);
})
onUnmounted(()=>{
  clearInterval(micInterval);
})




</script>
