<script setup lang="ts">
import type { FifteenPuzzleGameState } from "./createFifteenPuzzleGame";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import GameCanvas from "~/components/product/GameCanvas.vue";
import GameFullscreenButton from "~/components/product/GameFullscreenButton.vue";

import { Button } from "~/components/ui/button";
import { createFifteenPuzzleGame } from "./createFifteenPuzzleGame";

const gameHost = useTemplateRef<typeof GameCanvas>("gameHost");
const loaded = ref(false);
const gameError = ref(false);
const state = shallowRef<FifteenPuzzleGameState>({
  status: "ready",
  moves: 0,
  elapsedSeconds: 0,
  bestMoves: 0,
});

const formattedTime = computed(() => {
  const minutes = Math.floor(state.value.elapsedSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(state.value.elapsedSeconds % 60).padStart(2, "0")}`;
});

function updateState(next: Record<string, unknown>) {
  if (
    (next.status === "ready" || next.status === "playing" || next.status === "won") &&
    typeof next.moves === "number" &&
    typeof next.elapsedSeconds === "number" &&
    typeof next.bestMoves === "number"
  ) {
    state.value = {
      status: next.status,
      moves: next.moves,
      elapsedSeconds: next.elapsedSeconds,
      bestMoves: next.bestMoves,
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
          <p class="text-highlighted text-sm font-semibold">Fifteen Puzzle</p>
          <p class="text-muted-foreground mt-1 font-mono text-xs">
            Sliding Atelier · local puzzle run
          </p>
        </div>
        <div class="text-muted-foreground flex gap-3 font-mono text-xs">
          <span class="text-highlighted">{{ state.moves }} moves</span
          ><span class="text-highlighted">{{ formattedTime }}</span>
        </div>
      </header>
      <div
        class="border-border relative overflow-hidden rounded-lg border"
        data-phaser-game-shell
        style="--phaser-game-loading-bg: #151a21"
      >
        <GameCanvas
          ref="gameHost"
          class="aspect-[21/32]"
          :create="createFifteenPuzzleGame"
          label="Fifteen Puzzle game stage"
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
              <Icon name="tabler:grid-4x4"></Icon>
            </div>
            <h2 class="text-highlighted text-xl font-semibold">Set the tiles free</h2>
            <p class="text-muted-foreground text-sm leading-6">
              Slide tiles beside the empty square until 1–15 read in order. Every board is built
              from legal moves.
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
                Start puzzle
              </span>
            </Button>
            <p class="text-muted-foreground font-mono text-xs">
              Tap a tile · arrows / WASD · Enter or Space
            </p>
          </div>
        </div>
        <div
          v-if="loaded && state.status === 'won'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
          role="status"
          aria-labelledby="fifteen-puzzle-won-title"
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
              id="fifteen-puzzle-won-title"
              class="text-highlighted text-xl font-semibold"
            >
              Order restored
            </h2>
            <p class="text-highlighted font-mono text-5xl font-bold tabular-nums">
              {{ state.moves }}
            </p>
            <p class="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              moves · {{ formattedTime }} · best {{ state.bestMoves || "—" }}
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
                Play again
              </span>
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
        Every puzzle is solvable · no account needed
      </p>
    </div>
  </section>
</template>
