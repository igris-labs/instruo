<script setup lang="ts">
const minute = ref("*");
const hour = ref("*");
const day = ref("*");
const month = ref("*");
const weekday = ref("*");
const expression = computed(
  () => `${minute.value} ${hour.value} ${day.value} ${month.value} ${weekday.value}`,
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkbench description="Build a five-field cron schedule from familiar fields.">
    <div class="grid gap-5">
      <div class="grid gap-4 sm:grid-cols-5">
        <UiField label="Minute">
          <UiInput
            v-model="minute"
            placeholder="*"
          /> </UiField
        ><UiField label="Hour">
          <UiInput
            v-model="hour"
            placeholder="*"
          /> </UiField
        ><UiField label="Day">
          <UiInput
            v-model="day"
            placeholder="*"
          /> </UiField
        ><UiField label="Month">
          <UiInput
            v-model="month"
            placeholder="*"
          /> </UiField
        ><UiField label="Weekday">
          <UiInput
            v-model="weekday"
            placeholder="*"
          />
        </UiField>
      </div>
      <UiInput
        :model-value="expression"
        readonly
        class="font-mono"
      />
      <div class="flex justify-end">
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy cron"
          icon="i-tabler-copy"
          @click="copyText(expression)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
