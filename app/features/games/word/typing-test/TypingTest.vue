<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";

const prompt = "Small tools make big tasks feel lighter.";
const input = ref("");
const seconds = ref(30);
const started = ref(false);
const finished = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;
const progress = computed(() =>
  Math.min(100, Math.round((input.value.length / prompt.length) * 100)),
);
const words = computed(() => (input.value.trim() ? input.value.trim().split(/\s+/).length : 0));
const statusText = computed(() =>
  finished.value
    ? `Time. ${words.value} words typed.`
    : started.value
      ? `${seconds.value}s left. Keep typing.`
      : "Type the sentence before time runs out.",
);
function start() {
  if (started.value) return;
  started.value = true;
  timer = setInterval(() => {
    seconds.value -= 1;
    if (seconds.value <= 0) finish();
  }, 1000);
}
function finish() {
  if (timer) clearInterval(timer);
  timer = undefined;
  finished.value = true;
}
function reset() {
  if (timer) clearInterval(timer);
  timer = undefined;
  input.value = "";
  seconds.value = 30;
  started.value = false;
  finished.value = false;
}
onBeforeUnmount(() => timer && clearInterval(timer));
</script>
<template>
  <section
    data-ui
    aria-label="Interactive workspace"
    class="min-w-0 space-y-5"
  >
    <div class="mx-auto grid max-w-2xl gap-6">
      <div class="flex items-center justify-between gap-4">
        <p
          class="text-muted-foreground text-sm"
          role="status"
          aria-live="polite"
        >
          {{ statusText }}
        </p>
        <span class="text-primary font-mono text-xl">{{ seconds }}s</span>
      </div>
      <div class="typing-copy border-border/70 bg-muted/20 border p-5 text-lg leading-8">
        <span class="text-highlighted">{{ prompt }}</span>
      </div>
      <Textarea
        v-model="input"
        :rows="5"
        class="w-full"
        placeholder="Start typing here…"
        :disabled="finished"
        @focus="start"
        @input="start"
      ></Textarea
      ><Progress
        :model-value="progress"
        :max="100"
        aria-label="Typing progress"
      ></Progress>
      <div class="flex justify-between">
        <span class="text-muted-foreground font-mono text-sm">{{ words }} words</span
        ><Button
          color="secondary"
          variant="outline"
          @click="reset"
          ><Icon
            name="tabler:refresh"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Reset</Button
        >
      </div>
    </div>
  </section>
</template>
<style scoped>
.typing-copy {
  animation: typing-breathe 2.4s ease-in-out infinite alternate;
}
@keyframes typing-breathe {
  from {
    border-color: var(--border);
  }
  to {
    border-color: var(--ring);
  }
}
@media (prefers-reduced-motion: reduce) {
  .typing-copy {
    animation: none;
  }
}
</style>
