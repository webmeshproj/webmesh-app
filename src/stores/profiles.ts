import { defineStore } from 'pinia';
import { ConnectRequest } from '@webmesh/api/ts/v1/app_pb';

export interface ConnectionProfile {
  name: string;
  params: ConnectRequest;
}

export const useProfileStore = defineStore('profile', {
  persist: true,

  state: () => ({
    profiles: [] as ConnectionProfile[],
  }),

  getters: {
    all(state): ConnectionProfile[] {
      return state.profiles;
    },
    byName(state): (name: string) => ConnectionProfile | undefined {
      return (name: string) => state.profiles.find((p) => p.name === name);
    },
  },

  actions: {
    put(profile: ConnectionProfile) {
      const existing = this.byName(profile.name);
      if (existing) {
        const index = this.profiles.indexOf(existing);
        if (index > -1) {
          this.profiles.splice(index, 1, profile);
        }
      } else {
        this.profiles.push(profile);
      }
    },
    remove(profile: ConnectionProfile) {
      const index = this.profiles.indexOf(profile);
      if (index > -1) {
        this.profiles.splice(index, 1);
      }
    },
    removeByName(name: string) {
      const profile = this.byName(name);
      if (profile) {
        this.remove(profile);
      }
    },
  },
});