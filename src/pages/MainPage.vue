<template>
  <q-page class="q-pa-md row justify-start">
    <q-list class="col-12">
      <q-item
        v-for="profile in profiles.profiles"
        :key="profile.name"
        class="q-pa-sm"
      >
        <connection-profile-view
          :profile="profile"
          @on-edit="onEditProfileClick"
          @on-delete="onDeleteProfileClick"
        />
      </q-item>
    </q-list>
    <q-footer class="q-pa-lg" :style="footerStyle">
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
