<script setup lang="ts">
import DocumentFormatter from "../formatting/DocumentFormatter.vue";
</script>
<template>
  <DocumentFormatter
    language="css"
    source-label="CSS input"
    output-label="Minified CSS"
    copy-label="Copy CSS"
    minify
  />
</template>
