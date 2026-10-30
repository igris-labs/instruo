<script setup lang="ts">
import type { BreakoutGameState } from "./createBreakoutGame";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import GameCanvas from "~/components/product/GameCanvas.vue";
import GameFullscreenButton from "~/components/product/GameFullscreenButton.vue";

import { Button } from "~/components/ui/button";
import { createBreakoutGame } from "./createBreakoutGame";

const gameHost = useTemplateRef<typeof GameCanvas>("gameHost");
const loaded = ref(false);
const gameError = ref(false);
const state = shallowRef<BreakoutGameState>({
  status: "ready",
  score: 0,
  lives: 3,
  level: 1,
  bricks: 48,
  totalBricks: 48,
  won: false,
});

const resultTitle = computed(() => `Run over at level ${state.value.level}`);
const resultCopy = computed(() => "Keep the paddle under the ball and try another angle.");

function updateState(next: Record<string, unknown>) {
  if (
    (next.status === "ready" || next.status === "playing" || next.status === "over") &&
    typeof next.score === "number" &&
    typeof next.lives === "number" &&
    typeof next.level === "number" &&
    typeof next.bricks === "number" &&
    typeof next.totalBricks === "number" &&
    typeof next.won === "boolean"
  ) {
    state.value = {
      status: next.status,
      score: next.score,
      lives: next.lives,
      level: next.level,
      bricks: next.bricks,
      totalBricks: next.totalBricks,
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
          <p class="text-highlighted text-sm font-semibold">Breakout</p>
          <p class="text-muted-foreground mt-1 font-mono text-xs">
            Brick Yard · continuous seeded run
          </p>
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
        style="--phaser-game-loading-bg: #101b2d"
      >
        <GameCanvas
          ref="gameHost"
          class="aspect-[21/32]"
          :create="createBreakoutGame"
          label="Breakout game stage"
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
              <Icon name="tabler:arrows-horizontal"></Icon>
            </div>
            <h2 class="text-highlighted text-xl font-semibold">Keep the ball alive</h2>
            <p class="text-muted-foreground text-sm leading-6">
              Drag the paddle under the ball. Keyboard players can use ← → or A / D. Break every
              brick to unlock a faster pattern.
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
            <p class="text-muted-foreground font-mono text-xs">Drag · ← → · A D</p>
          </div>
        </div>
        <div
          v-if="loaded && state.status === 'over'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
          role="status"
          aria-labelledby="breakout-over-title"
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
              id="breakout-over-title"
              class="text-highlighted text-xl font-semibold"
            >
              {{ resultTitle }}
            </h2>
            <p class="text-muted-foreground text-sm leading-6">{{ resultCopy }}</p>
            <p class="text-highlighted font-mono text-5xl font-bold tabular-nums">
              {{ state.score }}
            </p>
            <p class="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              Level {{ state.level }} · {{ state.lives }} lives left
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
        Level {{ state.level }} · {{ state.bricks }}/{{ state.totalBricks }} bricks remain · no
        account needed
      </p>
    </div>
  </section>
</template>
