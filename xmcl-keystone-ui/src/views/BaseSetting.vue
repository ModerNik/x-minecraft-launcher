<template>
  <div class="mx-6">
    <BaseSettingGeneral />
    <BaseSettingSync />
    <BaseSettingModpack v-if="!isServer" />
    <BaseSettingServer v-else />
    <BaseSettingJava />
    <BaseSettingLaunch />

    <v-snackbar
      :color="snackbarColor"
      :class="{ 'shake-animation': hasAnimation }"
      :timeout="-1"
      :value="edit.isModified"
    >
      <div class="mr-4 text-button">
        {{ t('instance.setting.unsaved') }}
      </div>

      <template #action="{ attrs }">
        <div
          class="flex gap-1 mr-2"
          v-bind="attrs"
        >
          <v-btn
            text
            @click="onReset"
          >
            {{ t('instance.setting.reset') }}
          </v-btn>

          <v-btn
            color="primary"
            @click="edit.save"
          >
            {{ t('instance.setting.save') }}
          </v-btn>
        </div>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang=ts setup>
import { useAutoSaveLoad } from '@/composables'
import { useBeforeLeave } from '@/composables/beforeLeave'
import { kInstanceContext } from '@/composables/instanceContext'
import { usePresence } from '@/composables/presence'
import { injection } from '@/util/inject'
import { InstanceEditInjectionKey, useInstanceEdit } from '../composables/instanceEdit'
import BaseSettingGeneral from './BaseSettingGeneral.vue'
import BaseSettingJava from './BaseSettingJava.vue'
import BaseSettingLaunch from './BaseSettingLaunch.vue'
import BaseSettingModpack from './BaseSettingModpack.vue'
import BaseSettingServer from './BaseSettingServer.vue'
import BaseSettingSync from './BaseSettingSync.vue'

const { isServer, name, instance } = injection(kInstanceContext)
const edit = useInstanceEdit(instance)
const { t } = useI18n()
provide(InstanceEditInjectionKey, edit)
useAutoSaveLoad(() => {}, edit.load)

function onReset() {
  edit.load()
}

const snackbarColor = ref('black')
const hasAnimation = ref(false)
useBeforeLeave(() => {
  if (edit.isModified.value) {
    snackbarColor.value = 'error'
    hasAnimation.value = true
    setTimeout(() => {
      snackbarColor.value = 'black'
      hasAnimation.value = false
    }, 500)
    return false
  }
  return true
})

usePresence(computed(() => t('presence.instanceSetting', { instance: name.value })))

</script>

<style scoped=true>
/* .flex {
  padding: 6px 8px !important
} */

/* .v-btn {
  margin: 0
} */
</style>
<style>
.local-version .v-select__selection--comma {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.base-settings {
  background: transparent !important;
  width: 100%;
}

.base-settings .v-text-field--box input,
.v-text-field--full-width input,
.v-text-field--outlined input {
  margin-top: 0
}

.v-snack__wrapper {
  transition-property: all !important;
  transition-delay: 0ms;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes shake {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-10px, 0); }
  20% { transform: translate(10px, 0); }
  30% { transform: translate(-10px, 0); }
  40% { transform: translate(10px, 0); }
  50% { transform: translate(-10px, 0); }
  60% { transform: translate(10px, 0); }
  70% { transform: translate(-10px, 0); }
  80% { transform: translate(10px, 0); }
  90% { transform: translate(-10px, 0); }
  100% { transform: translate(0, 0); }
}

.shake-animation {
  animation-name: shake;
  animation-duration: .5s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
</style>
