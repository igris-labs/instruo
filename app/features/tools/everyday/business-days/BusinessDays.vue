<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { calculateBusinessDays } from "./calculateBusinessDays";
const start = ref("2026-01-01");
const end = ref("2026-01-31");
const holidays = ref("2026-01-26");
const includeEndpoints = ref(true);
const weekendDays = reactive<Record<number, boolean>>({ 0: true, 6: true });
const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const result = computed(() => {
  try {
    return {
      data: calculateBusinessDays(
        start.value,
        end.value,
        holidays.value,
        names.flatMap((_, index) => (weekendDays[index] ? [index] : [])),
        includeEndpoints.value,
      ),
      error: "",
    };
  } catch (cause) {
    return { data: null, error: cause instanceof Error ? cause.message : "Check dates." };
  }
});
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-5">
        <div class="grid gap-4 @[30rem]:grid-cols-2">
          <Field label="Start date"
            ><Input
              v-model="start"
              type="date"
              class="w-full" /></Field
          ><Field label="End date"
            ><Input
              v-model="end"
              type="date"
              class="w-full"
          /></Field>
        </div>
        <Field
          v-slot="{ controlProps }"
          label="Holiday dates"
          description="YYYY-MM-DD, separated by spaces, commas or new lines. Duplicates count once."
          ><Textarea
            v-bind="controlProps"
            v-model="holidays"
            :rows="4"
            class="w-full" /></Field
        ><Checkbox
          v-model="includeEndpoints"
          label="Include start and end dates"
        />
        <fieldset>
          <legend class="mb-3 text-sm font-medium">Non-working weekdays</legend>
          <div class="flex flex-wrap gap-3">
            <Checkbox
              v-for="(name, index) in names"
              :key="name"
              v-model="weekendDays[index]"
              :label="name"
            />
          </div>
        </fieldset>
      </div>
      <section
        v-if="result.data"
        aria-label="Business days result"
        class="bg-muted/40 grid gap-5 rounded-lg p-6"
      >
        <p class="text-muted-foreground text-sm">Working days</p>
        <output class="text-5xl font-semibold tabular-nums">{{ result.data.working }}</output>
        <dl class="grid grid-cols-3 gap-3 text-sm">
          <div
            v-for="(value, key) in {
              'Calendar days': result.data.calendar,
              'Weekend days': result.data.weekend,
              'Holidays skipped': result.data.skippedHolidays,
            }"
            :key="key"
          >
            <dt class="text-muted-foreground">{{ key }}</dt>
            <dd class="mt-1 text-xl font-semibold tabular-nums">{{ value }}</dd>
          </div>
        </dl>
        <p class="text-muted-foreground text-xs">
          No regional holiday calendar is assumed. Only supplied holidays on working weekdays are
          deducted.
        </p>
      </section>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check dates"
      :description="result.error"
    /><ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.data"
        @click="
          copyText(result.data ? `${result.data.working} working days from ${start} to ${end}` : '')
        "
        >Copy result</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
