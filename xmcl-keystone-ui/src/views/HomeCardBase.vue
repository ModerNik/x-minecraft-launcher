<template>
  <v-card
    class="flex flex-col h-full"
    :color="cardColor"
  >
    <v-card-title>
      <v-icon left>
        {{ icon }}
      </v-icon>
      {{ title }}
    </v-card-title>
    <v-card-text class="flex-grow">
      <template v-if="refreshing">
        <v-skeleton-loader type="paragraph" />
      </template>
      <template v-else>
        {{ text }}
        <div
          v-if="icons.length > 0"
          class="mt-4"
        >
          <v-avatar
            v-for="a of icons"
            :key="a.name"
            v-shared-tooltip="a.name"
            :color="a.color ? a.color : !a.icon ? getColor(a.name) : undefined"
            size="30px"
          >
            <img
              v-if="a.icon"
              :src="a.icon"
            >
            <span v-else> {{ a.name[0]?.toUpperCase() }} </span>
          </v-avatar>
        </div>
      </template>
    </v-card-text>
    <v-card-actions>
      <v-btn
        :disabled="refreshing"
        :loading="refreshing"
        color="teal accent-4"
        text
        @click="emit('navigate')"
      >
        {{ button }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script lang="ts" setup>
import { kColorTheme } from '@/composables/colorTheme'
import { vSharedTooltip } from '@/directives/sharedTooltip'
import { getColor } from '@/util/color'
import { injection } from '@/util/inject'

defineProps<{
  icon?: string
  title: string
  subtitle?: string
  text: string
  button: string
  refreshing: boolean
  icons: Array<{ name: string; icon?: string; color?: string }>
}>()
const emit = defineEmits(['navigate'])
const { cardColor } = injection(kColorTheme)
</script>
