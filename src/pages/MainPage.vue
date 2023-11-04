<template>
  <q-page class="q-pa-md row justify-start">
    <q-list class="col-12">
      <q-item
        v-for="profile in profiles.profiles"
        :key="profile.id"
        class="q-pa-sm"
      >
        <connection-profile-view
          :profile="profile"
          @edit="onEditProfile"
          @delete="onDeleteProfile"
        />
      </q-item>
    </q-list>
    <q-footer class="q-pa-sm" :style="footerStyle">
      <div class="column">
        <div class="col self-end">
          <q-btn
            round
            color="secondary"
            icon="add"
            size="md"
            @click="onAddProfile"
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
  computed: {
    footerStyle(): string {
      return this.$q.dark.isActive
        ? 'background-color: #1d1d1d'
        : 'background-color: lightgrey';
    },
  },
  setup() {
    const q = useQuasar();
    const profiles = useProfileStore();

    const onAddProfile = () => {
      q.dialog({
        component: ConnectionProfileEditor,
      }).onOk((profile: ConnectionProfile) => {
        profiles.put(profile);
      });
    };

    const onEditProfile = (profile: ConnectionProfile) => {
      q.dialog({
        component: ConnectionProfileEditor,
        componentProps: { current: profile },
      }).onOk((profile: ConnectionProfile) => {
        profiles.put(profile);
      });
    };

    const onDeleteProfile = (profile: ConnectionProfile) => {
      q.dialog({
        title: 'Delete Profile',
        message: `Are you sure you want to delete the profile ${profile.id}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        profiles.delete(profile);
      });
    };

    return {
      profiles,
      onAddProfile,
      onEditProfile,
      onDeleteProfile,
    };
  },
});
</script>
