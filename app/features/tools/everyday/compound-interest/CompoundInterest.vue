<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTable } from "~/components/ui/data-table";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
import { calculateCompound } from "./calculateCompound";
const principal = ref(10000);
const rate = ref(7);
const currency = ref("USD");
const contribution = ref(250);
const years = ref(10);
const frequency = ref("12");
const beginning = ref(false);
const result = computed(() => {
  try {
    return {
      data: calculateCompound(
        principal.value,
        contribution.value,
        rate.value,
        years.value,
        Number(frequency.value),
        beginning.value,
      ),
      error: "",
    };
  } catch (cause) {
    return { data: null, error: cause instanceof Error ? cause.message : "Check values." };
  }
});
const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.value,
    maximumFractionDigits: 2,
  }).format(value);
const rows = computed(
  () =>
    result.value.data?.rows.map((row) => ({
      year: row.year,
      contributed: money(row.contributed),
      interest: money(row.interest),
      value: money(row.value),
    })) ?? [],
);
const columns = [
  { accessor: "year", header: "Year" },
  { accessor: "contributed", header: "Contributions" },
  { accessor: "interest", header: "Growth" },
  { accessor: "value", header: "Balance" },
] as const;
const { copyText } = useCopyToClipboard();
function download() {
  if (!result.value.data) return;
  const values = result.value.data.rows.map((row) => [
    row.year,
    row.contributed.toFixed(2),
    row.interest.toFixed(2),
    row.value.toFixed(2),
  ]);
  downloadBlob(
    new Blob(
      [`Year,Contributions,Growth,Balance` + `\n${values.map((row) => row.join(",")).join("\n")}`],
      { type: "text/csv" },
    ),
    "compound-schedule.csv",
  );
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-5">
        <Field label="Starting balance"
          ><NumberField
            v-model="principal"
            :step-snapping="false"
            :min="0"
            class="w-full"
        /></Field>
        <Field
          label="Contribution per compounding period"
          description="Added once each selected period, not always monthly."
          ><NumberField
            v-model="contribution"
            :step-snapping="false"
            :min="0"
            class="w-full"
        /></Field>
        <div class="grid gap-4 @[30rem]:grid-cols-2">
          <Field label="Annual return (%)"
            ><NumberField
              v-model="rate"
              :step-snapping="false"
              :min="-99"
              :max="100"
              :step="0.1"
              class="w-full" /></Field
          ><Field label="Years"
            ><NumberField
              v-model="years"
              :min="1"
              :max="100"
              class="w-full"
          /></Field>
        </div>
        <Field label="Compounding and contribution frequency"
          ><Select
            v-model="frequency"
            class="w-full"
            :options="[
              { value: '12', label: 'Monthly' },
              { value: '4', label: 'Quarterly' },
              { value: '1', label: 'Annually' },
            ]" /></Field
        ><Checkbox
          v-model="beginning"
          label="Contribute at the beginning of each period"
        />
        <Field
          label="Display currency"
          description="Formatting only. No currency conversion."
          ><Select
            v-model="currency"
            class="w-full"
            :options="
              ['USD', 'INR', 'EUR', 'GBP', 'JPY'].map((value) => ({ value, label: value }))
            "
        /></Field>
      </div>
      <section
        v-if="result.data"
        class="bg-muted/40 grid gap-5 rounded-lg p-6"
        aria-label="Compound growth estimate"
      >
        <p class="text-muted-foreground text-sm">Estimated balance</p>
        <output class="text-4xl font-semibold break-all tabular-nums">{{
          money(result.data.value)
        }}</output>
        <dl class="grid gap-4 text-sm">
          <div>
            <dt class="text-muted-foreground">Total contributions</dt>
            <dd class="mt-1 text-xl font-semibold tabular-nums">
              {{ money(result.data.contributed) }}
            </dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Growth</dt>
            <dd class="mt-1 text-xl font-semibold tabular-nums">
              {{ money(result.data.interest) }}
            </dd>
          </div>
        </dl>
        <p class="text-muted-foreground text-xs">
          Illustrative math only; actual returns, fees, taxes, and compounding rules vary. Negative
          returns can reduce your balance.
        </p>
      </section>
    </div>
    <StatusMessage
      v-if="result.error"
      tone="error"
      title="Check values"
      :description="result.error"
    />
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.data"
        @click="download"
        >Download schedule CSV</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.data"
        @click="copyText(result.data ? money(result.data.value) : '')"
        >Copy result</Button
      ></ToolActions
    >
    <DataTable
      v-if="result.data"
      :data="rows"
      :columns="columns"
      row-key="year"
      :paginate="true"
      :show-pagination="true"
      caption="Year-by-year estimate"
      :ui="{ viewport: 'max-h-96' }"
    />
  </ToolWorkspace>
</template>
