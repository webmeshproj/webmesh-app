<template>
  <q-page class="q-pa-md row justify-start">
    <q-list class="col-12">
      <q-item v-if="networks.length === 0">
        <q-item-section>
          <div class="column items-center justify-evenly">
            <div class="text-h6">
              You don't have any profiles configured
              <q-icon name="sentiment_very_dissatisfied" />
            </div>
            <div class="text-subtitle">
              Click the
              <q-icon name="add" />
              or
              <q-icon name="import_export" />
              button below to get started
            </div>
          </div>
        </q-item-section>
      </q-item>
      <q-item v-for="profile in networks" :key="profile.id" class="q-pa-sm">
        <connection-profile-view
          :profile="profile.params"
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
import { defineComponent, ref, watch } from 'vue';
import { QFile, useQuasar } from 'quasar';
import { NetworkParameters } from '@webmeshproject/api/utils/networks';
import { useWebmesh } from '@webmeshproject/vue';
import { useDaemon } from 'src/stores/daemon';

import ConnectionProfileEditor from 'src/components/ConnectionProfileEditor.vue';
import ConnectionProfileView from 'src/components/ConnectionProfileView.vue';

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
    const daemon = useDaemon();
    const { putNetwork, dropNetwork, networks, error } = useWebmesh(
      daemon.options
    );
    const filePickerRef = ref<QFile | null>(null);
    const handleDaemonError = (err: Error, msg: string) => {
      console.log(msg, err);
      q.notify({
        type: 'negative',
        message: msg,
        caption: err.message,
      });
    };

    watch(error, (err) => {
      if (err && err.message) {
        handleDaemonError(err, 'Error communicating with daemon');
      }
    });

    const onImportProfile = () => {
      filePickerRef.value?.pickFiles();
    };

    const onImportedProfile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const json = reader.result as string;
        const profile = JSON.parse(json) as NetworkParameters;
        putNetwork(profile).catch((err: Error) => {
          handleDaemonError(err, 'Error importing profile');
        });
      };
      reader.readAsText(file);
    };

    const onExportProfile = (profile: NetworkParameters) => {
      const exported = JSON.stringify(profile, null, 2);
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

    const onAddProfile = () => {
      q.dialog({
        component: ConnectionProfileEditor,
      }).onOk((profile: NetworkParameters) => {
        putNetwork(profile).catch((err: Error) => {
          handleDaemonError(err, 'Error creating profile');
        });
      });
    };

    const onEditProfile = (profile: NetworkParameters) => {
      q.dialog({
        component: ConnectionProfileEditor,
        componentProps: { current: profile },
      }).onOk((profile: NetworkParameters) => {
        putNetwork(profile).catch((err: Error) => {
          handleDaemonError(err, 'Error updating profile');
        });
      });
    };

    const onDeleteProfile = (profile: NetworkParameters) => {
      q.dialog({
        title: 'Delete Profile',
        message: `Are you sure you want to delete the profile ${profile.id}?`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        dropNetwork(profile.id).catch((err: Error) => {
          console.log('Error communicating with daemon', err);
          q.notify({
            type: 'negative',
            message: 'Error dropping storage for profile',
          });
        });
      });
    };

    return {
      networks,
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
