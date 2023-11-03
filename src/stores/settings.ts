import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { PromiseClient, createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { AppDaemon } from '@webmesh/api/ts/v1/app_connect';
import { MeshNodes } from '@webmesh/api/ts/utils/rpcdb';

export const DefaultDaemonAddress = '127.0.0.1:58080';

export const useSettingsStore = defineStore('settings', {
  persist:
    Platform.is.electron ||
    Platform.is.nativeMobile ||
    process.env.PERSIST_DATA === 'true',

  state: () => ({
    daemonAddr: DefaultDaemonAddress,
  }),

  getters: {
    daemonAddress(state): string {
      return state.daemonAddr;
    },
  },

  actions: {
    setDaemonAddress(addr: string) {
      this.daemonAddr = addr;
    },
    newDaemonClient(): PromiseClient<typeof AppDaemon> {
      return createPromiseClient(
        AppDaemon,
        createGrpcWebTransport({
          baseUrl: 'http://' + this.daemonAddress,
        })
      );
    },
    newPeersClient(profile: string): MeshNodes {
      return new MeshNodes(this.newDaemonClient(), profile);
    },
  },
});
