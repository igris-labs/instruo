<script setup lang="ts">
interface Token {
  type: "property" | "index" | "wildcard";
  value?: string | number;
}

const input = ref(`{"users":[{"name":"Ada"},{"name":"Linus"}]}`);
const path = ref("$.users[*].name");
const result = ref("");
const error = ref("");
const { copyText } = useCopyToClipboard();

function parsePath(value: string): Token[] {
  const source = value.trim();
  if (!source.startsWith("$")) throw new Error("A JSONPath must start with $.");
  const tokens: Token[] = [];
  let index = 1;
  while (index < source.length) {
    if (source[index] === ".") {
      if (source[index + 1] === ".") {
        index += 2;
        const match = source.slice(index).match(/^[A-Z_$][\w$]*/i);
        if (!match) throw new Error("Expected a property after ..");
        tokens.push({ type: "property", value: match[0] });
        index += match[0].length;
        continue;
      }
      index += 1;
      const match = source.slice(index).match(/^[A-Z_$][\w$]*/i);
      if (!match) throw new Error("Expected a property after .");
      tokens.push({ type: "property", value: match[0] });
      index += match[0].length;
      continue;
    }
    if (source[index] === "[") {
      const end = source.indexOf("]", index);
      if (end < 0) throw new Error("Missing ] in path.");
      const value = source.slice(index + 1, end).trim();
      if (value === "*") tokens.push({ type: "wildcard" });
      else if (/^\d+$/.test(value)) tokens.push({ type: "index", value: Number(value) });
      else if (/^(['"]).*\1$/.test(value))
        tokens.push({ type: "property", value: value.slice(1, -1) });
      else throw new Error(`Unsupported bracket expression: ${value}`);
      index = end + 1;
      continue;
    }
    throw new Error(`Unexpected character: ${source[index]}`);
  }
  return tokens;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function run() {
  error.value = "";
  try {
    let values: unknown[] = [JSON.parse(input.value)];
    for (const token of parsePath(path.value)) {
      const next: unknown[] = [];
      for (const value of values) {
        if (token.type === "property" && isRecord(value) && typeof token.value === "string") {
          if (token.value in value) next.push(value[token.value]);
        } else if (token.type === "index" && Array.isArray(value)) {
          const item = value[token.value as number];
          if (item !== undefined) next.push(item);
        } else if (token.type === "wildcard") {
          if (Array.isArray(value)) next.push(...value);
          else if (isRecord(value)) next.push(...Object.values(value));
        }
      }
      values = next;
    }
    result.value = JSON.stringify(values.length === 1 ? values[0] : values, null, 2);
  } catch (cause) {
    result.value = "";
    error.value = cause instanceof Error ? cause.message : "Could not evaluate this path.";
  }
}

run();
</script>

<template>
  <ToolWorkbench description="Evaluate common JSONPath expressions against JSON in your browser.">
    <div class="grid gap-5">
      <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.55fr)]">
        <UiField
          v-slot="{ controlProps }"
          label="JSON document"
        >
          <UiTextarea
            v-bind="controlProps"
            v-model="input"
            :rows="12"
            class="w-full font-mono"
          />
        </UiField>
        <UiField label="JSONPath">
          <UiInput
            v-model="path"
            class="w-full font-mono"
            placeholder="$.users[*].name"
          />
          <p class="text-foreground-muted mt-2 text-xs">
            Supports properties, indexes, and [*] wildcards.
          </p>
        </UiField>
      </div>
      <UiButton
        label="Run query"
        icon="i-tabler-player-play-filled"
        class="w-fit"
        @click="run"
      />
      <UiNotice
        v-if="error"
        tone="error"
        icon="i-tabler-alert-circle"
        title="Invalid query"
        :description="error"
      />
      <UiField
        v-slot="{ controlProps }"
        label="Result"
      >
        <UiTextarea
          v-bind="controlProps"
          :model-value="result"
          :rows="10"
          readonly
          class="w-full font-mono"
          placeholder="Matching values appear here."
        />
      </UiField>
      <div class="flex justify-end">
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy result"
          icon="i-tabler-copy"
          :disabled="!result"
          @click="copyText(result)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
