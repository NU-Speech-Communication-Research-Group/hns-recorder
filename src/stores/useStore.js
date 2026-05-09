import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useStore = defineStore('store', () => {
  const pid = ref(null);
  const gender = ref(null);
  const l1 = ref(null);
  const selectedTask = ref(null);
  const selectedLanguage = ref(null);
  const filename = ref(null);
  const items = ref(null);  
  const index = ref(0);
  const directoryHandle = ref(null);
  const currentItem = computed(()=>{
    if(index.value == null){
      return null;
    } else {
      return items.value[index.value];
    }
  })
  const incrementIndex = () => {
    index.value +=1;
    if(index.value >= items.value.length){
      return "end";
    }
  }
  const checkFileSupport = () => {
    if ('showDirectoryPicker' in self) {
      return true;
    } else {
      return false;
    }
  }

  return { pid, gender, l1, selectedTask, selectedLanguage, filename, items, index, currentItem, incrementIndex, directoryHandle, checkFileSupport }
})
