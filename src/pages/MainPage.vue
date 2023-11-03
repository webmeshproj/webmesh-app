<template>
  <q-page class="q-pa-md row justify-start">
    <connection-profile-view
      v-for="profile in profiles.profiles"
      :key="profile.name"
      :profile="profile"
      @on-edit="onEditProfileClick"
      @on-delete="onDeleteProfileClick"
    />
    <q-footer class="q-pa-lg" style="background-color: white">
      <div class="column">
        <div class="col self-end">
          <q-btn
            round
            color="secondary"
            icon="add"
            size="lg"
            @click="onAddProfileClick"
          >
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
import { useQuasar } from 'quasar';
import { ConnectionProfile, useProfileStore } from '../stores/profiles';

import ConnectionProfileEditor from '../components/ConnectionProfileEditor.vue';
import ConnectionProfileView from '../components/ConnectionProfileView.vue';

export default defineComponent({
  name: 'MainPage',
  components: { ConnectionProfileView },
  setup() {
    const q = useQuasar();
    const profiles = useProfileStore();

    const onAddProfileClick = () => {
      q.dialog({
        component: ConnectionProfileEditor,
      }).onOk((profile: ConnectionProfile) => {
        profiles.put(profile);
      });
    };

    const onEditProfileClick = (profile: ConnectionProfile) => {
      q.dialog({
        component: ConnectionProfileEditor,
        componentProps: { profile },
      }).onOk((profile: ConnectionProfile) => {
        profiles.put(profile);
      });
    };

    const onDeleteProfileClick = (profile: ConnectionProfile) => {
      q.dialog({
        title: 'Delete Profile',
        message: `Are you sure you want to delete the profile ${profile.name}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        profiles.delete(profile);
      });
    };

    return {
      profiles,
      onAddProfileClick,
      onEditProfileClick,
      onDeleteProfileClick,
    };
  },
});
</script>
