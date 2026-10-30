<script setup lang="ts">
import { Button } from "../ui/button";
defineProps<{ isFullscreen: boolean }>();
const emit = defineEmits<{ toggle: [] }>();
</script>
<template>
  <Button
    variant="outline"
    color="secondary"
    shape="icon"
    class="bg-card absolute right-3 bottom-3 z-20"
    :aria-label="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
    @pointerdown.stop
    @click.stop="emit('toggle')"
    ><Icon
      :name="isFullscreen ? 'tabler:minimize' : 'tabler:maximize'"
      mode="svg"
  /></Button>
</template>
