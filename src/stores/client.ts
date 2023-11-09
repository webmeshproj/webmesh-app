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
  ConnectRequest,
  ConnectResponse,
  ConnectionStatusResponse,
  ConnectionStatus,
  DaemonStatus,
  MetricsResponse,
} from '@webmesh/api/ts/v1/app_pb';
import { InterfaceMetrics } from '@webmesh/api/ts/v1/node_pb';
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
    metrics(): (profile: string) => Promise<InterfaceMetrics> {
      return (profile) => {
        if (!profile) {
          return Promise.reject(new Error('No profile specified'));
        }
        return new Promise((resolve, reject) => {
          this.daemon
            .metrics({ ids: [profile] })
            .then((res: MetricsResponse) => resolve(res.interfaces[profile]))
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
    drop(profile: string): Promise<void> {
      if (!profile) {
        return Promise.reject(new Error('No profile specified'));
      }
      return new Promise((resolve, reject) => {
        this.daemon
          .drop({ id: profile })
          .then(() => resolve())
          .catch((err: Error) => reject(err));
      });
    },
    connect(req: ConnectRequest): Promise<ConnectResponse> {
      return new Promise((resolve, reject) => {
        this.daemon
          .connect(req)
          .then((res: ConnectResponse) => resolve(res))
          .catch((err: Error) => reject(err));
      });
    },
    disconnect(profile: string): Promise<void> {
      if (!profile) {
        return Promise.reject(new Error('No profile specified'));
      }
      return new Promise((resolve, reject) => {
        this.daemon
          .disconnect({ id: profile })
          .then(() => resolve())
          .catch((err: Error) => reject(err));
      });
    },
  },
});
