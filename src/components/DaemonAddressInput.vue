<template>
  <q-input
    dark
    borderless
    dense
    label="Daemon Address"
    v-model="daemonAddress"
    class="q-pt-sm"
    :rules="[(val) => (val && val.length > 0) || 'Daemon address is required']"
    @update:model-value="onUpdate"
  >
    <template v-slot:append>
      <q-btn round dense flat icon="cached" @click="onReset">
        <q-tooltip anchor="bottom left" self="top middle">
          <span style="font-size: small">Reset</span>
        </q-tooltip>
      </q-btn>
    </template>
  </q-input>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { DefaultDaemonAddress, useClientStore } from '../stores/client';

export default defineComponent({
  name: 'DaemonAddressInput',
  setup() {
    const clientSettings = useClientStore();
    const daemonAddress = ref<string>(clientSettings.daemonAddress);
    const onUpdate = () => {
      clientSettings.setDaemonAddress(daemonAddress.value);
    };
    const onReset = () => {
      daemonAddress.value = DefaultDaemonAddress;
      onUpdate();
    };
    return {
      DefaultDaemonAddress,
      daemonAddress,
      onUpdate,
      onReset,
    };
  },
});
</script>
