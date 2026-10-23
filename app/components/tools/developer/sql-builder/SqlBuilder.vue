<script setup lang="ts">
const table = ref("users");
const columns = ref("id, name, email");
const where = ref("");
const order = ref("");
const limit = ref("50");
const query = computed(
  () =>
    `SELECT ${columns.value || "*"}\nFROM ${table.value || "table"}${where.value ? `\nWHERE ${where.value}` : ""}${order.value ? `\nORDER BY ${order.value}` : ""}${limit.value ? `\nLIMIT ${limit.value}` : ""};`,
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkbench description="Compose a readable SELECT query with filters, ordering, and a limit.">
    <div class="grid gap-5">
      <div class="grid gap-4 sm:grid-cols-2">
        <UiField label="Table"><UiInput v-model="table" /></UiField
        ><UiField label="Columns"><UiInput v-model="columns" /></UiField
        ><UiField label="Where">
          <UiInput
            v-model="where"
            placeholder="active = true"
          /> </UiField
        ><UiField label="Order by">
          <UiInput
            v-model="order"
            placeholder="created_at DESC"
          /> </UiField
        ><UiField label="Limit">
          <UiNumberField
            v-model="limit"
            :step-snapping="false"
          />
        </UiField>
      </div>
      <UiTextarea
        :model-value="query"
        :rows="7"
        readonly
        class="font-mono"
      />
      <div class="flex justify-end">
        <UiButton
          color="neutral"
          variant="soft"
          label="Copy SQL"
          icon="i-tabler-copy"
          @click="copyText(query)"
        />
      </div>
    </div>
  </ToolWorkbench>
</template>
