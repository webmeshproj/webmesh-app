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
            <!-- Network Settings -->
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
                <!-- Bootstrap Settings -->
                <div class="q-ma-sm text-caption">
                  Bootstrap
                  <div class="column q-pa-sm justify-start">
                    <q-checkbox
                      v-model="profile.bootstrap.enabled"
                      size="xs"
                      label="Enabled"
                      @update:model-value="
                        () => {
                          profile.services.enabled = true;
                          if (
                            !profile.services.features.includes(
                              Feature.MEMBERSHIP
                            )
                          ) {
                            profile.services.features.push(Feature.MEMBERSHIP);
                          }
                        }
                      "
                    />
                    <div
                      class="q-pa-sm text-caption"
                      v-if="profile.bootstrap.enabled"
                    >
                      Mesh Settings
                      <q-input
                        dense
                        v-model="profile.bootstrap.domain"
                        :disable="!isNewProfile"
                        :placeholder="DefaultMeshDomain"
                        hint="Domain name of the mesh network"
                      />
                      <q-input
                        dense
                        v-model="profile.bootstrap.ipv4Network"
                        :disable="!isNewProfile"
                        :placeholder="DefaultMeshIPv4Network"
                        hint="IPv4 CIDR of the mesh network"
                      />
                      <q-checkbox
                        v-model="profile.bootstrap.rbacEnabled"
                        size="xs"
                        label="Enable RBAC"
                        :disable="!isNewProfile"
                      />
                      <div class="q-px-sm text-caption">
                        Default Network Policy
                      </div>
                      <q-radio
                        v-model="profile.bootstrap.defaultNetworkACL"
                        :val="DefaultNetworkACL.ACCEPT"
                        :disable="!isNewProfile"
                        label="Accept"
                        color="positive"
                      />
                      <q-radio
                        v-model="profile.bootstrap.defaultNetworkACL"
                        :val="DefaultNetworkACL.DROP"
                        :disable="!isNewProfile"
                        label="Drop"
                        color="negative"
                      />
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-expansion-item>

            <!-- Security Settings -->
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
                <div
                  class="q-pa-sm text-caption"
                  v-if="
                    profile.authMethod === NetworkAuthMethod.BASIC ||
                    profile.authMethod === NetworkAuthMethod.LDAP
                  "
                >
                  Credentials
                  <q-input
                    v-if="profile.authMethod === NetworkAuthMethod.BASIC"
                    v-model="
                      profile.authCredentials[
                        AuthHeader.BASIC_USERNAME.toString()
                      ]
                    "
                    dense
                    clearable
                    label="Basic Username"
                  />
                  <q-input
                    v-if="profile.authMethod === NetworkAuthMethod.BASIC"
                    v-model="
                      profile.authCredentials[
                        AuthHeader.BASIC_PASSWORD.toString()
                      ]
                    "
                    dense
                    clearable
                    label="Basic Password"
                  />
                  <q-input
                    v-if="profile.authMethod === NetworkAuthMethod.LDAP"
                    v-model="
                      profile.authCredentials[
                        AuthHeader.LDAP_USERNAME.toString()
                      ]
                    "
                    dense
                    clearable
                    label="LDAP Username"
                  />
                  <q-input
                    v-if="profile.authMethod === NetworkAuthMethod.LDAP"
                    v-model="
                      profile.authCredentials[
                        AuthHeader.LDAP_PASSWORD.toString()
                      ]
                    "
                    dense
                    clearable
                    label="LDAP Password"
                  />
                </div>
                <div class="q-mx-sm text-caption">TLS</div>
                <div
                  :class="
                    profile.tls.enabled
                      ? 'row q-pa-sm justify-around'
                      : 'row q-pa-sm justify-start'
                  "
                >
                  <q-checkbox
                    dense
                    v-model="profile.tls.enabled"
                    size="xs"
                    label="Enabled"
                    :disable="profile.authMethod === NetworkAuthMethod.MTLS"
                  />
                  <q-checkbox
                    dense
                    v-model="profile.tls.skipVerify"
                    size="xs"
                    label="Skip Verify"
                    @click="profile.tls.verifyChainOnly = false"
                    v-if="profile.tls.enabled"
                  />
                  <q-checkbox
                    dense
                    v-model="profile.tls.verifyChainOnly"
                    size="xs"
                    label="Verify Chain Only"
                    @click="profile.tls.skipVerify = false"
                    v-if="profile.tls.enabled"
                  />
                </div>
                <div
                  class="col q-pa-sm justify-around"
                  v-if="profile.tls.enabled"
                >
                  <q-input
                    v-model="profile.tls.caCertData"
                    dense
                    clearable
                    label="TLS CA Certificate"
                    ref="caCertRef"
                  >
                    <template v-slot:after>
                      <div class="q-pt-sm">
                        <q-btn
                          round
                          dense
                          flat
                          icon="upload"
                          @click="
                            filePickerTarget = caCertRef;
                            pickTLSFile();
                          "
                        >
                          <q-tooltip anchor="bottom left" self="top middle">
                            <span style="font-size: small"
                              >Upload a PEM certificate file</span
                            >
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </template>
                  </q-input>
                  <q-input
                    v-model="profile.tls.certData"
                    dense
                    clearable
                    label="TLS Certificate"
                    ref="tlsCertRef"
                    v-if="
                      profile.authMethod === NetworkAuthMethod.MTLS ||
                      profile.services.enabled
                    "
                  >
                    <template v-slot:after>
                      <div class="q-pt-sm">
                        <q-btn
                          round
                          dense
                          flat
                          icon="upload"
                          @click="
                            filePickerTarget = tlsCertRef;
                            pickTLSFile();
                          "
                        >
                          <q-tooltip anchor="bottom left" self="top middle">
                            <span style="font-size: small"
                              >Upload a PEM certificate file</span
                            >
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </template>
                  </q-input>
                  <q-input
                    v-model="profile.tls.keyData"
                    dense
                    clearable
                    label="TLS Key"
                    ref="tlsKeyRef"
                    v-if="
                      profile.authMethod === NetworkAuthMethod.MTLS ||
                      profile.services.enabled
                    "
                  >
                    <template v-slot:after>
                      <div class="q-pt-sm">
                        <q-btn
                          round
                          dense
                          flat
                          icon="upload"
                          @click="
                            filePickerTarget = tlsKeyRef;
                            pickTLSFile();
                          "
                        >
                          <q-tooltip anchor="bottom left" self="top middle">
                            <span style="font-size: small"
                              >Upload a PEM key file</span
                            >
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </template>
                  </q-input>
                </div>
              </q-card-section>
            </q-expansion-item>

            <!-- Services Settings -->
            <q-expansion-item
              dense
              group="toplevel"
              icon="rss_feed"
              label="Services"
            >
              <q-card-section>
                <div class="column q-px-sm justify-start">
                  <q-checkbox
                    dense
                    v-model="profile.services.enabled"
                    size="xs"
                    label="Enabled"
                    :disable="profile.bootstrap.enabled"
                  >
                    <q-tooltip
                      anchor="bottom middle"
                      self="top middle"
                      v-if="profile.bootstrap.enabled"
                    >
                      <span style="font-size: small">
                        Cannot disable services when bootstrap is enabled
                      </span>
                    </q-tooltip>
                  </q-checkbox>
                  <q-input
                    v-model="profile.services.listenAddress"
                    label="Listen Address"
                    v-if="profile.services.enabled"
                    :rules="[
                      (value: string) => {
                        return (
                          (value && value.length > 0) ||
                          'Listen address is required'
                        );
                      },
                    ]"
                  />
                </div>
                <div v-if="profile.services.enabled">
                  <!-- Membership -->
                  <div class="text-caption">Membership</div>
                  <div class="q-px-sm q-gutter-sm">
                    <q-tooltip
                      anchor="bottom middle"
                      self="top middle"
                      v-if="profile.bootstrap.enabled"
                    >
                      <span style="font-size: small">
                        Cannot change membership settings when bootstrap is
                        enabled
                      </span>
                    </q-tooltip>
                    <q-checkbox
                      dense
                      v-model="profile.services.features"
                      :disable="profile.bootstrap.enabled"
                      :val="Feature.MEMBERSHIP"
                      label="Voter"
                      @click="
                        profile.services?.features?.includes(
                          Feature.MEMBERSHIP
                        ) &&
                          profile.services?.features?.includes(
                            Feature.STORAGE_QUERIER
                          ) &&
                          profile.services?.features?.splice(
                            profile.services.features.indexOf(
                              Feature.STORAGE_QUERIER
                            ),
                            1
                          )
                      "
                    />
                    <q-checkbox
                      dense
                      v-model="profile.services.features"
                      :disable="profile.bootstrap.enabled"
                      :val="Feature.STORAGE_QUERIER"
                      label="Observer"
                      @click="
                        profile.services?.features?.includes(
                          Feature.STORAGE_QUERIER
                        ) &&
                          profile.services?.features?.includes(
                            Feature.MEMBERSHIP
                          ) &&
                          profile.services?.features?.splice(
                            profile.services.features.indexOf(
                              Feature.MEMBERSHIP
                            ),
                            1
                          )
                      "
                    />
                  </div>
                  <!-- APIs -->
                  <div class="q-pa-sm text-caption">APIs</div>
                  <div class="q-px-sm q-gutter-sm">
                    <q-checkbox
                      dense
                      v-model="profile.services.features"
                      :val="Feature.MESH_API"
                      label="Mesh"
                    />
                    <q-checkbox
                      dense
                      v-model="profile.services.features"
                      :val="Feature.ICE_NEGOTIATION"
                      label="WebRTC"
                    />
                    <q-checkbox
                      dense
                      v-model="profile.services.features"
                      :val="Feature.ADMIN_API"
                      label="Admin"
                    />
                  </div>
                  <!-- DNS -->
                  <div class="q-pa-sm text-caption">MeshDNS</div>
                  <div class="q-px-md q-gutter-sm">
                    <q-checkbox
                      dense
                      v-model="profile.services.dns.enabled"
                      size="xs"
                      label="Enabled"
                    />
                    <q-input
                      dense
                      clearable
                      v-model="profile.services.dns.listenUDP"
                      label="Listen UDP"
                      hint="Leave blank to disable UDP"
                      v-if="profile.services.dns.enabled"
                    />
                    <q-input
                      dense
                      clearable
                      v-model="profile.services.dns.listenTCP"
                      label="Listen TCP"
                      hint="Leave blank to disable TCP"
                      v-if="profile.services.dns.enabled"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-expansion-item>
          </q-list>
        </q-card-section>
        <!-- Actions -->
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
    <q-file
      ref="filePickerRef"
      style="display: none"
      :model-value="undefined"
      @update:model-value="onPickedTLSFile"
    ></q-file>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useDialogPluginComponent, QInput, QFile } from 'quasar';
