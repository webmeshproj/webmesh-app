<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin q-pa-md">
      <q-card-section v-if="loading">
        <q-skeleton type="text" width="50%" class="text-h6" />
        <q-skeleton type="text" class="text-subtitle1" />
        <q-skeleton type="text" width="50%" class="text-subtitle1" />
        <q-skeleton type="text" width="50%" class="text-caption" />
        <q-skeleton type="text" class="text-caption" />
        <q-skeleton type="text" width="50%" class="text-caption" />
      </q-card-section>
      <q-card-section class="row" v-if="!loading">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <q-icon name="info" size="lg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-h6">Daemon Info</q-item-label>
          </q-item-section>
        </q-item>
        <div class="col-12 text-subtitle1">{{ status.description }}</div>
        <div class="col-12 text-subtitle1">Version: {{ status.version }}</div>
        <div class="q-mt-md col-12 text-caption">
          Commit: {{ status.gitCommit }}
        </div>
        <div class="col-12 text-caption">
          Build Date: {{ status.buildDate }}
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="OK" dense flat @click="onDialogOK" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar, useDialogPluginComponent } from 'quasar';
import { DaemonStatus, useWebmesh } from '@webmeshproject/vue';
import { useDaemon } from 'src/stores/daemon';

export default defineComponent({
  name: 'DaemonInfoDialog',
  emits: [...useDialogPluginComponent.emits],
  setup() {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const loading = ref(true);
    const status = ref(new DaemonStatus());
    const daemon = useDaemon();
    const { daemonStatus } = useWebmesh(daemon.options);
    const q = useQuasar();
    onMounted(() => {
      daemonStatus()
        .then((s) => {
          status.value = s;
        })
        .catch((e) => {
          q.notify({
            message: 'Failed to get daemon status: ' + e,
            type: 'negative',
          });
        })
        .finally(() => {
          loading.value = false;
        });
    });
    return {
      loading,
      status,
      dialogRef,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    };
  },
});
</script>
