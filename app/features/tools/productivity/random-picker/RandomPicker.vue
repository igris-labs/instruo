<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Field } from "~/components/ui/field";

const input = ref("Design review\nShip release\nTake a break");
const noRepeat = ref(true);
const remaining = ref<string[]>([]);
const picked = ref("");
const history = ref<string[]>([]);
const { copyText } = useCopyToClipboard();
const options = computed(() =>
  [
    ...new Set(
      input.value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ].slice(0, 1000),
);
function pick() {
  const pool = noRepeat.value
    ? remaining.value.length
      ? remaining.value
      : options.value.filter((item) => !history.value.includes(item))
    : options.value;
  if (!pool.length) {
    picked.value = "Add more choices or reset history.";
    return;
  }
  const bytes = crypto.getRandomValues(new Uint32Array(1));
  const limit = Math.floor(0x1_0000_0000 / pool.length) * pool.length;
  while (bytes[0]! >= limit) crypto.getRandomValues(bytes);
  const item = pool[bytes[0]! % pool.length]!;
  picked.value = item;
  history.value.unshift(item);
  if (!noRepeat.value) history.value = history.value.slice(0, 100);
  remaining.value = noRepeat.value ? pool.filter((candidate) => candidate !== item) : [];
}
function reset() {
  picked.value = "";
  history.value = [];
  remaining.value = [];
}
watch([input, noRepeat], reset);
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5 @[48rem]:grid-cols-[minmax(0,0.8fr)_minmax(18rem,1.2fr)]">
      <div class="grid gap-4">
        <Field
          v-slot="{ controlProps }"
          label="Choices"
          description="One choice per line. Up to 1,000 unique choices. Editing choices resets the draw."
          ><Textarea
            v-bind="controlProps"
            v-model="input"
            :rows="14"
            class="w-full"
          ></Textarea></Field
        ><Checkbox
          v-model="noRepeat"
          label="Avoid repeats until every choice is picked"
        ></Checkbox>
      </div>
      <div class="grid content-start gap-4">
        <div class="border-border bg-muted/20 rounded-md border p-6 text-center">
          <p class="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
            Selected
          </p>
          <p class="text-highlighted mt-4 min-h-12 text-3xl font-semibold">
            {{ picked || "Ready when you are" }}
          </p>
        </div>
        <ToolActions>
          <Button
            color="secondary"
            variant="ghost"
            @click="reset"
            ><Icon
              name="tabler:refresh"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Reset</Button
          >
          <Button
            :disabled="!options.length || (noRepeat && history.length >= options.length)"
            @click="pick"
            ><Icon
              name="tabler:dice-5"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Pick one</Button
          >
        </ToolActions>
        <div
          v-if="history.length"
          class="border-border rounded-md border p-4"
        >
          <div class="flex items-center justify-between">
            <p class="font-medium">History</p>
            <Button
              color="secondary"
              variant="outline"
              @click="copyText(history.join('\n'))"
              ><Icon
                name="tabler:copy"
                mode="svg"
                class="mr-1.5"
                aria-hidden="true"
              />Copy</Button
            >
          </div>
          <p class="text-muted-foreground mt-2 text-sm">{{ history.join(" · ") }}</p>
        </div>
      </div>
    </div>
  </ToolWorkspace>
</template>
