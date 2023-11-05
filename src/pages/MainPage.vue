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
          @export="onExportProfile"
          @delete="onDeleteProfile"
        />
      </q-item>
    </q-list>
    <q-footer class="q-pa-sm" :style="footerStyle">
      <div class="column">
        <div class="row justify-end">
          <q-btn
            round
            color="primary"
            icon="import_export"
            size="md"
            class="q-mr-sm"
            @click="onImportProfile"
          >
            <q-tooltip anchor="top left" self="top middle">
              <span style="font-size: small">Click to import a profile</span>
            </q-tooltip>
          </q-btn>
          <q-btn
            round
            color="primary"
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
    <q-file
      ref="filePickerRef"
      style="display: none"
      :model-value="undefined"
      @update:model-value="onImportedProfile"
    ></q-file>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QFile, useQuasar } from 'quasar';
import { ConnectRequest } from '@webmesh/api/ts/v1/app_pb';
import { useClientStore } from '../stores/client';
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
    const client = useClientStore();
    const profiles = useProfileStore();
    const filePickerRef = ref<QFile | null>(null);

    const onAddProfile = () => {
      q.dialog({
        component: ConnectionProfileEditor,
      }).onOk((profile: ConnectionProfile) => {
        profiles.put(profile);
      });
    };

    const onImportProfile = () => {
      filePickerRef.value?.pickFiles();
    };

    const onImportedProfile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const json = reader.result as string;
        const profile = ConnectRequest.fromJsonString(json);
        profiles.put({ ...profile } as ConnectionProfile);
      };
      reader.readAsText(file);
    };

    const onEditProfile = (profile: ConnectionProfile) => {
      q.dialog({
        component: ConnectionProfileEditor,
        componentProps: { current: profile },
      }).onOk((profile: ConnectionProfile) => {
        profiles.put(profile);
      });
    };

    const onExportProfile = (profile: ConnectionProfile) => {
      const exported = new ConnectRequest(profile).toJsonString();
      const a = document.createElement('a');
      a.className = 'hidden';
      document.body.appendChild(a);
      const blob = new Blob([exported], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${profile.id}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const onDeleteProfile = (profile: ConnectionProfile) => {
      q.dialog({
        title: 'Delete Profile',
        message: `Are you sure you want to delete the profile ${profile.id}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        profiles.delete(profile);
        client.drop(profile.id).catch((err: Error) => {
          console.log('Error communicating with daemon', err);
          q.notify({
            type: 'negative',
            message: 'Error dropping storage for profile',
          });
        });
      });
    };

    return {
      profiles,
      filePickerRef,
      onAddProfile,
      onImportProfile,
      onImportedProfile,
      onEditProfile,
      onExportProfile,
      onDeleteProfile,
    };
  },
});
</script>
