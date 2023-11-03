<template>
  <q-page class="row items-center justify-evenly"> </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useProfileStore } from '../stores/profiles';

export default defineComponent({
  name: 'IndexPage',
  components: {},
  setup() {
    const profiles = useProfileStore();
    return { profiles };
  },
});
</script>
