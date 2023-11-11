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
          <div class="row col-8 justify-evenly">
            <dark-mode-switch />
            <daemon-address-input />
            <q-btn flat dense icon="info" @click="onClickDaemonInfo">
              <q-tooltip anchor="bottom left" self="top middle">
                <span style="font-size: small">Daemon Info</span>
              </q-tooltip>
            </q-btn>
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
import { useQuasar } from 'quasar';

import DaemonInfoDialog from 'src/components/DaemonInfoDialog.vue';
import DaemonAddressInput from 'src/components/DaemonAddressInput.vue';
import DarkModeSwitch from 'src/components/DarkModeSwitch.vue';

export default defineComponent({
  name: 'MainLayout',
  components: { DaemonAddressInput, DarkModeSwitch },
  setup() {
    const q = useQuasar();
    const onClickDaemonInfo = () => {
      q.dialog({
        component: DaemonInfoDialog,
        componentProps: {},
      });
    };
    return { onClickDaemonInfo };
  },
});
</script>
