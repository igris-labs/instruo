<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

const table = ref("users");
const columns = ref("id, name, email");
const where = ref("");
const order = ref("");
const limit = ref("50");
const error = computed(() =>
  limit.value && (!/^\d+$/.test(limit.value) || !Number.isSafeInteger(Number(limit.value)))
    ? "Use a nonnegative whole-number limit or leave it blank."
    : "",
);
const query = computed(() =>
  error.value
    ? ""
    : `SELECT ${columns.value || "*"}\nFROM ${table.value || "table"}${where.value ? `\nWHERE ${where.value}` : ""}${order.value ? `\nORDER BY ${order.value}` : ""}${limit.value ? `\nLIMIT ${limit.value}` : ""};`,
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="grid gap-4 @[30rem]:grid-cols-2">
        <Field label="Table"
          ><Input
            v-model="table"
            class="w-full"
          ></Input></Field
        ><Field label="Columns"
          ><Input
            v-model="columns"
            class="w-full"
          ></Input></Field
        ><Field label="Where"
          ><Input
            v-model="where"
            class="w-full"
            placeholder="active = true"
          ></Input></Field
        ><Field label="Order by"
          ><Input
            v-model="order"
            class="w-full"
            placeholder="created_at DESC"
          ></Input></Field
        ><Field
          label="Limit"
          :error="error || undefined"
          ><Input
            v-model="limit"
            class="w-full"
            inputmode="numeric"
          ></Input
        ></Field>
      </div>
      <Field
        v-slot="{ controlProps }"
        label="Output"
        class="min-w-0"
        ><Textarea
          v-bind="controlProps"
          language="sql"
          :model-value="query"
          :rows="7"
          readonly
          class="w-full font-mono"
        ></Textarea
      ></Field>
      <p class="text-muted-foreground text-sm">
        SQL fragments are used as entered. This creates a SELECT statement; it does not execute SQL
        or make untrusted input safe for a database.
      </p>
      <ToolActions>
        <Button
          color="secondary"
          variant="outline"
          :disabled="!query"
          @click="copyText(query)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy SQL</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
