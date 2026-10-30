<script setup lang="ts">
import type { TetrisGameState } from "./createTetrisGame";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import GameCanvas from "~/components/product/GameCanvas.vue";
import GameFullscreenButton from "~/components/product/GameFullscreenButton.vue";

import { Button } from "~/components/ui/button";
import { createTetrisGame } from "./createTetrisGame";

const gameHost = useTemplateRef<typeof GameCanvas>("gameHost");
const loaded = ref(false);
const gameError = ref(false);
const state = shallowRef<TetrisGameState>({
  status: "ready",
  score: 0,
  lines: 0,
  level: 1,
  best: 0,
});

function updateState(next: Record<string, unknown>) {
  if (
    (next.status === "ready" || next.status === "playing" || next.status === "over") &&
    typeof next.score === "number" &&
    typeof next.lines === "number" &&
    typeof next.level === "number" &&
    typeof next.best === "number"
  ) {
    state.value = {
      status: next.status,
      score: next.score,
      lines: next.lines,
      level: next.level,
      best: next.best,
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
    <div class="mx-auto grid max-w-[45rem] gap-5">
      <header class="border-border/70 flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <p class="text-highlighted text-sm font-semibold">Tetris</p>
          <p class="text-muted-foreground mt-1 font-mono text-xs">Stack Lab · local run</p>
        </div>
        <div class="text-muted-foreground flex gap-3 font-mono text-xs">
          <span
            >Score <strong class="text-highlighted">{{ state.score }}</strong></span
          ><span
            >Level <strong class="text-highlighted">{{ state.level }}</strong></span
          >
        </div>
      </header>
      <div
        class="border-border relative overflow-hidden rounded-lg border"
        data-phaser-game-shell
        style="--phaser-game-loading-bg: #151d2b"
      >
        <GameCanvas
          ref="gameHost"
          class="aspect-[21/32]"
          :create="createTetrisGame"
          label="Tetris game stage"
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
              class="bg-primary text-primary-foreground mx-auto grid size-14 place-items-center text-2xl font-bold"
              aria-hidden="true"
            >
              <Icon name="tabler:arrows-move"></Icon>
            </div>
            <h2 class="text-highlighted text-xl font-semibold">Keep the well clear</h2>
            <p class="text-muted-foreground text-sm leading-6">
              Move and rotate each piece, then clear complete rows. The board gets faster every ten
              lines.
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
            <p class="text-muted-foreground font-mono text-xs">
              ← → / A D move · ↑ / W rotate · Space hard drop · swipe or tap
            </p>
          </div>
        </div>
        <div
          v-if="loaded && state.status === 'over'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
          role="status"
          aria-labelledby="tetris-over-title"
        >
          <div
            class="border-border bg-card grid w-full max-w-sm gap-3 rounded-lg border p-6 text-center shadow-xl"
          >
            <div
              class="bg-destructive text-destructive-foreground mx-auto grid size-14 place-items-center text-2xl"
              aria-hidden="true"
            >
              <Icon name="tabler:alert-triangle"></Icon>
            </div>
            <h2
              id="tetris-over-title"
              class="text-highlighted text-xl font-semibold"
            >
              Stack topped out
            </h2>
            <p class="text-highlighted font-mono text-5xl font-bold tabular-nums">
              {{ state.score }}
            </p>
            <p class="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              Final score · {{ state.lines }} lines cleared
            </p>
            <p class="text-muted-foreground text-sm">
              Level {{ state.level }} reached. Best score: {{ state.best }}.
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
                Try again</span
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
        {{ state.lines }} lines cleared · level {{ state.level }} · no account needed
      </p>
    </div>
  </section>
</template>
