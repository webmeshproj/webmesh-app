import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { Defaults } from '@webmeshproject/api/utils/networks';
import { DaemonOptions } from '@webmeshproject/vue';

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
    options(state): DaemonOptions {
      return new DaemonOptions({ daemonAddress: state.daemonAddress });
    },
  },

  actions: {
    setAddress(address: string) {
      this.daemonAddress = address;
    },
  },
});
