<script setup lang="ts">
import type { MemoryMatchGameState } from "./createMemoryMatchGame";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import GameCanvas from "~/components/product/GameCanvas.vue";
import GameFullscreenButton from "~/components/product/GameFullscreenButton.vue";

import { Button } from "~/components/ui/button";
import { createMemoryMatchGame } from "./createMemoryMatchGame";

const gameHost = useTemplateRef<typeof GameCanvas>("gameHost");
const loaded = ref(false);
const gameError = ref(false);
const state = shallowRef<MemoryMatchGameState>({
  status: "ready",
  moves: 0,
  pairs: 0,
  totalPairs: 8,
  elapsedSeconds: 0,
  won: false,
});

const formattedTime = computed(() => {
  const minutes = Math.floor(state.value.elapsedSeconds / 60);
  const seconds = state.value.elapsedSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

function updateState(next: Record<string, unknown>) {
  if (
    (next.status === "ready" || next.status === "playing" || next.status === "over") &&
    typeof next.moves === "number" &&
    typeof next.pairs === "number" &&
    typeof next.totalPairs === "number" &&
    typeof next.elapsedSeconds === "number" &&
    typeof next.won === "boolean"
  ) {
    state.value = {
      status: next.status,
      moves: next.moves,
      pairs: next.pairs,
      totalPairs: next.totalPairs,
      elapsedSeconds: next.elapsedSeconds,
      won: next.won,
    };
  }
}
</script>
<template>
  <section
    data-ui
    aria-label="Interactive workspace"
    class="min-w-0 space-y-5"
  >
    <div class="mx-auto grid max-w-xl gap-5">
      <header class="border-border/70 flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <p class="text-highlighted text-sm font-semibold">Memory Match</p>
          <p class="text-muted-foreground mt-1 font-mono text-xs">Shape Vault · local puzzle run</p>
        </div>
        <div class="text-muted-foreground flex gap-3 font-mono text-xs">
          <span
            ><strong class="text-highlighted">{{ state.pairs }}/{{ state.totalPairs }}</strong>
            pairs</span
          ><span
            ><strong class="text-highlighted">{{ formattedTime }}</strong></span
          >
        </div>
      </header>
      <div
        class="border-border relative overflow-hidden rounded-lg border"
        data-phaser-game-shell
        style="--phaser-game-loading-bg: #181528"
      >
        <GameCanvas
          ref="gameHost"
          class="aspect-[21/32]"
          :create="createMemoryMatchGame"
          label="Memory Match game stage"
          @state="updateState"
          @ready="loaded = true"
          @error="gameError = true"
        ></GameCanvas
        ><GameFullscreenButton
          :is-fullscreen="gameHost?.isFullscreen ?? false"
          @toggle="gameHost?.toggleFullscreen()"
        ></GameFullscreenButton>
        <div
          v-if="loaded && state.status === 'ready'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
        >
          <div
            class="border-border bg-card grid w-full max-w-sm gap-4 rounded-lg border p-6 text-center shadow-xl"
          >
            <div
              class="bg-primary text-primary-foreground mx-auto grid size-14 place-items-center text-2xl"
              aria-hidden="true"
            >
              <Icon name="tabler:cards"></Icon>
            </div>
            <h2 class="text-highlighted text-xl font-semibold">Match the shapes</h2>
            <p class="text-muted-foreground text-sm leading-6">
              Reveal two cards at a time. Matching shapes lock in with a burst; mismatches turn back
              after a short pause.
            </p>
            <Button
              type="button"
              class="focus-visible:ring-primary relative mx-auto grid h-16 w-56 place-items-center text-sm font-semibold transition-transform focus-visible:ring-2 focus-visible:outline-none active:translate-y-px"
              @click.stop="gameHost?.start()"
            >
              <span class="relative inline-flex items-center gap-2"
                ><Icon
                  name="tabler:player-play-filled"
                  aria-hidden="true"
                ></Icon>
                Start game</span
              >
            </Button>
            <p class="text-muted-foreground font-mono text-xs">Tap cards · arrows + Enter</p>
          </div>
        </div>
        <div
          v-if="loaded && state.status === 'over'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
          role="status"
          aria-labelledby="memory-match-over-title"
        >
          <div
            class="border-border bg-card grid w-full max-w-sm gap-4 rounded-lg border p-6 text-center shadow-xl"
          >
            <div
              class="bg-success text-success-foreground mx-auto grid size-14 place-items-center text-2xl"
              aria-hidden="true"
            >
              <Icon name="tabler:confetti"></Icon>
            </div>
            <h2
              id="memory-match-over-title"
              class="text-highlighted text-xl font-semibold"
            >
              Shape vault complete
            </h2>
            <p class="text-highlighted font-mono text-5xl font-bold tabular-nums">
              {{ formattedTime }}
            </p>
            <p class="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              {{ state.moves }} moves · {{ state.pairs }} pairs
            </p>
            <Button
              type="button"
              class="focus-visible:ring-primary relative mx-auto grid h-16 w-56 place-items-center text-sm font-semibold transition-transform focus-visible:ring-2 focus-visible:outline-none active:translate-y-px"
              @click.stop="gameHost?.restart()"
            >
              <span class="relative inline-flex items-center gap-2"
                ><Icon
                  name="tabler:refresh"
                  aria-hidden="true"
                ></Icon>
                Play again</span
              >
            </Button>
          </div>
        </div>
        <div
          v-if="gameError"
          class="bg-background absolute inset-0 z-20 grid place-items-center p-5"
          role="alert"
        >
          <StatusMessage
            tone="error"
            title="Game unavailable"
            description="Reload the page and try once more."
            icon="tabler:alert-circle"
          ></StatusMessage>
        </div>
      </div>
      <p class="text-muted-foreground text-center font-mono text-xs">
        Find all eight pairs · no account needed
      </p>
    </div>
  </section>
</template>
