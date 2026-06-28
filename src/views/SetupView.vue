<template>
  <v-container fluid v-if="state == 'ready'">
    <div class="d-flex"><h2>Hub & Spoke Recorder</h2> <div class="ml-auto text-medium-emphasis text-subtitle-2">version 1.5</div></div>
    <div class="d-flex">
      <div class="d-flex flex-column mr-4" style="min-width: 260px;">
        <div class="elevation-1 mb-4">
          <v-toolbar title="1. Save Folder" color="secondary" density="compact"></v-toolbar>
          <div class="pa-2 text-center">
            <v-btn @click="selectSaveFolder" :disabled="disableFileButton">Select Save Folder</v-btn>
            <p v-if="store.directoryHandle" class="mt-2">Folder selected: <strong>{{store.directoryHandle.name}}</strong></p>
          </div>
        </div>

        <div class="elevation-2 mb-4">
          <v-toolbar title="2. Participant" color="secondary" density="compact"></v-toolbar>
          <v-form class="pa-2">
            <v-text-field v-model="store.pid" density="compact" placeholder="Participant ID"></v-text-field>
            <v-radio-group v-model="store.gender">
              <v-radio value="M" label="Male"></v-radio>
              <v-radio value="F" label="Female"></v-radio>
              <v-radio value="X" label="Other"></v-radio>
              <v-radio value="P" label="Prefer not to answer"></v-radio>
            </v-radio-group>
            <v-select v-if="languages" density="compact" label="L1 Language" :items="languages" v-model="store.l1"
              item-title="language" item-value="languageCode"></v-select>
          </v-form>
        </div>
        <div class="elevation-1 mb-4">
          <v-toolbar title="3. Session Language" color="secondary" density="compact"></v-toolbar>
          <v-form class="pa-2">
            <v-select @update:model-value="taskLanguageSelected" v-if="languages" density="compact"
                label="Task Language" :items="languages" v-model="store.selectedLanguage"
                item-title="language" return-object></v-select>
          </v-form>
        </div>
        
        <div class="elevation-1 mb-4">
          <v-toolbar title="4. Task Type" color="secondary" density="compact"></v-toolbar>
          <v-form class="pa-2">
            <v-select @update:model-value="taskSelected" v-if="tasks" density="compact" label="Task Type" :items="tasks"
              v-model="store.selectedTask" item-title="taskName" return-object hide-details></v-select>
            <v-checkbox v-if="itemsHavePinyin" label="Show Pinyin" hide-details v-model="store.showPinyin"></v-checkbox>  
          </v-form>
        </div>

        <v-btn color="primary" @click="startClicked">Start <v-icon>chevron_right</v-icon></v-btn>
      </div>
      <div class="elevation-2 mr-2" style="width:100%">
        <v-toolbar title="Preview" color="blue-grey-darken-1" density="compact"></v-toolbar>

        <!-- text based items-->
        <ul class="ml-8 mt-2 mb-2 mr-2" v-if="store.items != null && store.selectedTask.type == 'sentence'">
          <li :class="item.font == 'GRF Chinese Font' ? 'traditional-chinese' : ''" v-for="(item, key) in store.items" :key="key">
            <!-- prompt sentence -->
            {{ item.sentence }} 
            <!-- if pinyin exists, display it in the preview-->
            <span v-if="item.pinyin && store.showPinyin == true"> / {{ item.pinyin.join(" ") }}</span>
          </li>
        </ul>

        <!-- North Wind Sun screenshot -->
        <div v-if="store.items != null && store.selectedTask.type == 'passage'">
          <v-img width="100%" :src="'data/materials/nwsImages/' + (store.showPinyin && store.items[0].pinyin ? store.items[0].pinyin : store.items[0].file)">
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
              </div>
            </template>
          </v-img>
        </div>

        <!-- Story pictures -->
        <div v-if="store.items != null && store.selectedTask.type == 'picture'">
          <v-img height="90vh" :src="'data/materials/storyImages/' + store.items[0].file">
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
              </div>
            </template>
          </v-img>
        </div>

        <!-- Q&A  items-->
        <ul class="ml-8 mt-2 mb-2 mr-2" v-if="store.items != null && store.selectedTask.type == 'series'">
          <li :class="item.font == 'GRF Chinese Font' ? 'traditional-chinese' : ''" v-for="(item, key) in store.items[0].sentence"
            :key="key">{{ item }}</li>
        </ul>
      </div>
    </div>
    <v-dialog v-model="confirmFilenameDialog" max-width="400px">
      <v-toolbar title="Task Filename" color="secondary" density="compact"></v-toolbar>
      <v-card>
        <v-card-text>
          <p class="text-center">{{ store.filename }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="outlined" @click="confirmFilenameDialog = false" color="warning">Cancel
            <v-icon>cancel</v-icon></v-btn>
          <v-btn variant="outlined" @click="toRecorder" color="primary">Start <v-icon>chevron_right</v-icon></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-container v-else>
    <p class="text-center">Loading... Please wait</p>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from "@/stores/useStore";
import { useRouter, useRoute } from 'vue-router';

const store = useStore();
const router = useRouter();
const route = useRoute();
const tasks = ref(null);
const languages = ref(null);
const allItems = ref(null);
const state = ref("loading"); //loading, ready

onMounted(async () => {
  state.value = "loading";

  const tasksFetch = await fetch("data/materials/tasks.json");
  tasks.value = await tasksFetch.json();

  const languageFetch = await fetch("data/languages/languages.json");
  languages.value = await languageFetch.json();

  if (store.selectedTask != null) {
    getAllItems(store.selectedTask.file);
  }

  //set parameters based route queries
  if(route.query.pid){
    store.pid = route.query.pid
  }
  if(route.query.gender){
    if(route.query.gender == 1){
      store.gender = "M";
    }else if(route.query.gender == 2){
      store.gender = "F";
    }else if(route.query.gender == 3){
      store.gender = "X";
    }else if(route.query.gender == 4){
      store.gender = "P";
    }
    
  }
  if(route.query.l1){
    store.l1 = route.query.l1
  }  

  state.value = "ready";
})

//when a task is selected
const taskSelected = async (selectedTask) => {
  await getAllItems(selectedTask.file);
  if (store.selectedLanguage != null) {
    getLanguageSpecificItems(store.selectedLanguage.languageCode);
  }
}

async function getAllItems(file) {
  const allItemsFetch = await fetch("data/materials/" + file)
  allItems.value = await allItemsFetch.json();
}

const taskLanguageSelected = async (selectedLanguage) => {
  if (allItems.value != null) {
    getLanguageSpecificItems(selectedLanguage.languageCode);
  }
}

async function getLanguageSpecificItems(languageCode) {
  if (store.selectedTask.type == "picture") {
    store.items = allItems.value.filter((item) => item.taskName == store.selectedTask.taskName);
  } else {
    store.items = allItems.value.filter((item) => item.taskLangCode == languageCode);
    store.items.sort((a,b)=>a.order - b.order)
    console.log(store.items);
  }
}

const itemsHavePinyin = computed(()=>{
  if(store.items!=null && store.items.length>0 && store.items[0].pinyin!=null){
    return true;
    /* if(store.items[0].pinyin!=null || store.items[0].file == "NWS_CMN.jpg"){
      return true;
    } else {
      return false;
    } */
  } else {
    return false;
  }
})

/*
function filterLanguages() {
  //filter languages based on availabilty
  if (store.selectedTask == null || allItems.value == null) {
    return languages.value;
  }

  //return all languages if the task type is ST1/2/3/4
  if (store.selectedTask != null && store.selectedTask.type == "picture") {
    return languages.value;
  }

  //reduce all allItems down by unique langauges
  const uniqueLanguageallItems = allItems.value.filter((item, index, self) => {
    return index === self.findIndex((t) => t.taskLangCode === item.taskLangCode)
  })
  let uniqueLanguages = [];
  for (let uli of uniqueLanguageallItems) {
    uniqueLanguages.push(uli.taskLangCode);
  }

  //const availableLanguages = ref(null);
  const availableLanguages = languages.value.filter((language) => {
    return uniqueLanguages.includes(language.languageCode)
  })

  return (availableLanguages)
}
*/

const startClicked = async () => {
  //validation
  if(store.pid == null || store.gender==null || store.l1 ==null || store.selectedTask==null | store.selectedLanguage==null){
    alert("missing fields");
  } else if((/^\d\d\d$/).test(store.pid) == false) {
    alert("pid must be three digits");
  } else {
    if(store.checkFileSupport() == true && store.directoryHandle == null){
      alert("missing fields");
    } else {
      await generateFilename();
    }
  }
}


const confirmFilenameDialog = ref(false);
async function generateFilename(){
  store.filename = "HNS_" + store.pid + "_" + store.gender + "_" + store.l1 + "_" + store.selectedLanguage.languageCode + "_" + store.items[0].taskCode;

  //check if that filename exists in the target folder
  if(store.checkFileSupport() == true && await checkFolderForExistingFile(store.filename + ".wav") == true){
    alert("Folder has a previous recording " + store.filename + ". You might need to select a different pid, task or create a new empty target folder.");
  } else {
    confirmFilenameDialog.value = true;
  }
}

const toRecorder = () => {
  //resets index
  store.index = 0;
  router.push("/recorder");
}


const disableFileButton = computed(()=>!store.checkFileSupport());


const selectSaveFolder = async () => {
  try {
    store.directoryHandle = await window.showDirectoryPicker();
    if(await checkFolderForExistingWavFiles() == true && confirm("Folder has existing wav files. Continue?") == false){
        store.directoryHandle = null;
        return;
    }
    
    const fileHandle = await store.directoryHandle.getFileHandle('metadata.txt', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(new Date().toLocaleString());
    await writable.close();
    console.log('File saved successfully!');
    
  } catch (err) {
    console.error('Error saving file:', err);
  }
}
  
async function checkFolderForExistingWavFiles(){
  let foundFiles = false;
  for await (const entry of store.directoryHandle.values()) {
    if((/\.wav$/).test(entry.name)){
      foundFiles = true;
      break;
    }
  }
  return foundFiles;
}

async function checkFolderForExistingFile(filename){
  console.log("checking files")
  let foundFile = false;
  for await (const entry of store.directoryHandle.values()) {
    if(entry.name == filename){
      foundFile = true;
      break;
    }
  }
  return foundFile;
}

</script>



<style scoped>
.v-list-item {
  border-bottom: 1px solid gainsboro;
}
</style>