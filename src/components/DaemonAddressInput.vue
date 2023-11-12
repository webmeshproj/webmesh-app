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
import { Defaults } from '@webmeshproject/api/utils/networks';
import { useDaemon } from 'src/stores/daemon';

export default defineComponent({
  name: 'DaemonAddressInput',
  setup() {
    const daemon = useDaemon();
    const daemonAddress = ref<string>(daemon.address);
    const onUpdate = () => {
      daemon.setAddress(daemonAddress.value);
    };
    const onReset = () => {
      daemonAddress.value = Defaults.daemonAddress;
      onUpdate();
    };
    return {
      daemonAddress,
      onUpdate,
      onReset,
    };
  },
});
</script>
