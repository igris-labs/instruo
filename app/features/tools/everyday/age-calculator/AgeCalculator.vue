<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { calculateAge } from "./calculateAge";
const birthDate = ref("1990-01-01");
const today = ref("");
onMounted(
  () =>
    (today.value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10)),
);
const result = computed(() => {
  try {
    return { data: calculateAge(birthDate.value, today.value), error: "" };
  } catch (cause) {
    return { data: null, error: cause instanceof Error ? cause.message : "Check dates." };
  }
});
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-5">
        <Field label="Birth date"
          ><Input
            v-model="birthDate"
            class="w-full"
            type="date"
        /></Field>
        <Field label="As of"
          ><Input
            v-model="today"
            class="w-full"
            type="date"
        /></Field>
        <p class="text-muted-foreground text-xs">
          Calendar age, including complete months and days. February 29 anniversaries use February
          28 in non-leap years.
        </p>
      </div>
      <section
        v-if="result.data"
        class="bg-muted/40 grid gap-5 rounded-lg p-6"
        aria-label="Age result"
      >
        <p class="text-muted-foreground text-sm">Age</p>
        <output class="text-3xl font-semibold tabular-nums"
          >{{ result.data.years }} years, {{ result.data.months }} months,
          {{ result.data.days }} days</output
        >
        <dl class="grid gap-3 text-sm">
          <div>
            <dt class="text-muted-foreground">Total days</dt>
            <dd class="font-mono">{{ result.data.totalDays.toLocaleString() }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">Next birthday</dt>
            <dd>{{ result.data.next }} · {{ result.data.until }} days away</dd>
          </div>
        </dl>
      </section>
    </div>
    <StatusMessage
      v-if="result.error && today"
      tone="error"
      title="Check dates"
      :description="result.error"
    />
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.data"
        @click="
          copyText(
            result.data
              ? `${result.data.years} years, ${result.data.months} months, ${result.data.days} days`
              : '',
          )
        "
        >Copy age</Button
      ></ToolActions
    >
  </ToolWorkspace>
</template>
