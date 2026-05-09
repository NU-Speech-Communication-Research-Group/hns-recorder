<script setup>
import { RouterView } from 'vue-router'

</script>

<template>
  <v-app>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>


<style>
@font-face {
  font-family: 'traditionalChineseFont';
  src: url('grf_chi.ttf') format('truetype');
}

.traditional-chinese {
  font-family: 'traditionalChineseFont', sans-serif;
}
</style>
