<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/webmesh-logo.png" />
          </q-avatar>
          Webmesh
        </q-toolbar-title>
        <q-input
          dark
          borderless
          dense
          label="Daemon Address"
          v-model="daemonAddress"
          class="q-pt-sm"
          :rules="[
            (val) => (val && val.length > 0) || 'Daemon address is required',
          ]"
          @update:model-value="onUpdate"
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="cached"
              @click="
                daemonAddress = DefaultDaemonAddress;
                onUpdate();
              "
            >
              <q-tooltip anchor="bottom left" self="top middle">
                <span style="font-size: small">Reset</span>
              </q-tooltip>
            </q-btn>
          </template>
        </q-input>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { DefaultDaemonAddress, useClientStore } from '../stores/client';

export default defineComponent({
  name: 'MainLayout',
  components: {},
  setup() {
    const clientSettings = useClientStore();
    const daemonAddress = ref<string>(clientSettings.daemonAddress);
    const onUpdate = () => {
      clientSettings.setDaemonAddress(daemonAddress.value);
    };
    return {
      DefaultDaemonAddress,
      daemonAddress,
      onUpdate,
    };
  },
});
</script>
../stores/client
