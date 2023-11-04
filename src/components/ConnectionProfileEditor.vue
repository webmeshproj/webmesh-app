<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <div class="text-h6 q-pa-md">{{ title }}</div>
      <form @submit.prevent.stop="onSubmit" @reset.prevent.stop="onReset">
        <q-card-section>
          <q-input
            dense
            ref="nameInputRef"
            v-model="profile.id"
            :clearable="isNewProfile"
            :disable="!isNewProfile"
            :rules="nameRules"
            placeholder="Profile Name"
          />
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-expansion-item
              dense
              default-opened
              group="toplevel"
              icon="router"
              label="Network"
            >
              <q-card-section>
                <q-select
                  label="Join Addresses"
                  dense
                  v-model="profile.addrs"
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  :disable="profile.bootstrap.enabled"
                />
                <q-checkbox
                  dense
                  v-model="profile.bootstrap.enabled"
                  size="xs"
                  label="Bootstrap network"
                />
              </q-card-section>
            </q-expansion-item>
            <q-expansion-item
              dense
              group="toplevel"
              icon="verified_user"
              label="Security"
            >
              <q-card-section>
                <div class="q-mx-sm text-caption">Authentication</div>
                <div class="row q-pa-sm justify-around">
                  <q-radio
                    dense
                    v-model="profile.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.NO_AUTH"
                    label="None"
                  />
                  <q-radio
                    dense
                    v-model="profile.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.BASIC"
                    label="Basic"
                  />
                  <q-radio
                    dense
                    v-model="profile.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.LDAP"
                    label="LDAP"
                  />
                  <q-radio
                    dense
                    v-model="profile.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.ID"
                    label="ID"
                  />
                  <q-radio
                    dense
                    v-model="profile.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.MTLS"
                    label="mTLS"
                    @click="profile.tls.enabled = true"
                  />
                </div>
                <div class="q-mx-sm text-caption">TLS</div>
                <div class="row q-pa-sm justify-start">
                  <q-checkbox
                    dense
                    v-model="profile.tls.enabled"
                    size="xs"
                    label="Enabled"
                    :disable="profile.authMethod === NetworkAuthMethod.MTLS"
                  />
                </div>
              </q-card-section>
            </q-expansion-item>
            <q-expansion-item
              dense
              group="toplevel"
              icon="rss_feed"
              label="Services"
            >
              <q-card-section> </q-card-section>
            </q-expansion-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Save" color="positive" type="submit" size="sm" />
          <q-btn
            label="Cancel"
            color="negative"
            size="sm"
            @click="onDialogCancel"
          />
          <q-btn
            label="Reset"
            color="primary"
            type="reset"
            size="sm"
            v-if="isNewProfile"
          />
        </q-card-actions>
      </form>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useDialogPluginComponent, QInput } from 'quasar';
import { NetworkAuthMethod } from '@webmesh/api/ts/v1/app_pb';
import { ConnectionProfile, useProfileStore } from '../stores/profiles';

const NewConnectionTitle = 'New Connection Profile';
const EditConnectionTitle = 'Edit Connection Profile';

type Validator = (value: string) => boolean | string;

function defaultConnectionProfile(): ConnectionProfile {
  return {
    id: '',
    authMethod: NetworkAuthMethod.NO_AUTH,
    networking: {},
    bootstrap: { enabled: false },
    tls: { enabled: false },
    services: { enabled: false },
  } as ConnectionProfile;
}

export default defineComponent({
  name: 'ConnectionProfileEditor',
  components: {},
  props: {
    current: {
      type: Object as () => ConnectionProfile,
      required: false,
    },
  },
  emits: [...useDialogPluginComponent.emits],
  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const profiles = useProfileStore();
    const isNewProfile = !props.current?.id;
    const title = isNewProfile ? NewConnectionTitle : EditConnectionTitle;
    const profile = ref<ConnectionProfile>(
      props.current ? { ...props.current } : { ...defaultConnectionProfile() }
    );
    const onReset = () =>
      (profile.value = props.current
        ? { ...props.current }
        : { ...defaultConnectionProfile() });

    const nameInputRef = ref<QInput | null>(null);
    const nameRules = [
      (value) => {
        return (value && value.length > 0) || 'Profile name is required';
      },
      (value) => {
        if (isNewProfile) {
          return (
            profiles.byName(value) === undefined || 'Profile name is taken'
          );
        }
        return true;
      },
    ] as Validator[];

    const onSubmit = () => {
      nameInputRef?.value?.validate();
      if (nameInputRef?.value?.hasError) {
        return;
      }
      onDialogOK(profile.value);
    };

    return {
      NetworkAuthMethod,
      title,
      isNewProfile,
      profile,
      profiles,
      dialogRef,
      nameInputRef,
      nameRules,
      onSubmit,
      onReset,
      onDialogHide,
      onDialogCancel,
    };
  },
});
</script>
