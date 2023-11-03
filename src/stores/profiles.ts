import { defineStore } from 'pinia';
import { ConnectRequest } from '@webmesh/api/ts/v1/app_pb';

export interface Profile {
  name: string;
  params: ConnectRequest;
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profiles: [] as Profile[],
  }),

  getters: {
    profiles(state): Profile[] {
      return state.profiles;
    },
    profileByName(state): (name: string) => Profile | undefined {
      return (name: string) => state.profiles.find((p) => p.name === name);
    },
  },

  actions: {
    put(profile: Profile) {
      const existing = this.profileByName(profile.name);
      if (existing) {
        const index = this.profiles.indexOf(existing);
        if (index > -1) {
          this.profiles.splice(index, 1, profile);
        }
      } else {
        this.profiles.push(profile);
      }
    },
    remove(profile: Profile) {
      const index = this.profiles.indexOf(profile);
      if (index > -1) {
        this.profiles.splice(index, 1);
      }
    },
    removeByName(name: string) {
      const profile = this.profileByName(name);
      if (profile) {
        this.remove(profile);
      }
    },
  },
});
