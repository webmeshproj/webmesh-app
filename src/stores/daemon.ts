import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { Defaults, Options } from '@webmeshproject/vue';

export const useDaemon = defineStore('daemon', {
  persist:
    Platform.is.electron ||
    Platform.is.nativeMobile ||
    process.env.PERSIST_DATA === 'true',

  state: () => ({
    daemonAddress: Defaults.daemonAddress,
  }),

  getters: {
    address(state): string {
      return state.daemonAddress;
    },
    options(state): Options {
      return new Options({ daemonAddress: state.daemonAddress });
    },
  },

  actions: {
    setAddress(address: string) {
      this.daemonAddress = address;
    },
  },
});
