<script setup lang="ts">
import DocumentFormatter from "../formatting/DocumentFormatter.vue";
</script>
<template>
  <DocumentFormatter
    language="docker"
    source-label="Dockerfile"
    output-label="Formatted Dockerfile"
    copy-label="Copy Dockerfile"
  />
  <p class="text-muted-foreground mt-4 text-xs">
    Conservative instruction casing preserves shell strings, continuations and heredocs. Validate
    the result with your Docker build.
  </p>
</template>
