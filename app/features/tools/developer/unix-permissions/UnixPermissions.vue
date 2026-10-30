<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

const input = ref("755");
const { copyText: copy } = useCopyToClipboard();
function toggle(group: number, bit: number, enabled: boolean) {
  const digits = /^[0-7]{3}$/.test(input.value) ? [...input.value].map(Number) : [0, 0, 0];
  digits[group] = enabled ? digits[group]! | bit : digits[group]! & ~bit;
  input.value = digits.join("");
}
const result = computed(() => {
  if (!/^[0-7]{3}$/.test(input.value))
    return { symbolic: "", command: "", error: "Use three octal digits, such as 755." };
  const symbolic = [...input.value]
    .map((digit) =>
      [4, 2, 1].map((bit, index) => (Number(digit) & bit ? ["r", "w", "x"][index] : "-")).join(""),
    )
    .join("");
  return { symbolic, command: `chmod ${input.value} file`, error: "" };
});
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6">
      <Field
        label="Octal mode"
        description="Examples: 644, 755, 700."
        :error="result.error || undefined"
        ><Input
          v-model="input"
          inputmode="numeric"
          :maxlength="3"
          class="w-full font-mono"
        ></Input
      ></Field>
      <div class="grid gap-3 @[30rem]:grid-cols-3">
        <section
          v-for="(group, index) in ['Owner', 'Group', 'Others']"
          :key="group"
          class="bg-muted/20 rounded-lg p-4"
        >
          <h2 class="mb-3 font-medium">{{ group }}</h2>
          <div class="grid gap-2">
            <Checkbox
              v-for="permission in [
                { bit: 4, label: 'Read' },
                { bit: 2, label: 'Write' },
                { bit: 1, label: 'Execute' },
              ]"
              :key="permission.bit"
              :model-value="Boolean(Number(input[index]) & permission.bit)"
              :label="`${group} ${permission.label}`"
              @update:model-value="toggle(index, permission.bit, Boolean($event))"
            />
          </div>
        </section>
      </div>
      <div class="border-border/70 grid gap-3 rounded-lg border p-5">
        <span class="text-muted-foreground text-xs uppercase">Symbolic mode</span
        ><strong class="text-highlighted font-mono text-3xl">{{
          result.symbolic || "---------"
        }}</strong
        ><code class="text-muted-foreground text-sm">{{ result.command || "chmod 755 file" }}</code>
      </div>
      <p class="text-muted-foreground text-sm">
        Three-digit Unix permissions only. Replace “file” with your path before running chmod.
        Special bits and ACLs are not included.
      </p>
      <ToolActions
        ><Button
          color="secondary"
          variant="outline"
          :disabled="!result.command"
          @click="copy(result.command)"
          >{{ "Copy command" }}</Button
        ></ToolActions
      >
    </div>
  </ToolWorkspace>
</template>
