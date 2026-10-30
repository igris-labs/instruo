<script setup lang="ts">
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { useTipSplitter } from "./useTipSplitter";
const { bill, tipPercent, people, currency, result, money, summary } = useTipSplitter();
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6 @[48rem]:grid-cols-2">
      <section
        class="border-border grid content-start gap-6 rounded-lg border p-5 sm:p-6"
        aria-label="Bill settings"
      >
        <h2 class="font-semibold">Split the bill</h2>
        <div class="grid gap-5 @[30rem]:grid-cols-2">
          <Field label="Bill total"
            ><NumberField
              v-model="bill"
              :step-snapping="false"
              :min="0"
              class="w-full" /></Field
          ><Field label="Currency"
            ><Select
              v-model="currency"
              class="w-full"
              :options="selectOptions(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'])"
          /></Field>
        </div>
        <Field label="Tip (%)"
          ><NumberField
            v-model="tipPercent"
            :step-snapping="false"
            :min="0"
            :max="100"
            class="w-full"
        /></Field>
        <div
          class="flex flex-wrap gap-2"
          role="group"
          aria-label="Tip presets"
        >
          <Button
            v-for="preset in [0, 10, 15, 18, 20, 25]"
            :key="preset"
            color="secondary"
            :variant="tipPercent === preset ? 'soft' : 'outline'"
            :aria-pressed="tipPercent === preset"
            @click="tipPercent = preset"
            >{{ preset }}%</Button
          >
        </div>
        <Field
          label="People"
          :error="result ? undefined : 'Enter a bill, tip, and a whole number of people.'"
          ><NumberField
            v-model="people"
            :min="1"
            :max="1000"
            :step="1"
            class="w-full"
        /></Field>
      </section>
      <section
        class="bg-muted/30 grid content-start gap-6 rounded-lg p-5 sm:p-6"
        aria-label="Bill breakdown"
      >
        <div>
          <h2 class="text-sm font-medium">Per person</h2>
          <output
            class="mt-3 block font-mono text-4xl font-semibold tabular-nums sm:text-5xl"
            aria-live="polite"
            >{{ result ? money(result.share) : "—" }}</output
          >
          <p class="text-muted-foreground mt-3 text-sm">
            {{
              result?.extraPeople
                ? `${result.extraPeople} ${result.extraPeople === 1 ? "person pays" : "people pay"} ${money(result.extraShare)} to cover rounding.`
                : `Split equally between ${people ?? "—"} people.`
            }}
          </p>
        </div>
        <dl class="grid gap-4 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Bill before tip</dt>
            <dd class="font-mono tabular-nums">{{ result ? money(result.bill) : "—" }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-muted-foreground">Tip · {{ tipPercent ?? 0 }}%</dt>
            <dd class="font-mono tabular-nums">{{ result ? money(result.tip) : "—" }}</dd>
          </div>
          <div class="border-border flex justify-between gap-4 border-t pt-4 font-semibold">
            <dt>Total to pay</dt>
            <dd class="font-mono tabular-nums">{{ result ? money(result.total) : "—" }}</dd>
          </div>
        </dl>
        <div class="flex justify-end">
          <Button
            color="secondary"
            variant="outline"
            :disabled="!result"
            @click="copyText(summary)"
            ><Icon
              name="tabler:copy"
              class="mr-1.5"
            />Copy breakdown</Button
          >
        </div>
      </section>
    </div>
  </ToolWorkspace>
</template>
