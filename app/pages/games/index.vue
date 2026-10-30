<script setup lang="ts">
import ResourceDirectory from "../../components/product/ResourceDirectory.vue";
definePageMeta({ layout: "workspace" });
useHead({ title: "Games" });
</script>
<template><ResourceDirectory kind="game" /></template>
