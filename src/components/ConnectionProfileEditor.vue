<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
      <form
        @submit.prevent.stop="onSubmit"
        @reset.prevent.stop="onReset"
        class="q-gutter-md"
      >
        <q-card-section>
          <q-input
            ref="nameInputRef"
            v-model="thisProfile.name"
            :clearable="isNewProfile"
            :disable="!isNewProfile"
            :rules="nameRules"
            placeholder="Profile Name"
            hint="Enter a name for this profile"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" label="Save" type="submit" @click="onSubmit" />
          <q-btn color="primary" label="Cancel" @click="onCancelClick" />
          <q-btn
            label="Reset"
            type="reset"
            color="primary"
            flat
            class="q-ml-sm"
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
import { ConnectionProfile, useProfileStore } from '../stores/profiles';

const NewConnectionTitle = 'New Connection Profile';
const EditConnectionTitle = 'Edit Connection Profile';

type Validator = (value: string) => boolean | string;

export default defineComponent({
  name: 'ConnectionProfileEditor',
  components: {},
  props: {
    profile: {
      type: Object as () => ConnectionProfile,
      required: false,
    },
  },
  emits: [...useDialogPluginComponent.emits],
  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const profiles = useProfileStore();
    const isNewProfile = props.profile === undefined;
    const title = isNewProfile ? NewConnectionTitle : EditConnectionTitle;
    const thisProfile = ref<ConnectionProfile>(
      props.profile ?? ({} as ConnectionProfile)
    );

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
      thisProfile.value = props.profile ?? ({} as ConnectionProfile);
    };

    const onSubmit = () => {
      nameInputRef?.value?.validate();
      if (nameInputRef?.value?.hasError) {
        return;
      }
      onDialogOK(thisProfile.value);
    };

    return {
      title,
      isNewProfile,
      thisProfile,
      profiles,
      dialogRef,
      nameInputRef,
      nameRules,
      onSubmit,
      onReset,
      onDialogHide,
      onCancelClick: onDialogCancel,
    };
  },
});
</script>
