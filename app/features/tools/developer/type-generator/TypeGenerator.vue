<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { generateContract } from "./logic";

type Target = "typescript" | "zod" | "valibot" | "typebox";
const source = ref(`{"name":"Ada","age":36,"active":true}`);
const name = ref("User");
const target = ref<Target>("typescript");
const { copyText } = useCopyToClipboard();

const targets = [
  { label: "TypeScript", value: "typescript" },
  { label: "Zod", value: "zod" },
  { label: "Valibot", value: "valibot" },
  { label: "TypeBox", value: "typebox" },
];
const parsed = computed(() => {
  try {
    if (source.value.length > 200_000)
      throw new Error("Use a sample shorter than 200,000 characters.");
    return { value: JSON.parse(source.value) as unknown, error: "" };
  } catch {
    return { value: null, error: "Input must be valid JSON." };
  }
});
const output = computed(() => {
  if (parsed.value.error) return "";
  try {
    return generateContract(parsed.value.value, name.value, target.value);
  } catch {
    return "";
  }
});
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="grid gap-4 @[30rem]:grid-cols-[minmax(0,1fr)_12rem]">
        <Field label="Root name"
          ><Input
            v-model="name"
            class="w-full"
          ></Input></Field
        ><Field label="Target"
          ><Select
            v-model="target"
            class="w-full"
            :options="selectOptions(targets)"
          ></Select
        ></Field>
      </div>
      <div class="grid gap-5 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="Sample JSON"
          :error="
            parsed.error || (!output ? 'Use a smaller or less deeply nested sample.' : undefined)
          "
          ><Textarea
            v-bind="controlProps"
            v-model="source"
            language="json"
            :rows="12"
            class="w-full font-mono"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Generated code"
          ><Textarea
            language="ts"
            v-bind="controlProps"
            :model-value="output"
            :rows="12"
            readonly
            class="w-full font-mono"
          ></Textarea
        ></Field>
      </div>
      <ToolActions>
        <Button
          :disabled="!!parsed.error || !output"
          color="secondary"
          variant="outline"
          @click="copyText(output)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy code</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
