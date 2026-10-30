<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { dateInZone } from "../dateMath";

const dateTime = ref("");
const sourceTimezone = ref("UTC");
const targetTimezone = ref("Asia/Kolkata");
const timezones = [
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
];
function zonedDateToUtc(value: string, zone: string) {
  return dateInZone(value, zone);
}
const output = computed(() => {
  if (!dateTime.value) return "Choose a date and time to convert.";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: targetTimezone.value,
    }).format(zonedDateToUtc(dateTime.value, sourceTimezone.value));
  } catch {
    return "Choose a valid date and time.";
  }
});

onMounted(() => {
  dateTime.value = new Date().toISOString().slice(0, 16);
});
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="grid gap-4 @[30rem]:grid-cols-2">
        <Field label="Date and time"
          ><Input
            v-model="dateTime"
            class="w-full"
            type="datetime-local"
          ></Input></Field
        ><Field label="Input time zone"
          ><Select
            v-model="sourceTimezone"
            :options="selectOptions(timezones)"
            class="w-full"
          ></Select></Field
        ><Field label="Convert to"
          ><Select
            v-model="targetTimezone"
            :options="selectOptions(timezones)"
            class="w-full"
          ></Select
        ></Field>
      </div>
      <StatusMessage
        tone="neutral"
        title="Converted time"
        :description="output"
        icon="tabler:clock"
      ></StatusMessage>
    </div>
  </ToolWorkspace>
</template>
