<script setup lang="ts">
import type { ConnectFourGameState } from "./createConnectFourGame";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import GameCanvas from "~/components/product/GameCanvas.vue";
import GameFullscreenButton from "~/components/product/GameFullscreenButton.vue";

import { Button } from "~/components/ui/button";
import { createConnectFourGame } from "./createConnectFourGame";

const gameHost = useTemplateRef<typeof GameCanvas>("gameHost");
const loaded = ref(false);
const gameError = ref(false);
const state = shallowRef<ConnectFourGameState>({
  status: "ready",
  currentPlayer: "red",
  winner: null,
  moves: 0,
  winningLine: [],
});

const playerLabel = computed(() => (state.value.currentPlayer === "red" ? "Red" : "Yellow"));
const resultTitle = computed(() =>
  state.value.winner ? `${state.value.winner === "red" ? "Red" : "Yellow"} wins` : "Board full",
);
const resultCopy = computed(() =>
  state.value.winner
    ? "Four connected. Clean drop, strong finish."
    : "Every slot is filled. Reset and try a new opening.",
);

function updateState(next: Record<string, unknown>) {
  if (
    (next.status === "ready" || next.status === "playing" || next.status === "over") &&
    (next.currentPlayer === "red" || next.currentPlayer === "yellow") &&
    (next.winner === null || next.winner === "red" || next.winner === "yellow") &&
    typeof next.moves === "number" &&
    Array.isArray(next.winningLine)
  ) {
    state.value = {
      status: next.status,
      currentPlayer: next.currentPlayer,
      winner: next.winner,
      moves: next.moves,
      winningLine: next.winningLine.filter((value): value is number => typeof value === "number"),
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
          <p class="text-highlighted text-sm font-semibold">Connect Four</p>
          <p class="text-muted-foreground mt-1 font-mono text-xs">
            Drop Zone · two-player local match
          </p>
        </div>
        <div class="text-muted-foreground flex items-center gap-3 font-mono text-xs">
          <span>{{ playerLabel }} to move</span
          ><span
            ><strong class="text-highlighted">{{ state.moves }}</strong
            >/42</span
          >
        </div>
      </header>
      <div
        class="border-border relative overflow-hidden rounded-lg border"
        data-phaser-game-shell
        style="--phaser-game-loading-bg: #162336"
      >
        <GameCanvas
          ref="gameHost"
          class="aspect-[21/32]"
          :create="createConnectFourGame"
          label="Connect Four game stage"
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
              <Icon name="tabler:circle-dot"></Icon>
            </div>
            <h2 class="text-highlighted text-xl font-semibold">Set your opening</h2>
            <p class="text-muted-foreground text-sm leading-6">
              Red starts. Drop discs, watch them bounce into place, and build a line before your
              opponent does.
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
                Start match</span
              >
            </Button>
            <p class="text-muted-foreground font-mono text-xs">Tap a column · arrows + Enter</p>
          </div>
        </div>
        <div
          v-if="loaded && state.status === 'over'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
          role="status"
          aria-labelledby="connect-four-over-title"
        >
          <div
            class="border-border bg-card grid w-full max-w-sm gap-4 rounded-lg border p-6 text-center shadow-xl"
          >
            <div
              class="bg-primary text-primary-foreground mx-auto grid size-14 place-items-center text-2xl"
              aria-hidden="true"
            >
              <Icon :name="state.winner ? 'tabler:trophy' : 'tabler:equal'"></Icon>
            </div>
            <h2
              id="connect-four-over-title"
              class="text-highlighted text-xl font-semibold"
            >
              {{ resultTitle }}
            </h2>
            <p class="text-muted-foreground text-sm leading-6">{{ resultCopy }}</p>
            <p class="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              {{ state.moves }} moves played
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
                New match</span
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
        Red starts · bounce, block, connect four · no account needed
      </p>
    </div>
  </section>
</template>
