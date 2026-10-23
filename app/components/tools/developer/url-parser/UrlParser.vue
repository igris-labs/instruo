<script setup lang="ts">
const input = ref("");
const { copyText } = useCopyToClipboard();

const result = computed(() => {
  if (!input.value.trim()) return { url: null, error: "" };
  try {
    return { url: new URL(input.value.trim()), error: "" };
  } catch {
    return { url: null, error: "Enter a complete URL, including its protocol." };
  }
});

const fields = computed(() => {
  const url = result.value.url;
  if (!url) return [];
  return [
    ["Protocol", url.protocol],
    ["Origin", url.origin],
    ["Host", url.host],
    ["Path", url.pathname],
    ["Query", url.search || "None"],
    ["Hash", url.hash || "None"],
  ];
});

const output = computed(() =>
  fields.value.map(([label, value]) => `${label}: ${value}`).join("\n"),
);
</script>

<template>
  <ToolWorkbench description="Parse a URL into readable parts without sending it anywhere.">
    <div class="grid gap-6">
      <UiField
        label="URL"
        description="Include https://, http://, or another supported protocol."
        :error="result.error || undefined"
      >
        <UiInput
          v-model="input"
          class="w-full"
          placeholder="https://example.com/path?query=1#section"
        />
      </UiField>

      <dl
        v-if="fields.length"
        class="border-outline/70 grid overflow-hidden rounded-lg border-t border-l sm:grid-cols-2"
      >
        <div
          v-for="[label, value] in fields"
          :key="label"
          class="border-outline/70 grid gap-2 border-r border-b p-4"
        >
          <dt class="text-foreground-muted font-mono text-xs">{{ label }}</dt>
          <dd class="text-foreground-highlighted font-mono text-sm break-all">{{ value }}</dd>
        </div>
      </dl>
      <p
        v-else
        class="text-foreground-muted border-outline/70 rounded-lg border p-5 text-sm"
      >
        Parsed URL parts will appear here.
      </p>

      <div class="flex justify-end">
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy parts"
          icon="i-tabler-copy"
          :disabled="!output"
          @click="copyText(output)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
