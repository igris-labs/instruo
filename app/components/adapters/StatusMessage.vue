<script setup lang="ts">
defineProps<{ title?: string; description?: string; tone?: string; icon?: string }>();
</script>
<template>
  <div
    :role="tone === 'error' ? 'alert' : 'status'"
    class="bg-muted/50 flex min-w-0 gap-3 rounded-lg p-4 text-sm"
    :data-tone="tone"
  >
    <Icon
      v-if="icon"
      :name="icon"
      mode="svg"
      class="mt-0.5 size-5 shrink-0"
      :class="
        tone === 'error'
          ? 'text-destructive'
          : tone === 'warning'
            ? 'text-warning'
            : tone === 'success'
              ? 'text-success'
              : 'text-muted-foreground'
      "
      aria-hidden="true"
    />
    <div class="min-w-0">
      <p
        v-if="title"
        class="font-medium"
        :class="
          tone === 'error'
            ? 'text-destructive'
            : tone === 'success'
              ? 'text-success'
              : tone === 'warning'
                ? 'text-warning'
                : undefined
        "
      >
        {{ title }}
      </p>
      <p
        v-if="description"
        class="text-muted-foreground mt-1 leading-6 break-words whitespace-pre-wrap"
      >
        {{ description }}
      </p>
      <slot />
    </div>
  </div>
</template>
