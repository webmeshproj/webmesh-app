import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import {
  Transport,
  PromiseClient,
  createPromiseClient,
} from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { AppDaemon } from '@webmesh/api/ts/v1/app_connect';
import { StatusResponse, ConnectionStatus } from '@webmesh/api/ts/v1/app_pb';
import { MeshNodes } from '@webmesh/api/ts/utils/rpcdb';

export const DefaultDaemonAddress = '127.0.0.1:58080';

export const useClientStore = defineStore('client', {
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
    transport(state): Transport {
      return createGrpcWebTransport({
        baseUrl: 'http://' + state.daemonAddr,
      });
    },
    daemon(): PromiseClient<typeof AppDaemon> {
      return createPromiseClient(AppDaemon, this.transport);
    },
    peers(): (profile: string) => MeshNodes {
      return (profile) => new MeshNodes(this.daemon, profile);
    },
    status(): (profile: string) => Promise<ConnectionStatus> {
      return (profile) => {
        return new Promise((resolve, reject) => {
          this.daemon
            .status({ ids: [profile] })
            .then((res: StatusResponse) => resolve(res.statuses[profile]))
            .catch((err: Error) => reject(err));
        });
      };
    },
  },

  actions: {
    setDaemonAddress(addr: string) {
      this.daemonAddr = addr;
    },
  },
});
