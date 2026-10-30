<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";

type HashAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const algorithmItems: { label: string; value: HashAlgorithm }[] = [
  { label: "SHA-256", value: "SHA-256" },
  { label: "SHA-384", value: "SHA-384" },
  { label: "SHA-512", value: "SHA-512" },
  { label: "SHA-1 (legacy)", value: "SHA-1" },
];

const input = ref("");
const algorithm = ref<HashAlgorithm>("SHA-256");
const output = ref("");
const errorMessage = ref("");
const { copyText } = useCopyToClipboard();
let requestId = 0;

const byteCount = computed(() => new TextEncoder().encode(input.value).length);
const selectedAlgorithm = computed(() =>
  algorithmItems.find((item) => item.value === algorithm.value)!,
);

async function createHash(value = input.value, selected = algorithm.value) {
  const currentRequest = ++requestId;
  errorMessage.value = "";
  output.value = "";
  if (value.length > 2_000_000) {
    errorMessage.value = "Use text shorter than 2 million characters.";
    return;
  }

  if (!value) {
    output.value = "";
    return;
  }

  try {
    const digest = await crypto.subtle.digest(selected, new TextEncoder().encode(value));
    if (currentRequest !== requestId) return;
    output.value = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  } catch {
    if (currentRequest !== requestId) return;
    output.value = "";
    errorMessage.value = "Hashing requires a secure browser context.";
  }
}

function setInput(value: string) {
  input.value = value;
  createHash(value);
}

function setAlgorithm(value: string | undefined) {
  if (!algorithmItems.some((item) => item.value === value)) return;
  algorithm.value = value as HashAlgorithm;
  createHash(input.value, algorithm.value);
}

function clear() {
  requestId += 1;
  input.value = "";
  output.value = "";
  errorMessage.value = "";
}
onBeforeUnmount(() => requestId++);
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <Field
        label="Algorithm"
        :description="
          algorithm === 'SHA-1'
            ? 'SHA-1 is retained for compatibility, not new security designs.'
            : `${selectedAlgorithm.label} cryptographic digest.`
        "
        ><Select
          :model-value="algorithm"
          class="w-full sm:max-w-xs"
          :options="selectOptions(algorithmItems)"
          @update:model-value="setAlgorithm"
        ></Select
      ></Field>
      <div class="grid gap-6 lg:gap-8 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="Input"
          :description="`${byteCount} UTF-8 bytes.`"
          ><Textarea
            v-bind="controlProps"
            :model-value="input"
            placeholder="Enter text to hash…"
            :rows="10"
            class="w-full"
            @update:model-value="setInput"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Digest"
          description="Lowercase hexadecimal output."
          :error="errorMessage || undefined"
          ><Textarea
            v-bind="controlProps"
            :model-value="output"
            readonly
            placeholder="Digest appears here."
            :rows="10"
            class="w-full"
          ></Textarea
        ></Field>
      </div>
      <ToolActions class="border-border/70 border-t pt-4">
        <Button
          color="secondary"
          variant="ghost"
          :disabled="!input"
          @click="clear"
          ><Icon
            name="tabler:rotate"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Clear</Button
        >
        <Button
          :disabled="!output"
          color="secondary"
          variant="outline"
          @click="copyText(output)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy digest</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
