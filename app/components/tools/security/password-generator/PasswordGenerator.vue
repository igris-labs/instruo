<script setup lang="ts">
type CharacterOption = "lowercase" | "numbers" | "symbols" | "uppercase";

const characterSets: Record<CharacterOption, string> = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};
const optionItems: { key: CharacterOption; label: string }[] = [
  { key: "lowercase", label: "Lowercase" },
  { key: "uppercase", label: "Uppercase" },
  { key: "numbers", label: "Numbers" },
  { key: "symbols", label: "Symbols" },
];

const length = ref(20);
const password = ref("");
const settings = reactive<Record<CharacterOption, boolean>>({
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
});
const { copyText } = useCopyToClipboard();

const enabledSets = computed(() =>
  optionItems.filter(({ key }) => settings[key]).map(({ key }) => characterSets[key]),
);
const pool = computed(() => enabledSets.value.join(""));
const entropyBits = computed(() => Math.floor(length.value * Math.log2(pool.value.length)));
const strength = computed(() => {
  if (entropyBits.value < 60) return { label: "Basic", color: "warning" as const };
  if (entropyBits.value < 90) return { label: "Strong", color: "success" as const };
  return { label: "Very strong", color: "success" as const };
});

function secureIndex(max: number) {
  const limit = 256 - (256 % max);
  const bytes = new Uint8Array(1);

  do crypto.getRandomValues(bytes);
  while (bytes[0]! >= limit);

  return bytes[0]! % max;
}

function generatePassword() {
  if (!pool.value || !globalThis.crypto) return;

  const characters = enabledSets.value.map((set) => set[secureIndex(set.length)]!);
  while (characters.length < length.value) {
    characters.push(pool.value[secureIndex(pool.value.length)]!);
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex]!, characters[index]!];
  }

  password.value = characters.join("");
}

function setLength(value: number | null | undefined) {
  length.value = Math.min(128, Math.max(8, value ?? 20));
  generatePassword();
}

function setOption(key: CharacterOption, value: boolean) {
  const enabledCount = optionItems.filter((option) => settings[option.key]).length;
  if (!value && settings[key] && enabledCount === 1) return;
  settings[key] = value;
  generatePassword();
}

onMounted(generatePassword);
</script>

<template>
  <ToolWorkbench description="Generated with your browser's cryptographic random number generator.">
    <div class="grid gap-6">
      <div class="border-outline/70 bg-muted/20 rounded-lg border p-5 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <span class="text-foreground-muted font-mono text-xs">Generated password</span>
          <div class="flex items-center gap-2">
            <UiBadge
              :label="strength.label"
              :tone="strength.color"
              variant="subtle"
            />
            <span class="text-foreground-muted font-mono text-xs">{{ entropyBits }} bits</span>
          </div>
        </div>
        <output
          class="text-foreground-highlighted mt-6 block min-h-16 font-mono text-2xl leading-9 font-semibold break-all sm:text-3xl"
        >
          {{ password }}
        </output>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <UiField
          label="Length"
          description="Between 8 and 128 characters."
        >
          <UiNumberField
            :model-value="length"
            :min="8"
            :max="128"
            class="w-full"
            @update:model-value="setLength"
          />
        </UiField>

        <fieldset>
          <legend class="text-foreground-highlighted text-sm font-medium">Character sets</legend>
          <p class="text-foreground-muted mt-1 text-sm">Keep at least one set enabled.</p>
          <div class="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            <UiCheckbox
              v-for="option in optionItems"
              :key="option.key"
              :model-value="settings[option.key]"
              :label="option.label"
              @update:model-value="setOption(option.key, Boolean($event))"
            />
          </div>
        </fieldset>
      </div>

      <div class="border-outline/70 flex flex-wrap justify-end gap-2 border-t pt-5">
        <UiButton
          label="Generate again"
          color="neutral"
          variant="ghost"
          icon="i-tabler-refresh"
          @click="generatePassword"
        />
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy password"
          icon="i-tabler-copy"
          :disabled="!password"
          @click="copyText(password)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
