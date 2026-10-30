<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";
import { compareText } from "./compareText";

const left = ref("");
const right = ref("");
const ignoreWhitespace = ref(false);
const result = computed(() => {
  try {
    return { ...compareText(left.value, right.value, ignoreWhitespace.value), error: "" };
  } catch (cause) {
    return { rows: [], output: "", added: 0, removed: 0, error: (cause as Error).message };
  }
});
const rows = computed(() => result.value.rows.slice(0, 500));
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6">
      <div class="grid gap-4 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="Original"
          ><Textarea
            v-bind="controlProps"
            v-model="left"
            :rows="10"
            class="w-full font-mono"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Updated"
          ><Textarea
            v-bind="controlProps"
            v-model="right"
            :rows="10"
            class="w-full font-mono"
          ></Textarea
        ></Field>
      </div>
      <Checkbox
        v-model="ignoreWhitespace"
        label="Ignore surrounding whitespace"
      /><StatusMessage
        v-if="result.error"
        tone="error"
        title="Could not compare"
        :description="result.error"
      />
      <p
        role="status"
        class="text-muted-foreground text-sm"
      >
        {{ result.added }} added lines · {{ result.removed }} removed lines<span
          v-if="result.rows.length > 500"
        >
          · Showing 500 rows; copied output includes all differences.</span
        >
      </p>
      <ol class="border-border/70 border-t font-mono text-sm">
        <li
          v-for="(row, index) in rows"
          :key="index"
          class="border-border/70 grid gap-2 border-b px-3 py-2 @[30rem]:grid-cols-2"
          :class="
            row.type === 'same'
              ? 'text-muted-foreground'
              : row.type === 'added'
                ? 'text-success bg-success/5'
                : row.type === 'removed'
                  ? 'text-destructive bg-destructive/5'
                  : 'text-warning bg-warning/5'
          "
        >
          <span>{{ row.left || "∅" }}</span
          ><span>{{ row.right || "∅" }}</span>
        </li>
      </ol>
    </div>
    <ToolActions
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.output"
        @click="copyText(result.output)"
        >Copy diff</Button
      ></ToolActions
    >
  </ToolWorkspace>
</template>
