<script setup lang="ts">
defineProps<{ label?: string | number; tone?: string }>();
</script>
<template>
  <span
    class="bg-muted inline-flex shrink-0 items-center rounded-sm px-2 py-1 text-xs tabular-nums"
    :class="
      tone === 'error'
        ? 'text-destructive'
        : tone === 'success'
          ? 'text-success'
          : tone === 'warning'
            ? 'text-warning'
            : tone === 'info'
              ? 'text-info'
              : 'text-muted-foreground'
    "
    >{{ label }}<slot
  /></span>
</template>