import {
  NetworkAuthMethod,
  ConnectRequest_AuthHeader as AuthHeader,
  MeshConnBootstrap_DefaultNetworkACL as DefaultNetworkACL,
} from '@webmesh/api/ts/v1/app_pb';
import { Feature } from '@webmesh/api/ts/v1/node_pb';
import {
  ConnectionProfile,
  DefaultMeshDomain,
  DefaultMeshIPv4Network,
  newDefaultConnectionProfile,
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
    const isNewProfile = !props.current?.id;
    const title = isNewProfile ? NewConnectionTitle : EditConnectionTitle;

    const profile = ref<ConnectionProfile>(
      props.current
        ? { ...props.current }
        : { ...newDefaultConnectionProfile() }
    );
    const onReset = () =>
      (profile.value = props.current
        ? { ...props.current }
        : { ...newDefaultConnectionProfile() });

    const caCertRef = ref<QInput | null>(null);
    const tlsCertRef = ref<QInput | null>(null);
    const tlsKeyRef = ref<QInput | null>(null);
    const filePickerTarget = ref<QInput | null>(null);
    const filePickerRef = ref<QFile | null>(null);
    const pickTLSFile = () => {
      filePickerRef.value?.pickFiles();
    };
    const onPickedTLSFile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (filePickerTarget.value === caCertRef.value) {
          profile.value.tls.caCertData = btoa(
            reader.result?.toString() || ''
          ) as string;
        } else if (filePickerTarget.value === tlsCertRef.value) {
          profile.value.tls.certData = btoa(
            reader.result?.toString() || ''
          ) as string;
        } else if (filePickerTarget.value === tlsKeyRef.value) {
          profile.value.tls.keyData = btoa(
            reader.result?.toString() || ''
          ) as string;
        }
      };
      reader.readAsText(file);
    };

    const nameInputRef = ref<QInput | null>(null);
    const nameRules = [
      (value: string) => {
        return (value && value.length > 0) || 'Profile name is required';
      },
      (value: string) => {
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
      Feature,
      AuthHeader,
      DefaultNetworkACL,
      DefaultMeshDomain,
      DefaultMeshIPv4Network,
      NetworkAuthMethod,
      title,
      isNewProfile,
      profile,
      profiles,
      dialogRef,
      filePickerTarget,
      filePickerRef,
      nameInputRef,
      nameRules,
      caCertRef,
      tlsCertRef,
      tlsKeyRef,
      onSubmit,
      onReset,
      onDialogHide,
      onDialogCancel,
      pickTLSFile,
      onPickedTLSFile,
    };
  },
});
</script>
