<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { dateInZone } from "../dateMath";

const dateTime = ref("2026-01-15T09:00");
const referenceZone = ref("UTC");
const reference = computed(() => {
  try {
    return dateInZone(dateTime.value, referenceZone.value);
  } catch {
    return null;
  }
});
onMounted(() => {
  dateTime.value = new Date().toISOString().slice(0, 16);
});
const zones = [
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];
const selectedZones = ref(["America/Los_Angeles", "Europe/London", "Asia/Kolkata", "Asia/Tokyo"]);
const labels = ["You", "Partner 1", "Partner 2", "Partner 3"];
const { copyText } = useCopyToClipboard();
function format(zone: string) {
  const value = reference.value;
  if (!value) return "Choose a valid reference time";
  return new Intl.DateTimeFormat(undefined, {
    timeZone: zone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}
function hour(zone: string) {
  const value = reference.value;
  if (!value) return -1;
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", hourCycle: "h23" }).format(
      value,
    ),
  );
}
const summary = computed(() =>
  selectedZones.value
    .map((zone, index) => `${labels[index]} · ${zone} · ${format(zone)}`)
    .join("\n"),
);
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <Field label="Reference time"
        ><Input
          v-model="dateTime"
          type="datetime-local"
          class="w-full max-w-sm"
        ></Input
      ></Field>
      <Field
        label="Reference time zone"
        description="Ambiguous or skipped daylight-saving times are rejected."
        ><Select
          v-model="referenceZone"
          class="w-full"
          :options="selectOptions(zones)"
      /></Field>
      <div class="grid gap-4 @[30rem]:grid-cols-2">
        <Field
          v-for="(zone, index) in selectedZones"
          :key="index"
          :label="labels[index]!"
          ><Select
            v-model="selectedZones[index]"
            class="w-full"
            :options="selectOptions(zones)"
          ></Select
        ></Field>
      </div>
      <div class="grid gap-3 @[30rem]:grid-cols-2">
        <div
          v-for="(zone, index) in selectedZones"
          :key="`${zone}-${index}`"
          class="border-border bg-muted/20 rounded-md border p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-muted-foreground text-sm">{{ zone }}</p>
            <span
              class="text-xs"
              :class="hour(zone) >= 9 && hour(zone) < 18 ? 'text-success' : 'text-muted-foreground'"
              >{{ hour(zone) >= 9 && hour(zone) < 18 ? "Work hours" : "Outside work hours" }}</span
            >
          </div>
          <p class="text-highlighted mt-3 text-lg font-semibold">{{ format(zone) }}</p>
        </div>
      </div>
      <ToolActions>
        <Button
          color="secondary"
          variant="outline"
          :disabled="!reference"
          @click="copyText(summary)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy time summary</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
