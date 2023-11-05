import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import {
  ConnectRequest,
  NetworkAuthMethod,
  MeshConnBootstrap_DefaultNetworkACL as DefaultNetworkACL,
} from '@webmesh/api/ts/v1/app_pb';
import { Feature } from '@webmesh/api/ts/v1/node_pb';
import type { PartialMessage } from '@bufbuild/protobuf';

export type RecursiveRequired<T> = Required<{
  [P in keyof T]: T[P] extends object | undefined
    ? RecursiveRequired<Required<T[P]>>
    : T[P];
}>;

export type ConnectionProfile = RecursiveRequired<
  PartialMessage<ConnectRequest>
>;

export const DefaultAuthMethod = NetworkAuthMethod.NO_AUTH;
export const DefaultMeshDomain = 'webmesh.internal';
export const DefaultMeshIPv4Network = '172.16.0.0/12';
export const DefaultNetworkACLPolicy = DefaultNetworkACL.ACCEPT;
export const DefaultListenAddress = '[::]:8443';
export const DefaultDNSListenUDP = '[::]:53';
export const DefaultDNSListenTCP = '[::]:53';

export function newDefaultConnectionProfile(): ConnectionProfile {
  return {
    id: '',
    authMethod: DefaultAuthMethod,
    authCredentials: {},
    networking: {},
    bootstrap: {
      enabled: false,
      domain: DefaultMeshDomain,
      ipv4Network: DefaultMeshIPv4Network,
      rbacEnabled: false,
      defaultNetworkACL: DefaultNetworkACLPolicy,
    },
    tls: {
      enabled: false,
      skipVerify: false,
      verifyChainOnly: false,
    },
    services: {
      enabled: false,
      listenAddress: DefaultListenAddress,
      features: [] as Feature[],
      dns: {
        enabled: false,
        listenUDP: DefaultDNSListenUDP,
        listenTCP: DefaultDNSListenTCP,
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
