<script setup lang="ts">
import { parse } from "culori";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
const start = ref("#f97316");
const end = ref("#fde68a");
const middle = ref("#fb7185");
const angle = ref(135);
const kind = ref("linear");
const third = ref(false);
const valid = computed(
  () =>
    !!parse(start.value) &&
    !!parse(end.value) &&
    (!third.value || !!parse(middle.value)) &&
    Number.isFinite(angle.value),
);
const gradient = computed(() => {
  if (!valid.value) return "";
  const stops = `${start.value + (third.value ? `, ${middle.value}` : "")}, ${end.value}`;
  return kind.value === "radial"
    ? `radial-gradient(circle, ${stops})`
    : kind.value === "conic"
      ? `conic-gradient(from ${angle.value}deg, ${stops}, ${start.value})`
      : `linear-gradient(${angle.value}deg, ${stops})`;
});
const output = computed(() => (gradient.value ? `background: ${gradient.value};` : ""));
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace
    ><div class="grid gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-4">
        <Field label="Gradient type"
          ><Select
            v-model="kind"
            class="w-full"
            :options="[
              { value: 'linear', label: 'Linear' },
              { value: 'radial', label: 'Radial' },
              { value: 'conic', label: 'Conic' },
            ]"
        /></Field>
        <div class="grid grid-cols-2 gap-4">
          <Field label="Start color"
            ><Input
              v-model="start"
              class="w-full" /></Field
          ><Field label="End color"
            ><Input
              v-model="end"
              class="w-full"
          /></Field>
        </div>
        <Checkbox
          v-model="third"
          label="Add a middle color stop"
        /><Field
          v-if="third"
          label="Middle color"
          ><Input
            v-model="middle"
            class="w-full" /></Field
        ><Field
          v-if="kind !== 'radial'"
          label="Angle (degrees)"
          ><NumberField
            v-model="angle"
            :min="0"
            :max="360"
            class="w-full"
        /></Field>
      </div>
      <div
        role="img"
        aria-label="Gradient preview"
        class="bg-muted min-h-64 rounded-lg"
        :style="{ background: gradient }"
      />
    </div>
    <StatusMessage
      v-if="!valid"
      tone="error"
      title="Check gradient"
      description="Enter valid CSS colors and a finite angle."
    /><Field
      v-slot="{ controlProps }"
      label="Generated CSS"
      ><Textarea
        v-bind="controlProps"
        :model-value="output"
        readonly
        language="css"
        :rows="4"
        class="w-full" /></Field
    ><ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!output"
        @click="copyText(output)"
        >Copy CSS</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
