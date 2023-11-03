<template>
  <q-page class="q-pa-md">
    <q-footer class="q-pa-lg" style="background-color: white">
      <div class="column">
        <div class="col self-end">
          <q-btn round color="secondary" icon="add" size="lg">
            <q-tooltip anchor="top left" self="top middle">
              <span style="font-size: small">Click to add a new profile</span>
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-footer>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useProfileStore } from '../stores/profiles';
// import { ConnectionProfileEditor } from '../components/ConnectionProfileEditor.vue';
// import { ConnectionProfileView } from '../components/ConnectionProfileView.vue';

export default defineComponent({
  name: 'MainPage',
  // components: { ConnectionProfileEditor, ConnectionProfileView },
  setup() {
    const profiles = useProfileStore();
    return { profiles };
  },
});
</script>
