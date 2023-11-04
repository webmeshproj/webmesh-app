import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import {
  ConnectRequest,
  NetworkAuthMethod,
  MeshConnBootstrap_DefaultNetworkACL as DefaultNetworkACL,
} from '@webmesh/api/ts/v1/app_pb';
import { Feature } from '@webmesh/api/ts/v1/node_pb';
import type { PartialMessage } from '@bufbuild/protobuf';

type RecursiveRequired<T> = Required<{
  [P in keyof T]: T[P] extends object | undefined
    ? RecursiveRequired<Required<T[P]>>
    : T[P];
}>;

export type ConnectionProfile = RecursiveRequired<
  PartialMessage<ConnectRequest>
>;

export function newDefaultConnectionProfile(): ConnectionProfile {
  return {
    id: '',
    authMethod: NetworkAuthMethod.NO_AUTH,
    authCredentials: {},
    networking: {},
    bootstrap: {
      enabled: false,
      domain: 'webmesh.internal',
      ipv4Network: '172.16.0.0./12',
      rbacEnabled: false,
      defaultNetworkACL: DefaultNetworkACL.ACCEPT,
    },
    tls: {
      enabled: false,
      skipVerify: false,
      verifyChainOnly: false,
    },
    services: {
      enabled: false,
      listenAddress: '[::]:8443',
      features: [] as Feature[],
      dns: {
        enabled: false,
        listenUDP: '[::]:53',
        listenTCP: '[::]:53',
      },
    },
  } as ConnectionProfile;
}

export const useProfileStore = defineStore('profiles', {
  persist:
    Platform.is.electron ||
    Platform.is.nativeMobile ||
    process.env.PERSIST_DATA === 'true',

  state: () => ({
    connectionProfiles: [] as ConnectionProfile[],
  }),

  getters: {
    profiles(state): ConnectionProfile[] {
      return state.connectionProfiles;
    },
    byName(state): (name: string) => ConnectionProfile | undefined {
      return (name: string) =>
        state.connectionProfiles.find((p) => p.id === name);
    },
  },

  actions: {
    put(profile: ConnectionProfile) {
      if (!profile.id) {
        throw new Error('Profile must have an ID');
      }
      const existing = this.byName(profile.id);
      if (existing) {
        const index = this.profiles.indexOf(existing);
        if (index > -1) {
          this.profiles.splice(index, 1, profile);
        }
      } else {
        this.profiles.push(profile);
      }
    },
    delete(profile: ConnectionProfile) {
      const index = this.profiles.indexOf(profile);
      if (index > -1) {
        this.profiles.splice(index, 1);
      }
    },
    deleteByName(name: string) {
      const profile = this.byName(name);
      if (profile) {
        this.delete(profile);
      }
    },
  },
});
