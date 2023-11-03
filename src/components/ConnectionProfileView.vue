<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ConnectionProfile } from '../stores/profiles';

export default defineComponent({
  name: 'ConnectionProfileView',
  components: {},
  props: {
    profile: {
      type: Object as () => ConnectionProfile,
      required: false,
    },
  },
  setup() {
    return {};
  },
});
</script>
