<script setup lang="ts">
const principal = ref(250000);
const annualRate = ref(7.5);
const months = ref(60);
const monthly = computed(() => {
  const p = Number(principal.value) || 0;
  const n = Math.max(1, Number(months.value) || 1);
  const r = (Number(annualRate.value) || 0) / 1200;
  return r === 0 ? p / n : (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
});
const total = computed(() => monthly.value * Math.max(1, Number(months.value) || 1));
const format = (value: number) =>
  value.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
</script>

<template>
  <ToolWorkbench description="Estimate monthly loan payments and total repayment locally.">
    <div class="grid max-w-2xl gap-5">
      <div class="grid gap-4 sm:grid-cols-3">
        <UiField label="Loan amount">
          <UiNumberField
            v-model="principal"
            :step-snapping="false"
            :min="0"
          />
        </UiField>
        <UiField label="Annual rate (%)">
          <UiNumberField
            v-model="annualRate"
            :step-snapping="false"
            :min="0"
            :step="0.01"
          />
        </UiField>
        <UiField label="Term (months)">
          <UiNumberField
            v-model="months"
            :step-snapping="false"
            :min="1"
          />
        </UiField>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <UiNotice
          tone="primary"
          title="Estimated monthly payment"
          :description="format(monthly)"
        />
        <UiNotice
          tone="neutral"
          title="Total repayment"
          :description="format(total)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
