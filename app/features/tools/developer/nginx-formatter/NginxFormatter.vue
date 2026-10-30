<script setup lang="ts">
import DocumentFormatter from "../formatting/DocumentFormatter.vue";
</script>
<template>
  <DocumentFormatter
    language="nginx"
    source-label="Nginx configuration"
    output-label="Formatted Nginx configuration"
    copy-label="Copy configuration"
  />
  <p class="text-muted-foreground mt-4 text-xs">
    Quoted strings, variables and comments are preserved. This formatter does not replace nginx -t.
  </p>
</template>
