<template>
  <q-card flat bordered class="profile-card">
    <q-item>
      <q-item-section avatar>
        <q-toggle
          toggle-indeterminate
          v-model="connected"
          :disable="connected === null"
          :icon="connectedIcon"
          @update:model-value="onClickConnectSwitch"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ profile.id }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <div class="row justify-end">
          <q-btn
            flat
            round
            color="positive"
            icon="edit"
            :disable="connected === null || connected === true"
            @click="$emit('edit', profile)"
          >
            <q-tooltip anchor="bottom left" self="top middle">
              <span style="font-size: small">Edit</span>
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            color="info"
            icon="file_download"
            @click="$emit('export', profile)"
          >
            <q-tooltip anchor="bottom left" self="top middle">
              <span style="font-size: small">Export</span>
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            color="negative"
            icon="delete"
            :disable="connected === true"
            @click="$emit('delete', profile)"
          >
            <q-tooltip anchor="bottom left" self="top middle">
              <span style="font-size: small">Remove</span>
            </q-tooltip>
          </q-btn>
        </div>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-card-section horizontal class="justify-start" v-if="connected">
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
  ConnectRequest,
  DisconnectRequest,
  ConnectionStatus,
  DaemonConnStatus,
} from '@webmesh/api/ts/v1/app_pb';
import { ConnectionProfile } from '../stores/profiles';
import { useClientStore } from '../stores/client';

export default defineComponent({
  name: 'ConnectionProfileView',
  components: {},
  emits: ['edit', 'delete', 'export'],
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

    const handleDaemonError = (err: Error, msg: string) => {
      console.log('Error communicating with daemon', err);
      q.notify({
        type: 'negative',
        message: msg,
      });
    };

    const getConnectionStatus = (): Promise<boolean | null> => {
      return new Promise((resolve) => {
        client
          .status(props.profile.id)
          .then((status: ConnectionStatus) => {
            switch (status.connectionStatus) {
              case DaemonConnStatus.DISCONNECTED:
                resolve(false);
                break;
              case DaemonConnStatus.CONNECTED:
                resolve(true);
                break;
              case DaemonConnStatus.CONNECTING:
                resolve(null);
                break;
            }
          })
          .catch((err: Error) => {
            handleDaemonError(err, 'Error communicating with daemon');
            resolve(false);
          });
      });
    };

    const onClickConnectSwitch = (newValue: boolean | null) => {
      switch (newValue) {
        case false:
          // We are switching to disconnected from connected
          console.log('Disconnecting from profile', props.profile.id);
          connected.value = null;
          const disconnectRequest = new DisconnectRequest({
            id: props.profile.id,
          });
          client.daemon
            .disconnect(disconnectRequest)
            .catch((err: Error) => {
              handleDaemonError(err, 'Error disconnecting from profile');
            })
            .finally(() => {
              connected.value = false;
            });
          break;
        case null:
          // We are switching to connecting from disconnected
          console.log('Connecting to profile', props.profile.id);
          connected.value = null;
          const connectRequest = new ConnectRequest(props.profile);
          client.daemon
            .connect(connectRequest)
            .then(() => {
              connected.value = true;
            })
            .catch((err: Error) => {
              handleDaemonError(err, 'Error connecting to profile');
              connected.value = false;
            });
          break;
        case true:
          // This should never happen
          console.log('Switching connection status is disabled');
          break;
      }
    };

    getConnectionStatus().then((status) => {
      connected.value = status;
    });

    return { connected, onClickConnectSwitch };
  },
});
</script>
