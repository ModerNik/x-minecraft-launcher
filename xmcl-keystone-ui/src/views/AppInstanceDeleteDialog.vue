<template>
  <v-dialog
    v-model="isShown"
    :persistent="false"
    :width="400"
  >
    <v-card>
      <v-card-title
        class="headline"
        primary-title
      >
        {{ t('instance.delete') }}
      </v-card-title>

      <v-card-text>
        {{ t('instance.deleteHint') }}
        <div style="color: grey">
          {{ t('instance.name') }}: {{ name }}
        </div>
        <div style="color: grey">
          {{ path }}
        </div>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-btn
          text
          @click="isShown = false"
        >
          {{ t('delete.no') }}
        </v-btn>
        <v-spacer />
        <v-btn
          color="error"
          @click="doDelete"
        >
          <v-icon left>
            delete
          </v-icon>
          {{ t('delete.yes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
import { InstanceServiceKey } from '@xmcl/runtime-api'
import { useDialog } from '../composables/dialog'
import { useService } from '@/composables'

const { t } = useI18n()
const name = ref('')
const path = ref('')
const { dialog, isShown } = useDialog('delete-instance')
watch(isShown, (shown) => {
  if (shown) {
    name.value = (typeof dialog.value.parameter === 'object') ? (dialog.value.parameter).name ?? '' : ''
    path.value = (typeof dialog.value.parameter === 'object') ? (dialog.value.parameter).path ?? '' : ''
  }
})
const { deleteInstance } = useService(InstanceServiceKey)
const doDelete = () => {
  const val = dialog.value.parameter
  deleteInstance((val as any).path)
  isShown.value = false
}

</script>
