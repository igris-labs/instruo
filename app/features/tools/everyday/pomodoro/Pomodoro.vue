<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { NumberField } from "~/components/ui/number-field";
import { Progress } from "~/components/ui/progress";

type Mode = "focus" | "short" | "long";
const mode = ref<Mode>("focus");
const durations = reactive<Record<Mode, number>>({ focus: 25 * 60, short: 5 * 60, long: 15 * 60 });
const status = ref("Ready to focus.");
const completed = ref(0);
let deadline = 0;
const secondsLeft = ref(durations.focus);
const running = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;
const display = computed(
  () =>
    `${Math.floor(secondsLeft.value / 60)
      .toString()
      .padStart(2, "0")}:${(secondsLeft.value % 60).toString().padStart(2, "0")}`,
);
const progress = computed(
  () => ((durations[mode.value] - secondsLeft.value) / durations[mode.value]) * 100,
);
function setMode(next: Mode) {
  mode.value = next;
  reset();
}
function tick() {
  if (!running.value) return;
  secondsLeft.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  if (!secondsLeft.value) {
    pause();
    if (mode.value === "focus") completed.value++;
    status.value =
      mode.value === "focus"
        ? "Focus complete. Time for a break."
        : "Break complete. Ready to focus.";
  }
}
function start() {
  if (running.value) return;
  if (!secondsLeft.value) secondsLeft.value = durations[mode.value];
  deadline = Date.now() + secondsLeft.value * 1000;
  running.value = true;
  status.value = "Timer running.";
  timer = setInterval(tick, 250);
}
function pause() {
  if (running.value) secondsLeft.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  running.value = false;
  if (timer) clearInterval(timer);
  timer = undefined;
  status.value = "Paused.";
}
function reset() {
  pause();
  secondsLeft.value = durations[mode.value];
  status.value = "Ready.";
}
onMounted(() => document.addEventListener("visibilitychange", tick));
onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", tick);
  if (timer) clearInterval(timer);
});
</script>
<template>
  <ToolWorkspace layout="form">
    <div class="border-border bg-muted/25 grid gap-8 rounded-lg border p-6 sm:p-8">
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="item in [
            { label: 'Focus', value: 'focus' },
            { label: 'Short break', value: 'short' },
            { label: 'Long break', value: 'long' },
          ]"
          :key="item.value"
          color="secondary"
          :variant="mode === item.value ? 'solid' : 'outline'"
          @click="setMode(item.value as Mode)"
          >{{ item.label }}</Button
        >
      </div>
      <output
        class="text-highlighted block py-4 text-center font-mono text-6xl font-semibold tracking-tight tabular-nums sm:text-7xl"
        role="timer"
        aria-label="Time remaining"
        >{{ display }}</output
      ><Progress
        :model-value="progress"
        class="w-full"
        aria-label="Timer progress"
      ></Progress>
      <p
        role="status"
        class="text-muted-foreground text-center text-sm"
      >
        {{ status }} · {{ completed }} focus sessions completed
      </p>
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
          v-if="!running"
          @click="start"
          ><Icon
            name="tabler:player-play-filled"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Start</Button
        >
        <Button
          v-else
          @click="pause"
          ><Icon
            name="tabler:player-pause"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Pause</Button
        >
      </ToolActions>
    </div>
    <div class="grid gap-4 @[30rem]:grid-cols-3">
      <Field
        v-for="item in [
          { key: 'focus', label: 'Focus minutes' },
          { key: 'short', label: 'Short break minutes' },
          { key: 'long', label: 'Long break minutes' },
        ]"
        :key="item.key"
        :label="item.label"
        ><NumberField
          :model-value="durations[item.key as Mode] / 60"
          :min="1"
          :max="180"
          class="w-full"
          @update:model-value="
            durations[item.key as Mode] =
              Math.min(180, Math.max(1, Math.floor(Number($event) || 1))) * 60;
            reset();
          "
      /></Field>
    </div>
  </ToolWorkspace>
</template>
