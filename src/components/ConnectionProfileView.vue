<template>
  <q-card flat bordered class="profile-card">
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ profile.name }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator />

    <q-card-section horizontal class="justify-between">
      <q-card-section class="col-10"> </q-card-section>

      <q-separator vertical />

      <q-card-actions vertical class="col-2 justify-around">
        <q-btn
          flat
          round
          color="positive"
          icon="edit"
          @click="$emit('onEdit', profile)"
        >
          <q-tooltip anchor="bottom right" self="top middle">
            <span style="font-size: small">Edit Profile</span>
          </q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          color="negative"
          icon="delete"
          @click="$emit('onDelete', profile)"
        >
          <q-tooltip anchor="bottom right" self="top middle">
            <span style="font-size: small">Remove Profile</span>
          </q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card-section>
  </q-card>
</template>

<style lang="sass" scoped>
.profile-card
  width: 100%
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import { ConnectionProfile } from '../stores/profiles';
import { useClientStore } from '../stores/client';

export default defineComponent({
  name: 'ConnectionProfileView',
  components: {},
  emits: ['onConnect', 'onDisconnect', 'onEdit', 'onDelete'],
  props: {
    profile: {
      type: Object as () => ConnectionProfile,
      required: true,
    },
  },
  setup() {
    const client = useClientStore();
    return { client };
  },
});
</script>
