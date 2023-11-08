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
    <q-item v-if="connected" class="row">
      <q-expansion-item
        icon="info"
        label="Connection Info"
        class="row"
        dense
        :default-open="false"
      >
        <div class="q-px-md">
          <div>
            <strong class="q-px-sm">Node FQDN:</strong>
            {{ connectionStatus.node?.id }}.{{ connectionDetails.meshDomain }}.
          </div>
          <div>
            <strong class="q-px-sm">IPv4 Address:</strong>
            {{ connectionDetails.ipv4Address }}
            <strong class="q-px-sm">IPv6 Address:</strong>
            {{ connectionDetails.ipv6Address }}
          </div>
          <div>
            <strong class="q-px-sm">IPv4 Network:</strong>
            {{ connectionDetails.ipv4Network }}
            <strong class="q-px-sm">IPv6 Network:</strong>
            {{ connectionDetails.ipv6Network }}
          </div>
          <div>
            <strong class="q-px-sm">Total Transmit:</strong>
            {{ interfaceMetrics.totalTransmitBytes }}
            <strong class="q-px-sm">Total Receive:</strong>
            {{ interfaceMetrics.totalReceiveBytes }}
          </div>
        </div>
      </q-expansion-item>
    </q-item>
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
  ConnectResponse,
  DisconnectRequest,
  ConnectionStatus,
  DaemonConnStatus,
} from '@webmesh/api/ts/v1/app_pb';
import { InterfaceMetrics } from '@webmesh/api/ts/v1/node_pb';
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
    const connectionDetails = ref<ConnectResponse>(new ConnectResponse());
    const connectionStatus = ref<ConnectionStatus>(new ConnectionStatus());
    const interfaceMetrics = ref<InterfaceMetrics>(new InterfaceMetrics());

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

    let statusUnsubscribe: NodeJS.Timeout;

    const onClickConnectSwitch = (newValue: boolean | null) => {
      switch (newValue) {
        case false:
          // We are switching to disconnected from connected
          console.log('Disconnecting from profile', props.profile.id);
          if (statusUnsubscribe) {
            clearInterval(statusUnsubscribe);
          }
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
            .then((res: ConnectResponse) => {
              connectionDetails.value = res;
              connected.value = true;
              client
                .status(props.profile.id)
                .then((status) => {
                  connectionStatus.value = status;
                })
                .catch((err: Error) => {
                  handleDaemonError(err, 'Error getting connection status');
                });
              statusUnsubscribe = setInterval(() => {
                client
                  .metrics(props.profile.id)
                  .then((metrics: InterfaceMetrics) => {
                    interfaceMetrics.value = metrics;
                  })
                  .catch((err: Error) => {
                    handleDaemonError(err, 'Error getting interface metrics');
                  });
              }, 3000);
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

    return {
      connected,
      connectionDetails,
      connectionStatus,
      interfaceMetrics,
      onClickConnectSwitch,
    };
  },
});
</script>
