<script setup lang="ts">
import { cn } from "../../utils/ui";
import CodeEditor from "../code/CodeEditor.vue";
import { inputVariants } from "../ui/input";
defineOptions({ inheritAttrs: false });
defineProps<{ language?: string }>();
const model = defineModel<string>({ default: "" });
const attrs = useAttrs();
</script>
<template>
  <CodeEditor
    v-if="language"
    v-bind="attrs"
    v-model="model"
    :language="language"
  />
  <textarea
    v-else
    v-bind="attrs"
    v-model="model"
    :class="
      cn(
        inputVariants({ size: 'sm', variant: 'soft' }).root(),
        'block h-auto min-h-24 resize-y p-3 font-mono text-[13px] leading-6',
        attrs.class as string,
      )
    "
  />
</template>
