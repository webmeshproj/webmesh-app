<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
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
              <q-checkbox
                v-model="profile.bootstrap.enabled"
                label="Label on Right"
              />
            </q-expansion-item>
            <q-expansion-item
              dense
              group="toplevel"
              icon="verified_user"
              label="Security"
            >
            </q-expansion-item>
            <q-expansion-item
              dense
              group="toplevel"
              icon="rss_feed"
              label="Services"
            >
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
import {
  ConnectionProfile,
  ConnectionProfileSkeleton,
  profileToSkeleton,
  useProfileStore,
} from '../stores/profiles';

const NewConnectionTitle = 'New Connection Profile';
const EditConnectionTitle = 'Edit Connection Profile';

type Validator = (value: string) => boolean | string;

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
    const isNewProfile = props.current === undefined;
    const title = isNewProfile ? NewConnectionTitle : EditConnectionTitle;
    const profile = ref<ConnectionProfileSkeleton>(
      profileToSkeleton(props.current) ?? ({} as ConnectionProfileSkeleton)
    );
    // Ensure empty structs are defined
    if (!profile.value.bootstrap) {
      profile.value.bootstrap = {
        enabled: false,
      };
    }

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

    const onReset = () => {
      profile.value =
        profileToSkeleton(props.current) ?? ({} as ConnectionProfileSkeleton);
    };

    const onSubmit = () => {
      nameInputRef?.value?.validate();
      if (nameInputRef?.value?.hasError) {
        return;
      }
      onDialogOK(profile.value);
    };

    return {
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
