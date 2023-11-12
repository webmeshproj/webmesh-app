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
            {{ network?.fqdn }}.
          </div>
          <div>
            <strong class="q-px-sm">IPv4 Address:</strong>
            {{ network?.ipv4Address }}
            <strong class="q-px-sm">IPv6 Address:</strong>
            {{ network?.ipv6Address }}
          </div>
          <div>
            <strong class="q-px-sm">IPv4 Network:</strong>
            {{ network?.ipv4Network }}
            <strong class="q-px-sm">IPv6 Network:</strong>
            {{ network?.ipv6Network }}
          </div>
          <div>
            <strong class="q-px-sm">Total Transmit:</strong>
            {{ humanFileSize(Number(metrics?.totalTransmitBytes)) }}
            <strong class="q-px-sm">Total Receive:</strong>
            {{ humanFileSize(Number(metrics?.totalReceiveBytes)) }}
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
import { defineComponent, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { DaemonConnStatus } from '@webmeshproject/api/v1/app_pb';
import { Network, NetworkParameters } from '@webmeshproject/api/utils/networks';
import { useWebmesh } from '@webmeshproject/vue';
import { useDaemon } from 'src/stores/daemon';

export default defineComponent({
  name: 'ConnectionProfileView',
  components: {},
  emits: ['edit', 'delete', 'export'],
  props: {
    profile: {
      type: Object as () => NetworkParameters,
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
    const daemon = useDaemon();
    const { connect, disconnect, deviceMetrics, getNetwork, error } =
      useWebmesh(daemon.options);
    const metrics = deviceMetrics(props.profile.id, 3000);
    const network = ref<Network | null>(null);
    const connected = ref<boolean | null>(false);

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

    const getConnectionStatus = (): Promise<boolean | null> => {
      return new Promise((resolve) => {
        getNetwork(props.profile.id)
          .then((nw: Network) => {
            switch (nw.status) {
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
          .catch(() => {
            resolve(false);
          });
      });
    };

    const humanFileSize = (size: number): string => {
      if (size === Number(NaN)) return '0 B';
      const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
      return (
        (size / Math.pow(1024, i)).toFixed(2) +
        ' ' +
        ['B', 'kB', 'MB', 'GB', 'TB'][i]
      );
    };

    const onClickConnectSwitch = (newValue: boolean | null) => {
      switch (newValue) {
        case false:
          // We are switching to disconnected from connected
          console.log('Disconnecting from profile', props.profile.id);
          connected.value = null;
          disconnect(props.profile.id)
            .catch((err: Error) => {
              handleDaemonError(err, 'Error disconnecting from profile');
            })
            .finally(() => {
              connected.value = false;
              network.value = null;
            });
          break;
        case null:
          // We are switching to connecting from disconnected
          console.log('Connecting to profile', props.profile.id);
          connected.value = null;
          connect({ id: props.profile.id })
            .then((res: Network) => {
              network.value = res;
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

    return {
      connected,
      network,
      metrics,
      humanFileSize,
      onClickConnectSwitch,
    };
  },
});
</script>
