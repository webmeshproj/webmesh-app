<template>
  <q-layout view="hHh lpR fFf">
    <div class="row">
      <q-header style="max-height: 15%" elevated class="bg-primary text-white">
        <q-toolbar>
          <q-toolbar-title>
            <q-avatar>
              <img src="../assets/webmesh-logo.png" />
            </q-avatar>
            Webmesh
          </q-toolbar-title>
          <div class="row col-8 justify-around">
            <dark-mode-switch />
            <daemon-address-input />
          </div>
        </q-toolbar>
      </q-header>
    </div>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import DaemonAddressInput from '../components/DaemonAddressInput.vue';
import DarkModeSwitch from '../components/DarkModeSwitch.vue';

export default defineComponent({
  name: 'MainLayout',
  components: { DaemonAddressInput, DarkModeSwitch },
  setup() {
    return {};
  },
});
</script>
