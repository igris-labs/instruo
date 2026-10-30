<script setup lang="ts">
import type { MazeChaseGameState } from "./createMazeChaseGame";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import GameCanvas from "~/components/product/GameCanvas.vue";
import GameFullscreenButton from "~/components/product/GameFullscreenButton.vue";

import { Button } from "~/components/ui/button";
import { createMazeChaseGame } from "./createMazeChaseGame";

const gameHost = useTemplateRef<typeof GameCanvas>("gameHost");
const loaded = ref(false);
const gameError = ref(false);
const soundMuted = ref(false);
const state = shallowRef<MazeChaseGameState>({
  status: "ready",
  score: 0,
  best: 0,
  lives: 3,
  level: 1,
  pellets: 0,
  totalPellets: 0,
  powered: false,
  won: false,
});

const resultTitle = computed(() => (state.value.won ? "Arcade cleared" : "The maze got you"));
const resultCopy = computed(() =>
  state.value.won
    ? "Ten neon mazes cleared. That route belongs to you."
    : "The ghosts caught the route. Learn the turns and run it back.",
);
const progressCopy = computed(() =>
  state.value.powered
    ? "POWER MODE · ghosts are vulnerable"
    : `${state.value.pellets} pellets remain · ${state.value.lives} lives left`,
);

function updateState(next: Record<string, unknown>) {
  if (
    (next.status === "ready" || next.status === "playing" || next.status === "over") &&
    typeof next.score === "number" &&
    typeof next.best === "number" &&
    typeof next.lives === "number" &&
    typeof next.level === "number" &&
    typeof next.pellets === "number" &&
    typeof next.totalPellets === "number" &&
    typeof next.powered === "boolean" &&
    typeof next.won === "boolean"
  ) {
    state.value = {
      status: next.status,
      score: next.score,
      best: next.best,
      lives: next.lives,
      level: next.level,
      pellets: next.pellets,
      totalPellets: next.totalPellets,
      powered: next.powered,
      won: next.won,
    };
  }
}

function toggleSound() {
  soundMuted.value = !soundMuted.value;
  gameHost.value?.toggleMute();
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
          <p class="text-highlighted text-sm font-semibold">Maze Chase</p>
          <p class="text-muted-foreground mt-1 font-mono text-xs">Neon Arcade · ten seeded mazes</p>
        </div>
        <div class="text-muted-foreground flex items-center gap-3 font-mono text-xs">
          <Button
            v-if="loaded"
            type="button"
            color="secondary"
            variant="ghost"
            shape="icon"
            class="size-9"
            :aria-pressed="soundMuted"
            :aria-label="soundMuted ? 'Turn sound on' : 'Mute sound'"
            @click="toggleSound"
          >
            <Icon
              :name="soundMuted ? 'tabler:volume-off' : 'tabler:volume'"
              aria-hidden="true"
            ></Icon></Button
          ><span
            >Level <strong class="text-highlighted">{{ state.level }}/10</strong></span
          >
        </div>
      </header>
      <div
        class="border-border relative overflow-hidden rounded-lg border"
        data-phaser-game-shell
        style="--phaser-game-loading-bg: #080b22"
      >
        <GameCanvas
          ref="gameHost"
          class="aspect-[21/32]"
          :create="createMazeChaseGame"
          label="Maze Chase game stage"
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
              <Icon name="tabler:ghost-2"></Icon>
            </div>
            <h2 class="text-highlighted text-xl font-semibold">Enter the maze</h2>
            <p class="text-muted-foreground text-sm leading-6">
              Clear every pellet, grab a power pellet, and turn the chase around while the ghosts
              are blue.
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
                Start chase
              </span>
            </Button>
            <p class="text-muted-foreground font-mono text-xs">
              Swipe or arrows / WASD · Space starts
            </p>
          </div>
        </div>
        <div
          v-if="loaded && state.status === 'over'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
          role="status"
          aria-labelledby="maze-chase-over-title"
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
              <Icon :name="state.won ? 'tabler:trophy' : 'tabler:ghost-2'"></Icon>
            </div>
            <h2
              id="maze-chase-over-title"
              class="text-highlighted text-xl font-semibold"
            >
              {{ resultTitle }}
            </h2>
            <p class="text-muted-foreground text-sm leading-6">{{ resultCopy }}</p>
            <p class="text-highlighted font-mono text-5xl font-bold tabular-nums">
              {{ state.score }}
            </p>
            <p class="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              Best {{ state.best }} · Level {{ state.level }}
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
                Run it back
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
        {{ progressCopy }} · score {{ state.score }} · no account needed
      </p>
    </div>
  </section>
</template>
