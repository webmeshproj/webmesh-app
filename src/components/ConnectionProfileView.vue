<template>
  <q-card flat bordered class="profile-card">
    <q-item>
      <q-item-section avatar>
        <q-toggle
          toggle-indeterminate
          v-model="connected"
          :disable="connected === null"
          :icon="connectedIcon"
          @click="onConnectSwitchClick"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ profile.name }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-card-section horizontal class="justify-between">
      <q-card-section class="col-10"> </q-card-section>
      <q-separator vertical />
      <q-card-actions vertical class="col-2 justify-around">
        <q-btn
          flat
          round
          color="positive"
          icon="edit"
          @click="$emit('edit', profile)"
        >
          <q-tooltip anchor="bottom right" self="top middle">
            <span style="font-size: small">Edit Profile</span>
          </q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          color="negative"
          icon="delete"
          @click="$emit('delete', profile)"
        >
          <q-tooltip anchor="bottom right" self="top middle">
            <span style="font-size: small">Remove Profile</span>
          </q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>

<style lang="sass" scoped>
.profile-card
  width: 100%
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import {
  ConnectionStatus,
  ConnectionStatus_Status,
} from '@webmesh/api/ts/v1/app_pb';
import { ConnectionProfile } from '../stores/profiles';
import { useClientStore } from '../stores/client';

export default defineComponent({
  name: 'ConnectionProfileView',
  components: {},
  emits: ['edit', 'delete'],
  props: {
    profile: {
      type: Object as () => ConnectionProfile,
      required: true,
    },
  },
  computed: {
    connectedIcon(): string {
      switch (this.connected) {
        case true:
          return 'check_circle';
        case false:
          return 'cancel';
        case null:
          return 'cached';
        default:
          return 'cached';
      }
    },
    connectedColor(): string {
      switch (this.connected) {
        case true:
          return 'positive';
        case false:
          return 'negative';
        case null:
          return 'primary';
        default:
          return 'primary';
      }
    },
  },
  setup(props) {
    const q = useQuasar();
    const client = useClientStore();
    const connected = ref<boolean | null>(false);

    const handleDaemonError = (err: Error) => {
      console.log('Error communicating with daemon', err);
      q.notify({
        type: 'negative',
        message: 'Error communicating with daemon',
      });
    };

    const getConnectionStatus = (): Promise<boolean | null> => {
      return new Promise((resolve) => {
        client
          .status(props.profile.name)
          .then((status: ConnectionStatus) => {
            switch (status.connectionStatus) {
              case ConnectionStatus_Status.DISCONNECTED:
                resolve(false);
                break;
              case ConnectionStatus_Status.CONNECTED:
                resolve(true);
                break;
              case ConnectionStatus_Status.CONNECTING:
                resolve(null);
                break;
            }
          })
          .catch((err: Error) => {
            handleDaemonError(err);
            resolve(false);
          });
      });
    };

    const onConnectSwitchClick = () => {
      connected.value = false;
      return;
    };

    getConnectionStatus().then((status) => {
      connected.value = status;
    });

    return { connected, onConnectSwitchClick };
  },
});
</script>
