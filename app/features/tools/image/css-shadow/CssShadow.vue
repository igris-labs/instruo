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
const x = ref(0);
const y = ref(8);
const blur = ref(24);
const spread = ref(0);
const color = ref("#00000033");
const inset = ref(false);
const valid = computed(
  () =>
    [x.value, y.value, blur.value, spread.value].every(Number.isFinite) &&
    blur.value >= 0 &&
    !!parse(color.value),
);
const shadow = computed(() =>
  valid.value
    ? `${(inset.value ? "inset " : "") + x.value}px ${y.value}px ${blur.value}px ${
        spread.value
      }px ${color.value}`
    : "",
);
const output = computed(() => (shadow.value ? `box-shadow: ${shadow.value};` : ""));
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-4">
        <div class="grid grid-cols-2 gap-4">
          <Field label="X offset"
            ><NumberField
              v-model="x"
              :min="-500"
              :max="500"
              class="w-full" /></Field
          ><Field label="Y offset"
            ><NumberField
              v-model="y"
              :min="-500"
              :max="500"
              class="w-full" /></Field
          ><Field label="Blur"
            ><NumberField
              v-model="blur"
              :min="0"
              :max="500"
              class="w-full" /></Field
          ><Field label="Spread"
            ><NumberField
              v-model="spread"
              :min="-200"
              :max="200"
              class="w-full"
          /></Field>
        </div>
        <Field
          label="Shadow color"
          description="CSS colors, including alpha such as #00000033."
          ><Input
            v-model="color"
            class="w-full" /></Field
        ><Checkbox
          v-model="inset"
          label="Inset shadow"
        />
      </div>
      <div
        class="bg-muted/30 grid min-h-72 place-items-center overflow-hidden rounded-lg p-16"
        role="img"
        aria-label="Shadow preview"
      >
        <div
          class="bg-background grid size-32 place-items-center rounded-lg text-sm"
          :style="{ boxShadow: shadow }"
        >
          Preview
        </div>
      </div>
    </div>
    <StatusMessage
      v-if="!valid"
      tone="error"
      title="Check shadow"
      description="Use a valid CSS color and non-negative blur."
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
