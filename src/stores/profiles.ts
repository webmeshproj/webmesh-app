import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { ConnectRequest } from '@webmesh/api/ts/v1/app_pb';
import type { PartialMessage } from '@bufbuild/protobuf';

export type ConnectionProfile = Required<PartialMessage<ConnectRequest>>;

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
