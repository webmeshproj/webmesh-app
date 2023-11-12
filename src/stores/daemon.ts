import { defineStore } from 'pinia';
import { Platform } from 'quasar';
import { DefaultDaemonAddress } from '@webmeshproject/api/utils/daemon';
import { DaemonOptions } from '@webmeshproject/vue';

export const useDaemon = defineStore('daemon', {
  persist:
    Platform.is.electron ||
    Platform.is.nativeMobile ||
    process.env.PERSIST_DATA === 'true',

  state: () => ({
    daemonAddress: DefaultDaemonAddress,
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
