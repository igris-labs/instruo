<script setup lang="ts">
import type { SokobanGameState } from "./createSokobanGame";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import GameCanvas from "~/components/product/GameCanvas.vue";
import GameFullscreenButton from "~/components/product/GameFullscreenButton.vue";

import { Button } from "~/components/ui/button";
import { createSokobanGame } from "./createSokobanGame";

const gameHost = useTemplateRef<typeof GameCanvas>("gameHost");
const loaded = ref(false);
const gameError = ref(false);
const state = shallowRef<SokobanGameState>({
  status: "ready",
  level: 1,
  totalLevels: 50,
  moves: 0,
  pushes: 0,
  completedLevels: 0,
  won: false,
});

const resultTitle = computed(() => (state.value.won ? "Warehouse cleared" : "Route paused"));
const resultCopy = computed(() =>
  state.value.won
    ? "Every crate reached its goal. Clean route."
    : "The run ended before every delivery was complete.",
);

function updateState(next: Record<string, unknown>) {
  if (
    (next.status === "ready" || next.status === "playing" || next.status === "over") &&
    typeof next.level === "number" &&
    typeof next.totalLevels === "number" &&
    typeof next.moves === "number" &&
    typeof next.pushes === "number" &&
    typeof next.completedLevels === "number" &&
    typeof next.won === "boolean"
  ) {
    state.value = {
      status: next.status,
      level: next.level,
      totalLevels: next.totalLevels,
      moves: next.moves,
      pushes: next.pushes,
      completedLevels: next.completedLevels,
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
          <p class="text-highlighted text-sm font-semibold">Sokoban</p>
          <p class="text-muted-foreground mt-1 font-mono text-xs">Warehouse Run · local puzzle</p>
        </div>
        <div class="text-muted-foreground flex gap-3 font-mono text-xs">
          <span
            >Level
            <strong class="text-highlighted"
              >{{ state.level }}/{{ state.totalLevels }}</strong
            ></span
          ><span
            ><strong class="text-highlighted">{{ state.pushes }}</strong> pushes</span
          >
        </div>
      </header>
      <div
        class="border-border relative overflow-hidden rounded-lg border"
        data-phaser-game-shell
        style="--phaser-game-loading-bg: #14211f"
      >
        <GameCanvas
          ref="gameHost"
          class="aspect-[21/32]"
          :create="createSokobanGame"
          label="Sokoban game stage"
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
              <Icon name="tabler:box"></Icon>
            </div>
            <h2 class="text-highlighted text-xl font-semibold">Plan the route</h2>
            <p class="text-muted-foreground text-sm leading-6">
              Level one is an open-room warm-up. New shelves and crates arrive as the route gets
              tougher. Use undo when a plan closes.
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
                Start route
              </span>
            </Button>
            <p class="text-muted-foreground font-mono text-xs">
              Arrows / WASD · Z undo · R reset · swipe
            </p>
          </div>
        </div>
        <div
          v-if="loaded && state.status === 'over'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
          role="status"
          aria-labelledby="sokoban-over-title"
        >
          <div
            class="border-border bg-card grid w-full max-w-sm gap-4 rounded-lg border p-6 text-center shadow-xl"
          >
            <div
              class="mx-auto grid size-14 place-items-center text-2xl"
              :class="
                state.won
                  ? 'bg-success text-success-foreground'
                  : 'bg-destructive text-destructive-foreground'
              "
              aria-hidden="true"
            >
              <Icon :name="state.won ? 'tabler:trophy' : 'tabler:alert-triangle'"></Icon>
            </div>
            <h2
              id="sokoban-over-title"
              class="text-highlighted text-xl font-semibold"
            >
              {{ resultTitle }}
            </h2>
            <p class="text-muted-foreground text-sm leading-6">{{ resultCopy }}</p>
            <p class="text-highlighted font-mono text-4xl font-bold tabular-nums">
              {{ state.pushes }} pushes
            </p>
            <p class="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              {{ state.completedLevels }}/{{ state.totalLevels }} levels complete ·
              {{ state.moves }} moves
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
                Try again
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
            icon="tabler:alert-triangle"
          ></StatusMessage>
        </div>
      </div>
      <p class="text-muted-foreground text-center font-mono text-xs">
        {{ state.moves }} moves · {{ state.pushes }} pushes · no account needed
      </p>
    </div>
  </section>
</template>
