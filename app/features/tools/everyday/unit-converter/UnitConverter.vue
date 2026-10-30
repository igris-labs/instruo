<script setup lang="ts">
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { unitGroups, useUnitConverter } from "./useUnitConverter";
const {
  category,
  amount,
  fromSelection,
  toSelection,
  units,
  result,
  error,
  equivalents,
  format,
  swap,
} = useUnitConverter();
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6 @[48rem]:grid-cols-2">
      <section
        class="border-border grid content-start gap-6 rounded-lg border p-5 sm:p-6"
        aria-label="Conversion settings"
      >
        <h2 class="flex min-h-7 items-center text-base font-semibold">Your measurement</h2>
        <Field label="Category"
          ><Select
            v-model="category"
            class="w-full"
            :options="
              Object.entries(unitGroups).map(([value, item]) => ({ value, label: item.label }))
            "
        /></Field>
        <Field
          label="Amount"
          :error="error || undefined"
          ><NumberField
            v-model="amount"
            :step-snapping="false"
            :min="category === 'temperature' ? undefined : 0"
            class="w-full"
        /></Field>
        <Field label="From"
          ><Select
            v-model="fromSelection"
            class="w-full"
            :options="selectOptions(units)"
        /></Field>
      </section>
      <section
        class="bg-muted/30 grid content-start gap-6 rounded-lg p-5 sm:p-6"
        aria-label="Conversion result"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-base font-semibold">Converted measurement</h2>
          <Button
            color="secondary"
            variant="outline"
            @click="swap"
            ><Icon
              name="tabler:arrows-exchange"
              class="mr-1.5"
            />Swap units</Button
          >
        </div>
        <Field label="To"
          ><Select
            v-model="toSelection"
            class="w-full"
            :options="selectOptions(units)"
        /></Field>
        <div class="min-w-0 py-4">
          <p class="text-muted-foreground text-sm">Result</p>
          <output
            class="text-highlighted mt-2 block font-mono text-3xl font-semibold break-words tabular-nums sm:text-4xl"
            aria-live="polite"
            >{{ result }} {{ toSelection }}</output
          >
          <p class="text-muted-foreground mt-3 text-sm">
            {{ amount ?? "—" }} {{ fromSelection }} converted locally
          </p>
        </div>
        <div class="flex justify-end">
          <Button
            color="secondary"
            variant="outline"
            :disabled="!!error"
            @click="copyText(`${result} ${toSelection}`)"
            ><Icon
              name="tabler:copy"
              class="mr-1.5"
            />Copy result</Button
          >
        </div>
      </section>
    </div>
    <section aria-label="Equivalent measurements">
      <h2 class="font-semibold">The same amount, in other units</h2>
      <p class="text-muted-foreground mt-1 text-sm">
        {{
          category === "data"
            ? "KB uses 1,000 bytes; KiB uses 1,024 bytes."
            : category === "volume"
              ? "Cups, gallons, and fluid ounces use US customary definitions."
              : "Values update as you change the amount or source unit."
        }}
      </p>
      <dl class="border-border mt-4 grid gap-x-8 rounded-lg border px-5 @[30rem]:grid-cols-2">
        <div
          v-for="item in equivalents"
          :key="item.unit"
          class="border-border flex min-w-0 justify-between gap-4 border-b py-3 last:border-0"
        >
          <dt class="text-muted-foreground text-sm">{{ item.unit }}</dt>
          <dd class="text-right font-mono text-sm break-all tabular-nums">
            {{ item.value === null ? "—" : format(item.value) }}
          </dd>
        </div>
      </dl>
    </section>
  </ToolWorkspace>
</template>
