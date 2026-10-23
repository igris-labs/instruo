<script setup lang="ts">
const value = ref(100);
const percent = ref(15);
const result = computed(() => ((Number(value.value) || 0) * (Number(percent.value) || 0)) / 100);
</script>

<template>
  <ToolWorkbench description="Calculate a percentage of any number without leaving the page.">
    <div class="grid max-w-xl gap-5 sm:grid-cols-2">
      <UiField label="Number">
        <UiNumberField
          v-model="value"
          :step-snapping="false"
        />
      </UiField>
      <UiField label="Percentage">
        <UiNumberField
          v-model="percent"
          :step-snapping="false"
        />
      </UiField>
      <UiNotice
        class="sm:col-span-2"
        tone="primary"
        title="Answer"
        :description="`${percent}% of ${value} = ${result}`"
      />
    </div>
  </ToolWorkbench>
</template>
