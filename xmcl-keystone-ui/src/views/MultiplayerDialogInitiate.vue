<template>
  <v-dialog
    v-model="isShown"
    class="mx-20"
  >
    <v-stepper
      v-model="step"
      vertical
    >
      <v-stepper-step
        :complete="step > 1"
        step="1"
      >
        {{ t('multiplayer.initiateConnection') }}
      </v-stepper-step>
      <v-stepper-content step="1">
        <div class="flex items-center justify-center">
          <div>
            {{ t('multiplayer.startNewP2PConnection') }}
            <p class="text-gray-400 text-sm">
              {{ t('multiplayer.joinConnection') }}
            </p>
          </div>
          <div class="flex-grow" />
          <v-btn
            text
            outlined
            color="primary"
            @click="initiate"
          >
            {{ t('multiplayer.start') }}
          </v-btn>
        </div>
      </v-stepper-content>

      <v-stepper-step
        :complete="step > 2"
        :editable="step > 2"
        step="2"
      >
        {{ t('multiplayer.createLocalToken') }}
      </v-stepper-step>
      <v-stepper-content
        step="2"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-center gap-2">
            <div
              class="max-w-160"
              v-html="t('multiplayer.gatheringIce')"
            />
            <div class="flex-grow" />
            <div
              v-if="gatheringState !== 'complete'"
              class="text-gray-400"
            >
              {{ t('peerIceGatheringState.gathering') }}
              <v-progress-circular
                class="ml-2"
                :width="1"
                :size="20"
                indeterminate
              />
            </div>
          </div>
          <v-textarea
            :value="localDescription"
            class="mt-4"
            outlined
            readonly
            :label="t('multiplayer.localToken')"
            @mousedown="copyLocalDescription"
          />
          <div v-html="t('multiplayer.copyLocalHint')" />
          <div class="flex mt-3 gap-2 items-center justify-center text-amber-500">
            <v-btn
              text
              outlined
              @click="copyLocalDescription"
            >
              <v-icon
                v-if="!copied"
                left
              >
                content_copy
              </v-icon>
              <v-icon
                v-else
                left
                color="success"
              >
                check
              </v-icon>
              {{ copied ? t('multiplayer.copied') : t('multiplayer.copy') }}
            </v-btn>
            <div class="flex-grow" />
            <v-btn
              text
              outlined
              :color="initiating ? '' : 'primary'"
              :disabled="freeze"
              @click="step++"
            >
              {{ t('multiplayer.next') }}
            </v-btn>
          </div>
        </div>
      </v-stepper-content>

      <v-stepper-step
        step="3"
      >
        {{ t('multiplayer.enterRemoteToken') }}
      </v-stepper-step>
      <v-stepper-content step="3">
        {{ t('multiplayer.enterRemoteTokenHint') }}
        <v-textarea
          v-model="remoteDescription"
          outlined
          class="flex-grow-0 mt-4"
          :label="t('multiplayer.enterRemoteToken')"
          :error="error"
          :error-messages="errorText"
        />
        <div class="flex">
          <v-btn
            text
            outlined
            @click="step--"
          >
            {{ t('multiplayer.previous') }}
          </v-btn>
          <div class="flex-grow" />
          <v-btn
            text
            outlined
            color="primary"
            :loading="connecting"
            @click="connect"
          >
            {{ t('multiplayer.confirm') }}
          </v-btn>
        </div>
      </v-stepper-content>
    </v-stepper>
  </v-dialog>
</template>
<script lang=ts setup>
import { useRefreshable, useService, useServiceBusy } from '@/composables'
import { injection } from '@/util/inject'
import { createOfferAppUrl, PeerServiceKey } from '@xmcl/runtime-api'
import { useDialog } from '../composables/dialog'
import { kUserContext } from '../composables/user'

const { gameProfile } = injection(kUserContext)
const { isShown, dialog } = useDialog('peer-initiate')

const service = useService(PeerServiceKey)
const id = ref('')
const gatheringState = computed(() => connection.value?.iceGatheringState)
const connection = computed(() => service.state.connections.find(c => c.id === id.value))
const localDescription = computed(() => connection.value ? (connection.value.localDescriptionSDP) : '')
const localUrl = computed(() => createOfferAppUrl(localDescription.value, gameProfile.value.name))
const { t } = useI18n()

const remoteDescription = ref('')
const step = ref(1)
const done = ref(false)
const connectionState = computed(() => connection.value?.connectionState)
const freeze = ref(false)
const errorText = ref('')
const error = computed(() => !!errorText.value)

watch(isShown, (v) => {
  if (v && typeof dialog.value.parameter === 'string') {
    id.value = dialog.value.parameter
    if (gatheringState.value === 'complete') {
      step.value = 3
    } else {
      step.value = 2
    }
  } else {
    copied.value = false
    step.value = 1
    remoteDescription.value = ''
  }
})

const copied = ref(false)

function copyLocalDescription() {
  navigator.clipboard.writeText(localDescription.value)
  copied.value = true
}

const connecting = useServiceBusy(PeerServiceKey, 'answer', id)
const initiating = useServiceBusy(PeerServiceKey, 'initiate', id)

const { refresh: connect } = useRefreshable(async () => {
  try {
    if (remoteDescription.value === localDescription.value) {
      errorText.value = t('multiplayer.illegalTokenDescription')
      return
    }
    await service.answer(remoteDescription.value)
    id.value = ''
    done.value = true
    isShown.value = false
  } catch (e) {
    if (e instanceof TypeError) {
      errorText.value = t('multiplayer.illegalTokenDescription')
    } else {
      errorText.value = t('multiplayer.illegalTokenDescription')
    }
  }
})

const { refresh: initiate } = useRefreshable(async () => {
  step.value += 1
  id.value = await service.initiate()
  setTimeout(() => { freeze.value = false }, 4000)
  freeze.value = true
})

</script>

<style>

.dark .hint-text {
  color:
    rgba(255,255,255,0.7);
}

.hint-text {
  color:
    rgba(0,0,0,0.7);
}
</style>
