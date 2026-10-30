<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { dateInZone, localInput } from "../dateMath";
const start = ref("");
const end = ref("");
onMounted(() => {
  start.value = localInput();
  end.value = localInput(new Date(Date.now() + 86400000));
});
const result = computed(() => {
  try {
    const milliseconds = dateInZone(end.value).getTime() - dateInZone(start.value).getTime();
    if (milliseconds < 0) throw new Error("End must be on or after start.");
    const minutes = Math.floor(milliseconds / 60000);
    return {
      text: `${Math.floor(minutes / 1440)} days · ${Math.floor((minutes % 1440) / 60)} hours · ${
        minutes % 60
      } minutes`,
      minutes,
      error: "",
    };
  } catch (cause) {
    return { text: "", minutes: 0, error: cause instanceof Error ? cause.message : "Check dates." };
  }
});
const { copyText } = useCopyToClipboard();
function swap() {
  [start.value, end.value] = [end.value, start.value];
}
</script>
<template>
  <ToolWorkspace
    ><div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <div class="grid gap-5">
        <Field label="Start"
          ><Input
            v-model="start"
            type="datetime-local"
            class="w-full" /></Field
        ><Field label="End"
          ><Input
            v-model="end"
            type="datetime-local"
            class="w-full"
        /></Field>
        <p class="text-muted-foreground text-xs">
          Elapsed duration in your device's time zone, including daylight-saving changes. Ambiguous
          or skipped clock times must be changed.
        </p>
      </div>
      <section
        class="bg-muted/40 grid content-start gap-4 rounded-lg p-6"
        aria-label="Duration result"
      >
        <p class="text-muted-foreground text-sm">Elapsed duration</p>
        <output class="text-3xl font-semibold tabular-nums">{{ result.text || "—" }}</output>
        <p
          v-if="result.text"
          class="text-muted-foreground text-sm"
        >
          {{ result.minutes.toLocaleString() }} total minutes ·
          {{ (result.minutes / 60).toLocaleString(undefined, { maximumFractionDigits: 2 }) }} hours
        </p>
      </section>
    </div>
    <StatusMessage
      v-if="result.error && start"
      tone="error"
      title="Check dates"
      :description="result.error"
    /><ToolActions
      ><Button
        color="secondary"
        variant="ghost"
        @click="swap"
        >Swap dates</Button
      ><Button
        color="secondary"
        variant="outline"
        :disabled="!result.text"
        @click="copyText(result.text)"
        >Copy duration</Button
      ></ToolActions
    ></ToolWorkspace
  >
</template>
