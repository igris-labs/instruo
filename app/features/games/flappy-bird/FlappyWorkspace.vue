<script setup lang="ts">
import GameCanvas from "../../../components/product/GameCanvas.vue";
import { Button } from "../../../components/ui/button";
import { createFlappyBirdGame } from "./createFlappyBirdGame";
const host = useTemplateRef<InstanceType<typeof GameCanvas>>("host");
const surface = useTemplateRef<HTMLElement>("surface");
const ready = ref(false);
const failed = ref(false);
const state = ref({ status: "ready", score: 0, best: 0 });
const muted = ref(false);
const fullscreen = ref(false);
const notice = ref("");
function update(value: Record<string, unknown>) {
  if (
    ["ready", "playing", "over"].includes(String(value.status)) &&
    typeof value.score === "number" &&
    typeof value.best === "number"
  )
    state.value = { status: String(value.status), score: value.score, best: value.best };
}
async function expand() {
  try {
    if (document.fullscreenElement === surface.value) await document.exitFullscreen();
    else await surface.value?.requestFullscreen();
  } catch {
    notice.value = "Fullscreen is unavailable. You can keep playing here.";
  }
}
const syncFullscreen = () => {
  fullscreen.value = document.fullscreenElement === surface.value;
};
onMounted(() => document.addEventListener("fullscreenchange", syncFullscreen));
onBeforeUnmount(() => document.removeEventListener("fullscreenchange", syncFullscreen));
</script>
<template>
  <section
    class="mx-auto max-w-md space-y-4"
    aria-label="Flappy Bird"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="flex gap-5 text-sm tabular-nums">
        <span
          >Score <strong>{{ state.score }}</strong></span
        ><span class="text-muted-foreground"
          >Best <strong class="text-foreground">{{ state.best }}</strong></span
        >
      </div>
      <div class="flex gap-1">
        <Button
          variant="ghost"
          shape="icon"
          :aria-label="muted ? 'Unmute game' : 'Mute game'"
          @click="muted = host?.toggleMute() ?? !muted"
          ><Icon
            :name="muted ? 'tabler:volume-off' : 'tabler:volume'"
            mode="svg"
        /></Button>
        <Button
          variant="ghost"
          shape="icon"
          :aria-label="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          @click="expand"
          ><Icon
            :name="fullscreen ? 'tabler:minimize' : 'tabler:maximize'"
            mode="svg"
        /></Button>
      </div>
    </div>
    <div
      ref="surface"
      class="relative aspect-[21/32] w-full overflow-hidden rounded-xl bg-sky-200 [&:fullscreen]:grid [&:fullscreen]:h-dvh [&:fullscreen]:max-h-dvh [&:fullscreen]:place-items-center [&:fullscreen]:rounded-none [&:fullscreen]:bg-neutral-950"
    >
      <GameCanvas
        ref="host"
        :create="createFlappyBirdGame"
        label="Flappy Bird game stage"
        @ready="ready = true"
        @state="update"
        @error="failed = true"
      />
      <div
        v-if="!ready || failed"
        class="bg-background/95 absolute inset-0 grid place-items-center p-6 text-center"
      >
        <div role="status">
          <p class="font-medium">
            {{ failed ? "The flight could not load" : "Preparing your flight…" }}
          </p>
          <p class="text-muted-foreground mt-3 text-sm">
            {{
              failed
                ? "Check your connection and reload to try again."
                : "Loading the game and its artwork."
            }}
          </p>
          <Button
            v-if="failed"
            class="mt-5"
            @click="reloadNuxtApp()"
            >Reload game</Button
          >
        </div>
      </div>
      <div
        v-else-if="state.status !== 'playing'"
        class="absolute inset-0 grid place-items-center bg-black/15 p-5"
      >
        <div class="bg-card text-card-foreground w-full max-w-72 rounded-xl p-6 shadow-lg">
          <h2 class="text-xl font-medium tracking-tight">
            {{ state.status === "over" ? "Flight over" : "Ready for takeoff?" }}
          </h2>
          <p class="text-muted-foreground mt-3 text-sm leading-6">
            {{
              state.status === "over"
                ? `You scored ${state.score}. Your best is ${state.best}.`
                : "One tap keeps you in the sky. Fly between the gates."
            }}
          </p>
          <Button
            class="mt-5"
            @click="state.status === 'over' ? host?.restart() : host?.start()"
            >{{ state.status === "over" ? "Try again" : "Play now" }}</Button
          >
        </div>
      </div>
    </div>
    <p
      role="status"
      class="text-muted-foreground text-center text-xs leading-5"
    >
      {{ notice || "Click the stage, tap, or press Space to flap." }}
    </p>
  </section>
</template>
