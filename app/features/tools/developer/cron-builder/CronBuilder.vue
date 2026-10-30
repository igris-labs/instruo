<script setup lang="ts">
import { CronExpressionParser } from "cron-parser";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { dateInZone } from "../../everyday/dateMath";
const fields = reactive({ Minute: "*", Hour: "*", Day: "*", Month: "*", Weekday: "*" });
const zone = ref("UTC");
const after = ref("");
onMounted(() => (after.value = new Date().toISOString().slice(0, 16)));
const expression = computed(() =>
  Object.values(fields)
    .map((value) => value.trim())
    .join(" "),
);
const result = computed(() => {
  if (!after.value) return { dates: [] as string[], error: "" };
  try {
    if (Object.values(fields).some((value) => /\s/.test(value.trim()) || !value.trim()))
      throw new Error("Each field must contain one cron token.");
    const start = dateInZone(after.value, "UTC");
    const iterator = CronExpressionParser.parse(expression.value, {
      currentDate: start,
      tz: zone.value,
      endDate: new Date(start.getTime() + 5 * 366 * 86400000),
    });
    return {
      dates: iterator.take(5).map((date) =>
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "long",
          timeZone: zone.value,
        }).format(date.toDate()),
      ),
      error: "",
    };
  } catch (cause) {
    return { dates: [], error: (cause as Error).message };
  }
});
const { copyText } = useCopyToClipboard();
function preset(values: string[]) {
  Object.keys(fields).forEach(
    (key, index) => (fields[key as keyof typeof fields] = values[index]!),
  );
}
</script>
<template>
  <ToolWorkspace
    ><div class="flex flex-wrap gap-2">
      <Button
        color="secondary"
        variant="outline"
        @click="preset(['*/5', '*', '*', '*', '*'])"
        >Every 5 minutes</Button
      ><Button
        color="secondary"
        variant="outline"
        @click="preset(['0', '9', '*', '*', '1-5'])"
        >Weekdays at 9</Button
      ><Button
        color="secondary"
        variant="outline"
        @click="preset(['0', '0', '1', '*', '*'])"
        >Monthly</Button
      >
    </div>
    <div class="grid grid-cols-2 gap-4 @[40rem]:grid-cols-5">
      <Field
        v-for="(_, key) in fields"
        :key="key"
        :label="key"
        ><Input
          v-model="fields[key]"
          class="w-full font-mono"
      /></Field>
    </div>
    <Field label="Cron expression"
      ><Input
        :model-value="expression"
        readonly
        class="w-full font-mono"
    /></Field>
    <div class="grid gap-4 @[30rem]:grid-cols-2">
      <Field label="Schedule time zone"
        ><Select
          v-model="zone"
          class="w-full"
          :options="
            [
              'UTC',
              'Asia/Kolkata',
              'America/New_York',
              'Europe/London',
              'Asia/Tokyo',
              'Australia/Sydney',
            ].map((value) => ({ value, label: value }))
          " /></Field
      ><Field label="Preview after (UTC)"
        ><Input
          v-model="after"
          type="datetime-local"
          class="w-full"
      /></Field>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check schedule"
      :description="result.error"
    />
    <section
      v-else
      class="bg-muted/30 rounded-lg p-5"
    >
      <h2 class="mb-3 font-medium">Next five runs</h2>
      <ol class="grid gap-2 font-mono text-sm tabular-nums">
        <li
          v-for="date in result.dates"
          :key="date"
        >
          {{ date }}
        </li>
      </ol>
    </section>
    <p class="text-muted-foreground text-xs">
      Five-field cron, minute resolution. Preview uses the selected time zone, not your device zone.
      Confirm your scheduler supports the same syntax and time zone.
    </p>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!!result.error || !result.dates.length"
        @click="copyText(expression)"
        >Copy cron</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
