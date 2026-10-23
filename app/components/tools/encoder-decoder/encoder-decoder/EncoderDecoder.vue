<script setup lang="ts">
interface RadioGroupItem {
  label: string;
  value: string;
  description?: string;
}

type EncoderKind = "base64" | "binary" | "morse" | "url";

const props = defineProps<{ kind: EncoderKind }>();

const morseByCharacter: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  " ": "/",
};

const characterByMorse = Object.fromEntries(
  Object.entries(morseByCharacter).map(([character, code]) => [code, character]),
);

const operationItems: RadioGroupItem[] = [
  { label: "Encode", value: "encode" },
  { label: "Decode", value: "decode" },
];

const input = ref("");
const operation = ref<"encode" | "decode">("encode");
const { copyText } = useCopyToClipboard();

const name = computed(() => {
  return { base64: "Base64", binary: "binary", morse: "Morse code", url: "URL" }[props.kind];
});

const result = computed(() => {
  const value = input.value.trim();
  if (!value) return { output: "", error: "" };

  try {
    return {
      output: operation.value === "encode" ? encode(input.value) : decode(input.value),
      error: "",
    };
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : `Invalid ${name.value} input.`,
    };
  }
});

const output = computed(() => result.value.output);
const errorMessage = computed(() => result.value.error);

function encode(value: string) {
  switch (props.kind) {
    case "base64": {
      const bytes = new TextEncoder().encode(value);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return btoa(binary);
    }
    case "binary":
      return [...new TextEncoder().encode(value)]
        .map((byte) => byte.toString(2).padStart(8, "0"))
        .join(" ");
    case "morse":
      return Array.from(value.toUpperCase())
        .map((character) => morseByCharacter[character] ?? "")
        .filter(Boolean)
        .join(" ");
    case "url":
      return encodeURIComponent(value);
  }
}

function decode(value: string) {
  switch (props.kind) {
    case "base64": {
      const binary = atob(value.replace(/\s/g, ""));
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }
    case "binary": {
      const groups = value.trim().split(/\s+/);
      if (groups.some((group) => !/^[01]{8}$/.test(group))) {
        throw new Error("Use 8-bit binary groups separated by spaces.");
      }
      return new TextDecoder("utf-8", { fatal: true }).decode(
        Uint8Array.from(groups, (group) => Number.parseInt(group, 2)),
      );
    }
    case "morse": {
      const decoded = value
        .trim()
        .split(/\s+/)
        .map((code) => characterByMorse[code]);
      if (decoded.some((character) => character === undefined)) {
        throw new Error("Separate Morse characters with spaces and words with /.");
      }
      return decoded.join("");
    }
    case "url":
      return decodeURIComponent(value);
  }
}
</script>

<template>
  <ToolWorkbench :description="`${name} output updates as you type.`">
    <div class="grid gap-5">
      <UiRadioGroup
        v-model="operation"
        :options="operationItems"
        orientation="horizontal"
        aria-label="Operation"
      />

      <div class="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        <UiField
          v-slot="{ controlProps }"
          label="Input"
          :description="`Text or ${name} to ${operation}.`"
        >
          <UiTextarea
            v-bind="controlProps"
            v-model="input"
            :placeholder="`Enter ${name} input…`"
            :rows="10"
            class="w-full"
          />
        </UiField>

        <UiField
          v-slot="{ controlProps }"
          label="Output"
          description="Read-only result."
          :error="errorMessage || undefined"
        >
          <UiTextarea
            v-bind="controlProps"
            :model-value="output"
            readonly
            :placeholder="errorMessage ? 'Fix the input to continue.' : 'Output appears here.'"
            :rows="10"
            class="w-full"
          />
        </UiField>
      </div>

      <div class="border-outline/70 flex flex-wrap justify-end gap-2 border-t pt-4">
        <UiButton
          color="neutral"
          variant="ghost"
          label="Clear"
          icon="i-tabler-rotate"
          :disabled="!input"
          @click="input = ''"
        />
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy output"
          icon="i-tabler-copy"
          :disabled="!output"
          @click="copyText(output)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
