<script setup lang="ts">
import DocumentFormatter from "../formatting/DocumentFormatter.vue";
</script>
<template>
  <DocumentFormatter
    language="graphql"
    source-label="GraphQL document"
    output-label="Formatted query"
    copy-label="Copy query"
    initial="query User($id: ID!) { user(id: $id) { id name email } }"
  />
</template>
