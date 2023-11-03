import { defineStore } from 'pinia';

export const DefaultDaemonAddress = '127.0.0.1:8081';

export const useSettingsStore = defineStore('settings', {
  persist: true,

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
