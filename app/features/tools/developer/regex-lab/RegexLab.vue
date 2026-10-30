<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";

const kind = ref("escape");
const input = ref("");
const output = computed(() =>
  kind.value === "escape"
    ? input.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    : kind.value === "email"
      ? "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      : "https?:\\/\\/(?:www\\.)?[^\\s]+$",
);
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <Field label="Pattern mode"
        ><Select
          v-model="kind"
          class="w-full sm:max-w-xs"
          :options="
            selectOptions([
              { label: 'Escape literal', value: 'escape' },
              { label: 'Email starter', value: 'email' },
              { label: 'URL starter', value: 'url' },
            ])
          "
        ></Select></Field
      ><Field label="Literal text"
        ><Input
          v-model="input"
          :disabled="kind !== 'escape'"
          class="w-full"
          placeholder="Text to escape"
        ></Input></Field
      ><Field label="Regular expression"
        ><Input
          :model-value="output"
          readonly
          class="w-full font-mono"
        ></Input
      ></Field>
      <p class="text-muted-foreground text-sm">
        Starter patterns are examples, not complete email or URL validators. Test them against your
        own requirements.
      </p>
      <ToolActions>
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
          />Copy pattern</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
