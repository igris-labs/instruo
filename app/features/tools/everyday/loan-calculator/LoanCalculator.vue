<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { downloadBlob } from "~/utils/browser-tools";
import { calculateLoan } from "./calculateLoan";
const principal = ref(250000);
const rate = ref(7.5);
const currency = ref("USD");
const months = ref(60);
const result = computed(() => {
  try {
    return { data: calculateLoan(principal.value, rate.value, months.value), error: "" };
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
    result.value.data?.schedule.map((row) => ({
      month: row.month,
      payment: money(row.payment),
      principal: money(row.principal),
      interest: money(row.interest),
      balance: money(row.balance),
    })) ?? [],
);
const columns = [
  { accessor: "month", header: "Month" },
  { accessor: "payment", header: "Payment" },
  { accessor: "principal", header: "Principal" },
  { accessor: "interest", header: "Interest" },
  { accessor: "balance", header: "Balance" },
] as const;
const { copyText } = useCopyToClipboard();
function download() {
  if (!result.value.data) return;
  const values = result.value.data.schedule.map((row) => [
    row.month,
    row.payment.toFixed(2),
    row.principal.toFixed(2),
    row.interest.toFixed(2),
    row.balance.toFixed(2),
  ]);
  downloadBlob(
    new Blob(
      [
        `Month,Payment,Principal,Interest,Balance` +
          `\n${values.map((row) => row.join(",")).join("\n")}`,
      ],
      { type: "text/csv" },
    ),
    "loan-schedule.csv",
  );
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-5">
        <Field label="Loan amount"
          ><NumberField
            v-model="principal"
            :step-snapping="false"
            :min="0"
            class="w-full"
        /></Field>

        <div class="grid gap-4 @[30rem]:grid-cols-2">
          <Field label="Annual rate (%)"
            ><NumberField
              v-model="rate"
              :step-snapping="false"
              :min="0"
              :max="100"
              :step="0.1"
              class="w-full" /></Field
          ><Field label="Term (months)"
            ><NumberField
              v-model="months"
              :min="1"
              :max="1200"
              class="w-full"
          /></Field>
        </div>

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
        aria-label="Loan estimate"
      >
        <p class="text-muted-foreground text-sm">Estimated monthly payment</p>
        <output class="text-4xl font-semibold break-all tabular-nums">{{
          money(result.data.monthly)
        }}</output>
        <dl class="grid gap-4 text-sm">
          <div>
            <dt class="text-muted-foreground">Total repayment</dt>
            <dd class="mt-1 text-xl font-semibold tabular-nums">{{ money(result.data.total) }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Total interest</dt>
            <dd class="mt-1 text-xl font-semibold tabular-nums">
              {{ money(result.data.interest) }}
            </dd>
          </div>
        </dl>
        <p class="text-muted-foreground text-xs">
          Fixed-rate, monthly payments. Excludes fees, insurance and taxes. Values are estimates,
          not a lender quote.
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
        @click="copyText(result.data ? money(result.data.monthly) : '')"
        >Copy result</Button
      ></ToolActions
    >
    <DataTable
      v-if="result.data"
      :data="rows"
      :columns="columns"
      row-key="month"
      :paginate="true"
      :show-pagination="true"
      caption="Monthly amortization schedule"
      :ui="{ viewport: 'max-h-96' }"
    />
  </ToolWorkspace>
</template>
