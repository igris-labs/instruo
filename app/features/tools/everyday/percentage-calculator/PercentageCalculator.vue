<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { calculatePercentage } from "./calculatePercentage";
const value = ref(100);
const percent = ref(15);
const mode = ref("of");
const result = computed(() => {
  try {
    return { value: calculatePercentage(value.value, percent.value, mode.value), error: "" };
  } catch (cause) {
    return { value: null, error: cause instanceof Error ? cause.message : "Check numbers." };
  }
});
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-5">
        <Field label="Calculation"
          ><Select
            v-model="mode"
            class="w-full"
            :options="[
              { value: 'of', label: 'Percentage of a number' },
              { value: 'ratio', label: 'What percentage is it?' },
              { value: 'change', label: 'Percentage change' },
              { value: 'increase', label: 'Increase by a percentage' },
              { value: 'decrease', label: 'Decrease by a percentage' },
            ]"
        /></Field>
        <Field
          :label="mode === 'change' ? 'Starting value' : mode === 'ratio' ? 'Base value' : 'Number'"
          ><NumberField
            v-model="value"
            class="w-full"
            :step-snapping="false"
        /></Field>
        <Field
          :label="mode === 'change' ? 'New value' : mode === 'ratio' ? 'Part value' : 'Percentage'"
          ><NumberField
            v-model="percent"
            class="w-full"
            :step-snapping="false"
        /></Field>
      </div>
      <section
        class="bg-muted/40 grid content-start gap-4 rounded-lg p-6"
        aria-label="Percentage result"
      >
        <p class="text-muted-foreground text-sm">Answer</p>
        <output class="text-4xl font-semibold break-all tabular-nums"
          >{{
            result.value === null
              ? "—"
              : Number(result.value.toPrecision(12)).toLocaleString(undefined, {
                  maximumFractionDigits: 8,
                })
          }}{{ ["ratio", "change"].includes(mode) && result.value !== null ? "%" : "" }}</output
        >
        <p class="text-muted-foreground text-sm">
          {{
            mode === "of"
              ? `${percent}% of ${value}`
              : mode === "ratio"
                ? "Part ÷ base × 100"
                : mode === "change"
                  ? "(New − starting) ÷ |starting| × 100"
                  : mode === "increase"
                    ? "Number × (1 + percentage ÷ 100)"
                    : "Number × (1 − percentage ÷ 100)"
          }}
        </p>
      </section>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check numbers"
      :description="result.error"
    /><ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="result.value === null"
        @click="copyText(String(result.value))"
        >Copy result</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
