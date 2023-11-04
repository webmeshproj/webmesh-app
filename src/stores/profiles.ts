import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import {
  ConnectRequest,
  NetworkAuthMethod,
  ConnectRequest_AddrType,
  MeshConnNetworking,
  MeshConnServices,
  MeshConnBootstrap,
  MeshConnTLS,
} from '@webmesh/api/ts/v1/app_pb';
import type { PartialMessage } from '@bufbuild/protobuf';

export type ConnectionProfile = PartialMessage<ConnectRequest>;

// ConnectionProfileSkeleton models the ConnectRequest with all fields
// being required. This is used for passing nested fields to v-model.
export interface ConnectionProfileSkeleton {
  id: string;
  authMethod: NetworkAuthMethod;
  authCredentials: { [key: string]: Uint8Array };
  addrType: ConnectRequest_AddrType;
  addrs: string[];
  networking: PartialMessage<MeshConnNetworking>;
  services: PartialMessage<MeshConnServices>;
  bootstrap: PartialMessage<MeshConnBootstrap>;
  tls: PartialMessage<MeshConnTLS>;
}

export function profileToSkeleton(
  profile: ConnectionProfile | undefined
): ConnectionProfileSkeleton | undefined {
  if (!profile) {
    return undefined;
  }
  return {
    id: profile.id || '',
    authMethod: profile.authMethod || NetworkAuthMethod.NO_AUTH,
    authCredentials: profile.authCredentials || {},
    addrType: profile.addrType || ConnectRequest_AddrType.ADDR,
    addrs: profile.addrs || [],
    networking: profile.networking || {},
    services: profile.services || {},
    bootstrap: profile.bootstrap || {},
    tls: profile.tls || {},
  };
}

export function skeletonToProfile(
  skeleton: ConnectionProfileSkeleton
): ConnectionProfile {
  return {
    id: skeleton.id,
    authMethod: skeleton.authMethod,
    authCredentials: skeleton.authCredentials,
    addrType: skeleton.addrType,
    addrs: skeleton.addrs,
    networking: skeleton.networking,
    services: skeleton.services,
    bootstrap: skeleton.bootstrap,
    tls: skeleton.tls,
  };
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
