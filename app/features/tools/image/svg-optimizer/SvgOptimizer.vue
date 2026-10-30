<script setup lang="ts">
import DocumentFormatter from "../../developer/formatting/DocumentFormatter.vue";
</script>
<template>
  <DocumentFormatter
    language="svg"
    source-label="SVG input"
    output-label="Optimized SVG"
    copy-label="Copy SVG"
    :minify="true"
  />
  <p class="text-muted-foreground mt-4 text-xs">
    SVGO preserves IDs, viewBox and descriptions. Optimization is not sanitization. Review exported
    SVG before embedding untrusted artwork.
  </p>
</template>
