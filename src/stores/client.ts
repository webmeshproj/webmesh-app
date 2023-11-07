import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import {
  Transport,
  PromiseClient,
  createPromiseClient,
} from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { AppDaemon } from '@webmesh/api/ts/v1/app_connect';
import {
  ConnectionStatusResponse,
  ConnectionStatus,
  DaemonStatus,
} from '@webmesh/api/ts/v1/app_pb';
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
    drop(): (profile: string) => Promise<void> {
      return (profile) => {
        if (!profile) {
          return Promise.reject(new Error('No profile specified'));
        }
        return new Promise((resolve, reject) => {
          this.daemon
            .drop({ id: profile })
            .then(() => resolve())
            .catch((err: Error) => reject(err));
        });
      };
    },
    status(): (profile: string | undefined) => Promise<ConnectionStatus> {
      return (profile) => {
        if (!profile) {
          return Promise.reject(new Error('No profile specified'));
        }
        return new Promise((resolve, reject) => {
          this.daemon
            .connectionStatus({ ids: [profile] })
            .then((res: ConnectionStatusResponse) =>
              resolve(res.statuses[profile])
            )
            .catch((err: Error) => reject(err));
        });
      };
    },
    daemonStatus(): Promise<DaemonStatus> {
      return new Promise((resolve, reject) => {
        this.daemon
          .status({})
          .then((res: DaemonStatus) => resolve(res))
          .catch((err: Error) => reject(err));
      });
    },
  },

  actions: {
    setDaemonAddress(addr: string) {
      this.daemonAddr = addr;
    },
  },
});
