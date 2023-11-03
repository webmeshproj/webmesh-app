import { defineStore } from 'pinia';
import { Platform } from 'quasar';

export const DefaultDaemonAddress = '127.0.0.1:58080';

export const useSettingsStore = defineStore('settings', {
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
  },

  actions: {
    setDaemonAddress(addr: string) {
      this.daemonAddr = addr;
    },
  },
});
