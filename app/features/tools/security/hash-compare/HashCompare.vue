<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";

import { useToolTask } from "~/features/tools/useToolTask";
const algorithm = ref("SHA-256");
const mode = ref<"values" | "hash">("values");
const first = ref("");
const second = ref("");
const { output, error, busy, run } = useToolTask([first, second, algorithm, mode]);
async function compare() {
  await run(async () => {
    if (first.value.length + second.value.length > 2_000_000)
      throw new Error("Use values smaller than 2 million characters combined.");
    const firstDigest = await crypto.subtle.digest(
      algorithm.value,
      new TextEncoder().encode(first.value),
    );
    const firstHex = Array.from(new Uint8Array(firstDigest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    if (mode.value === "hash") {
      const expected = second.value.trim().toLowerCase().replace(/^0x/, "");
      return JSON.stringify(
        { equal: firstHex === expected, algorithm: algorithm.value, digest: firstHex, expected },
        null,
        2,
      );
    }
    const secondDigest = await crypto.subtle.digest(
      algorithm.value,
      new TextEncoder().encode(second.value),
    );
    const secondHex = Array.from(new Uint8Array(secondDigest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    return JSON.stringify(
      {
        equal: firstHex === secondHex,
        algorithm: algorithm.value,
        firstDigest: firstHex,
        secondDigest: secondHex,
      },
      null,
      2,
    );
  });
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <Field label="Comparison mode"
        ><Select
          v-model="mode"
          class="w-full sm:max-w-xs"
          :options="
            selectOptions([
              { label: 'Compare two values', value: 'values' },
              { label: 'Verify a value against a hash', value: 'hash' },
            ])
          "
        ></Select></Field
      ><Field label="Digest algorithm"
        ><Select
          v-model="algorithm"
          class="w-full sm:max-w-xs"
          :options="selectOptions(['SHA-256', 'SHA-384', 'SHA-512'])"
        ></Select
      ></Field>
      <div class="grid gap-5 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="Value to hash"
          ><Textarea
            v-bind="controlProps"
            v-model="first"
            class="w-full"
            :rows="7"
            placeholder="Paste a value"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          :label="mode === 'hash' ? 'Expected hexadecimal hash' : 'Second value'"
          ><Textarea
            v-bind="controlProps"
            v-model="second"
            class="w-full"
            :rows="7"
            :placeholder="mode === 'hash' ? 'e3b0c442…' : 'Paste a second value'"
          ></Textarea
        ></Field>
      </div>
      <Field
        v-slot="{ controlProps }"
        label="Output"
        :error="error || undefined"
        class="min-w-0"
        ><Textarea
          v-bind="controlProps"
          v-model="output"
          :rows="4"
          readonly
          class="w-full font-mono"
        ></Textarea
      ></Field>
      <ToolActions>
        <Button
          class="w-fit"
          :disabled="busy"
          @click="compare"
          ><Icon
            name="tabler:git-compare"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Compare values</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
