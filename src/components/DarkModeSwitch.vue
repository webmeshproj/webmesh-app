<template>
  <q-toggle
    toggle-indeterminate
    v-model="mode"
    checked-icon="dark_mode"
    unchecked-icon="light_mode"
    indeterminate-icon="auto_mode"
    indeterminate-value="auto"
    @click="onClick"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'DarkModeSwitch',
  setup() {
    const q = useQuasar();
    q.dark.set('auto');
    const mode = ref<boolean | 'auto'>(q.dark.mode);
    const onClick = () => {
      console.log('Setting dark mode to ' + mode.value);
      q.dark.set(mode.value);
    };
    return {
      mode,
      onClick,
    };
  },
});
</script>
