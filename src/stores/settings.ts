import { defineStore } from 'pinia';

export const DefaultDaemonAddress = '127.0.0.1:8080';

export const useSettingsStore = defineStore('settings', {
  persist: true,

  state: () => ({
    daemonAddress: DefaultDaemonAddress,
  }),

  getters: {
    getDaemonAddress(state): string {
      return state.daemonAddress;
    },
  },

  actions: {
    setDaemonAddress(addr: string) {
      this.daemonAddress = addr;
    },
  },
});
