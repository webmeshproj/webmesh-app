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
    </q-item>
    <q-separator />
    <q-card-section horizontal class="justify-between">
      <q-card-section class="col-10">
        <!-- Connection information will go here -->
      </q-card-section>
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
  ConnectRequest,
  DisconnectRequest,
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
          .status(props.profile.id)
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
              handleDaemonError(err);
            })
            .finally(() => {
              connected.value = false;
            });
          break;
        case null:
          // We are switchign to connecting from disconnected
          console.log('Connecting to profile', props.profile.id);
          connected.value = null;
          const connectRequest = new ConnectRequest(props.profile);
          client.daemon
            .connect(connectRequest)
            .then(() => {
              connected.value = true;
            })
            .catch((err: Error) => {
              handleDaemonError(err);
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
