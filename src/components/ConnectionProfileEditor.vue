<template>
  <q-dialog persistent ref="dialogRef" @hide="onDialogHide" full-width>
    <q-card class="q-dialog-plugin">
      <div class="text-h6 q-pa-md">{{ title }}</div>
      <form @submit.prevent.stop="onSubmit" @reset.prevent.stop="onReset">
        <q-card-section>
          <q-input
            dense
            ref="nameInputRef"
            class="q-px-lg"
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
                  hint="Press Enter to add a new address"
                  dense
                  v-model="profile.params.addrs"
                  use-input
                  use-chips
                  multiple
                  hide-dropdown-icon
                  input-debounce="0"
                  new-value-mode="add-unique"
                  :disable="profile.params.bootstrap.enabled"
                />
                <q-checkbox
                  v-model="profile.params.networking.useDNS"
                  size="xs"
                  label="Use MeshDNS Servers"
                  class="q-py-sm"
                  dense
                />
                <!-- Endpoint Settings -->
                <q-expansion-item
                  dense
                  group="endpoints"
                  icon="cell_tower"
                  label="Endpoints"
                  class="q-pt-sm"
                >
                  <q-select
                    label="Endpoints"
                    hint="Addresses where other nodes can reach you"
                    dense
                    class="q-px-lg"
                    v-model="profile.params.networking.endpoints"
                    use-input
                    use-chips
                    multiple
                    hide-dropdown-icon
                    input-debounce="0"
                    new-value-mode="add-unique"
                    :disable="profile.params.bootstrap.enabled"
                  />
                  <q-checkbox
                    v-model="profile.params.networking.detectEndpoints"
                    size="xs"
                    label="Detect from Host"
                    class="q-py-sm q-px-lg"
                    dense
                  />
                  <q-checkbox
                    v-model="profile.params.networking.detectPrivateEndpoints"
                    size="xs"
                    label="Include Private Endpoints"
                    class="q-py-sm"
                    dense
                    v-if="profile.params.networking.detectEndpoints"
                  />
                </q-expansion-item>

                <!-- Bootstrap Settings -->
                <q-expansion-item
                  dense
                  group="bootstrap"
                  icon="flag"
                  label="Bootstrap"
                  class="q-pt-sm"
                >
                  <q-checkbox
                    v-model="profile.params.bootstrap.enabled"
                    size="xs"
                    label="Enabled"
                    class="q-px-md"
                    @update:model-value="
                      () => {
                        profile.params.services.enabled = true;
                        if (
                          !profile.params.services.features.includes(
                            Feature.MEMBERSHIP
                          )
                        ) {
                          profile.params.services.features.push(
                            Feature.MEMBERSHIP
                          );
                        }
                      }
                    "
                  />
                  <q-expansion-item
                    dense
                    group="meshsettings"
                    icon="router"
                    label="Mesh Settings"
                    class="q-px-md"
                    v-if="profile.params.bootstrap.enabled"
                  >
                    <q-input
                      dense
                      class="q-px-lg"
                      v-model="profile.params.bootstrap.domain"
                      :disable="!isNewProfile"
                      :placeholder="Defaults.meshDomain"
                      hint="Domain name of the mesh network"
                    />
                    <q-input
                      dense
                      class="q-px-lg"
                      v-model="profile.params.bootstrap.ipv4Network"
                      :disable="!isNewProfile"
                      :placeholder="Defaults.ipv4Network"
                      hint="IPv4 CIDR of the mesh network"
                    />
                    <div class="q-py-sm q-px-lg text-caption">
                      Access Control
                    </div>
                    <div class="row q-px-lg justify-around">
                      <strong>Default Network Policy</strong>
                      <q-radio
                        v-model="profile.params.bootstrap.defaultNetworkACL"
                        :val="DefaultNetworkACL.ACCEPT"
                        :disable="!isNewProfile"
                        label="Accept"
                        color="positive"
                        dense
                      />
                      <q-radio
                        v-model="profile.params.bootstrap.defaultNetworkACL"
                        :val="DefaultNetworkACL.DROP"
                        :disable="!isNewProfile"
                        label="Drop"
                        color="negative"
                        dense
                      />
                      <q-checkbox
                        v-model="profile.params.bootstrap.rbacEnabled"
                        size="xs"
                        label="Enable RBAC"
                        :disable="!isNewProfile"
                        dense
                      />
                    </div>
                  </q-expansion-item>
                </q-expansion-item>
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
                    v-model="profile.params.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.NO_AUTH"
                    label="None"
                  />
                  <q-radio
                    dense
                    v-model="profile.params.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.BASIC"
                    label="Basic"
                  />
                  <q-radio
                    dense
                    v-model="profile.params.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.LDAP"
                    label="LDAP"
                  />
                  <q-radio
                    dense
                    v-model="profile.params.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.ID"
                    label="ID"
                  />
                  <q-radio
                    dense
                    v-model="profile.params.authMethod"
                    checked-icon="task_alt"
                    :val="NetworkAuthMethod.MTLS"
                    label="mTLS"
                    @click="profile.params.tls.enabled = true"
                  />
                </div>
                <div
                  class="q-pa-sm text-caption"
                  v-if="
                    profile.params.authMethod === NetworkAuthMethod.BASIC ||
                    profile.params.authMethod === NetworkAuthMethod.LDAP
                  "
                >
                  Credentials
                  <q-input
                    v-if="profile.params.authMethod === NetworkAuthMethod.BASIC"
                    v-model="
                      profile.params.authCredentials[
                        AuthHeader.BASIC_USERNAME.toString()
                      ]
                    "
                    dense
                    clearable
                    label="Basic Username"
                  />
                  <q-input
                    v-if="profile.params.authMethod === NetworkAuthMethod.BASIC"
                    v-model="
                      profile.params.authCredentials[
                        AuthHeader.BASIC_PASSWORD.toString()
                      ]
                    "
                    dense
                    clearable
                    label="Basic Password"
                  />
                  <q-input
                    v-if="profile.params.authMethod === NetworkAuthMethod.LDAP"
                    v-model="
                      profile.params.authCredentials[
                        AuthHeader.LDAP_USERNAME.toString()
                      ]
                    "
                    dense
                    clearable
                    label="LDAP Username"
                  />
                  <q-input
                    v-if="profile.params.authMethod === NetworkAuthMethod.LDAP"
                    v-model="
                      profile.params.authCredentials[
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
                    profile.params.tls.enabled
                      ? 'row q-pa-sm justify-around'
                      : 'row q-pa-sm justify-start'
                  "
                >
                  <q-checkbox
                    dense
                    v-model="profile.params.tls.enabled"
                    size="xs"
                    label="Enabled"
                    :disable="
                      profile.params.authMethod === NetworkAuthMethod.MTLS
                    "
                  />
                  <q-checkbox
                    dense
                    v-model="profile.params.tls.skipVerify"
                    size="xs"
                    label="Skip Verify"
                    @click="profile.params.tls.verifyChainOnly = false"
                    v-if="profile.params.tls.enabled"
                  />
                  <q-checkbox
                    dense
                    v-model="profile.params.tls.verifyChainOnly"
                    size="xs"
                    label="Verify Chain Only"
                    @click="profile.params.tls.skipVerify = false"
                    v-if="profile.params.tls.enabled"
                  />
                </div>
                <div
                  class="col q-pa-sm justify-around"
                  v-if="profile.params.tls.enabled"
                >
                  <q-input
                    v-model="profile.params.tls.caCertData"
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
                    v-model="profile.params.tls.certData"
                    dense
                    clearable
                    label="TLS Certificate"
                    ref="tlsCertRef"
                    v-if="
                      profile.params.authMethod === NetworkAuthMethod.MTLS ||
                      profile.params.services.enabled
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
                    v-model="profile.params.tls.keyData"
                    dense
                    clearable
                    label="TLS Key"
                    ref="tlsKeyRef"
                    v-if="
                      profile.params.authMethod === NetworkAuthMethod.MTLS ||
                      profile.params.services.enabled
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
                    v-model="profile.params.services.enabled"
                    size="xs"
                    label="Enabled"
                    :disable="profile.params.bootstrap.enabled"
                  >
                    <q-tooltip
                      anchor="bottom middle"
                      self="top middle"
                      v-if="profile.params.bootstrap.enabled"
                    >
                      <span style="font-size: small">
                        Cannot disable services when bootstrap is enabled
                      </span>
                    </q-tooltip>
                  </q-checkbox>
                  <q-input
                    v-model="profile.params.services.listenAddress"
                    label="Listen Address"
                    v-if="profile.params.services.enabled"
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

                <div v-if="profile.params.services.enabled">
                  <!-- Membership -->
                  <div class="text-caption">Membership</div>
                  <div class="q-px-sm q-gutter-sm">
                    <q-tooltip
                      anchor="bottom middle"
                      self="top middle"
                      v-if="profile.params.bootstrap.enabled"
                    >
                      <span style="font-size: small">
                        Cannot change membership settings when bootstrap is
                        enabled
                      </span>
                    </q-tooltip>
                    <q-checkbox
                      dense
                      v-model="profile.params.services.features"
                      :disable="profile.params.bootstrap.enabled"
                      :val="Feature.MEMBERSHIP"
                      label="Voter"
                      @click="
                        profile.params.services.features.includes(
                          Feature.MEMBERSHIP
                        ) &&
                          profile.params.services.features.includes(
                            Feature.STORAGE_QUERIER
                          ) &&
                          profile.params.services.features.splice(
                            profile.params.services.features.indexOf(
                              Feature.STORAGE_QUERIER
                            ),
                            1
                          )
                      "
                    />
                    <q-checkbox
                      dense
                      v-model="profile.params.services.features"
                      :disable="profile.params.bootstrap.enabled"
                      :val="Feature.STORAGE_QUERIER"
                      label="Observer"
                      @click="
                        profile.params.services.features.includes(
                          Feature.STORAGE_QUERIER
                        ) &&
                          profile.params.services.features.includes(
                            Feature.MEMBERSHIP
                          ) &&
                          profile.params.services.features.splice(
                            profile.params.services.features.indexOf(
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
                      v-model="profile.params.services.features"
                      :val="Feature.MESH_API"
                      label="Mesh"
                    />
                    <q-checkbox
                      dense
                      v-model="profile.params.services.features"
                      :val="Feature.ICE_NEGOTIATION"
                      label="WebRTC"
                    />
                    <q-checkbox
                      dense
                      v-model="profile.params.services.features"
                      :val="Feature.ADMIN_API"
                      label="Admin"
                    />
                  </div>
                  <!-- DNS -->
                  <div class="q-pa-sm text-caption">MeshDNS</div>
                  <div class="q-px-md q-gutter-sm">
                    <q-checkbox
                      dense
                      v-model="profile.params.services.dns.enabled"
                      size="xs"
                      label="Enabled"
                    />
                    <q-input
                      dense
                      clearable
                      v-model="profile.params.services.dns.listenUDP"
                      label="Listen UDP"
                      hint="Leave blank to disable UDP"
                      v-if="profile.params.services.dns.enabled"
                    />
                    <q-input
                      dense
                      clearable
                      v-model="profile.params.services.dns.listenTCP"
                      label="Listen TCP"
                      hint="Leave blank to disable TCP"
                      v-if="profile.params.services.dns.enabled"
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
import { defineComponent, ref, watch } from 'vue';
import { QInput, QFile, useDialogPluginComponent, useQuasar } from 'quasar';
import {
  NetworkAuthMethod,
  ConnectionParameters_AuthHeader as AuthHeader,
  MeshConnBootstrap_DefaultNetworkACL as DefaultNetworkACL,
} from '@webmeshproject/api/v1/app_pb';
import { Feature } from '@webmeshproject/api/v1/node_pb';
import { Defaults, NetworkParameters, useWebmesh } from '@webmeshproject/vue';

import { useDaemon } from 'src/stores/daemon';

const NewConnectionTitle = 'New Connection Profile';
const EditConnectionTitle = 'Edit Connection Profile';

type Validator = (value: string) => boolean | string;

export default defineComponent({
  name: 'ConnectionProfileEditor',
  components: {},
  props: {
    current: {
      type: Object as () => NetworkParameters,
      required: false,
    },
  },
  emits: [...useDialogPluginComponent.emits],
  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const q = useQuasar();
    const profile = ref<NetworkParameters>(
      props.current ? { ...props.current } : Defaults.parameters()
    );
    const daemon = useDaemon();
    const { networks, error } = useWebmesh(daemon.options);

    const isNewProfile = !props.current?.id;
    const title = isNewProfile ? NewConnectionTitle : EditConnectionTitle;
    const caCertRef = ref<QInput | null>(null);
    const tlsCertRef = ref<QInput | null>(null);
    const tlsKeyRef = ref<QInput | null>(null);
    const filePickerTarget = ref<QInput | null>(null);
    const filePickerRef = ref<QFile | null>(null);
    const nameInputRef = ref<QInput | null>(null);

    watch(error, (err) => {
      if (err && err.message) {
        q.notify({
          type: 'negative',
          message: 'Error communicating with daemon',
          caption: err.message,
          position: 'top',
          timeout: 3000,
        });
      }
    });

    const nameRules = [
      (value: string) => {
        return (value && value.length > 0) || 'Profile name is required';
      },
      (value: string) => {
        if (isNewProfile) {
          return (
            networks.value.find((nw) => nw.id === value) &&
            'Profile name is taken'
          );
        }
        return true;
      },
    ] as Validator[];

    const onReset = () => {
      profile.value = props.current
        ? { ...props.current }
        : Defaults.parameters();
    };

    const pickTLSFile = () => {
      filePickerRef.value?.pickFiles();
    };

    const onPickedTLSFile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (filePickerTarget.value === caCertRef.value) {
          profile.value.params.tls.caCertData = btoa(
            reader.result?.toString() || ''
          ) as string;
        } else if (filePickerTarget.value === tlsCertRef.value) {
          profile.value.params.tls.certData = btoa(
            reader.result?.toString() || ''
          ) as string;
        } else if (filePickerTarget.value === tlsKeyRef.value) {
          profile.value.params.tls.keyData = btoa(
            reader.result?.toString() || ''
          ) as string;
        }
      };
      reader.readAsText(file);
    };

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
      Defaults,
      DefaultNetworkACL,
      NetworkAuthMethod,
      title,
      isNewProfile,
      profile,
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
