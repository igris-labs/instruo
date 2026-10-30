<script setup lang="ts">
import type { BlackjackGameState } from "./createBlackjackGame";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import GameCanvas from "~/components/product/GameCanvas.vue";
import GameFullscreenButton from "~/components/product/GameFullscreenButton.vue";

import { Button } from "~/components/ui/button";
import { createBlackjackGame } from "./createBlackjackGame";

const gameHost = useTemplateRef<typeof GameCanvas>("gameHost");
const loaded = ref(false);
const gameError = ref(false);
const state = shallowRef<BlackjackGameState>({
  status: "ready",
  dealing: false,
  playerScore: 0,
  dealerScore: -1,
  playerCards: 0,
  dealerCards: 0,
  result: "",
});

const canAct = computed(() => state.value.status === "playing" && !state.value.dealing);
const dealerScoreLabel = computed(() =>
  state.value.dealerScore < 0 ? "?" : String(state.value.dealerScore),
);
const playerScoreLabel = computed(() =>
  state.value.playerScore ? String(state.value.playerScore) : "—",
);
const outcomeTone = computed(() =>
  state.value.result === "You win." || state.value.result === "Blackjack!"
    ? "text-success"
    : "text-highlighted",
);

function updateState(next: Record<string, unknown>) {
  if (
    (next.status === "ready" || next.status === "playing" || next.status === "over") &&
    typeof next.dealing === "boolean" &&
    typeof next.playerScore === "number" &&
    typeof next.dealerScore === "number" &&
    typeof next.playerCards === "number" &&
    typeof next.dealerCards === "number" &&
    typeof next.result === "string"
  ) {
    state.value = {
      status: next.status,
      dealing: next.dealing,
      playerScore: next.playerScore,
      dealerScore: next.dealerScore,
      playerCards: next.playerCards,
      dealerCards: next.dealerCards,
      result: next.result,
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
    <div class="mx-auto grid max-w-2xl gap-5">
      <header class="border-border/70 flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <p class="text-highlighted text-sm font-semibold">Blackjack</p>
          <p class="text-muted-foreground mt-1 font-mono text-xs">Felt Table · local dealer</p>
        </div>
        <div class="text-muted-foreground flex gap-3 font-mono text-xs">
          <span class="text-highlighted">Dealer {{ dealerScoreLabel }}</span
          ><span class="text-highlighted">You {{ playerScoreLabel }}</span>
        </div>
      </header>
      <div
        class="border-border relative overflow-hidden rounded-lg border"
        data-phaser-game-shell
        style="--phaser-game-loading-bg: #0a2d29"
        :class="{ 'is-over': loaded && state.status === 'over' }"
      >
        <GameCanvas
          ref="gameHost"
          class="aspect-[21/32]"
          :create="createBlackjackGame"
          label="Blackjack game stage"
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
            <h2 class="text-highlighted text-xl font-semibold">Take a seat</h2>
            <p class="text-muted-foreground text-sm leading-6">
              Build a hand closer to 21 than the dealer. Aces count as 1 or 11; dealer stands on 17.
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
                Deal hand
              </span>
            </Button>
            <p class="text-muted-foreground font-mono text-xs">H / Space hit · S / Enter stand</p>
          </div>
        </div>
        <div
          v-if="loaded && state.status === 'over'"
          class="bg-background/70 absolute inset-0 z-10 grid place-items-center p-5"
          role="status"
          aria-labelledby="blackjack-over-title"
        >
          <div
            class="border-border bg-card grid w-full max-w-sm gap-4 rounded-lg border p-6 text-center shadow-xl"
          >
            <div
              class="mx-auto grid size-14 place-items-center text-2xl"
              :class="
                state.result === 'You win.' || state.result === 'Blackjack!'
                  ? 'bg-success text-success-foreground'
                  : 'bg-primary text-primary-foreground'
              "
              aria-hidden="true"
            >
              <Icon
                :name="
                  state.result === 'You win.' || state.result === 'Blackjack!'
                    ? 'tabler:trophy'
                    : 'tabler:cards'
                "
              ></Icon>
            </div>
            <h2
              id="blackjack-over-title"
              class="text-highlighted text-xl font-semibold"
            >
              {{ state.result }}
            </h2>
            <p
              class="font-mono text-4xl font-bold tabular-nums"
              :class="outcomeTone"
            >
              {{ state.playerScore }} <span class="text-muted-foreground text-xl">·</span>
              {{ state.dealerScore }}
            </p>
            <p class="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              You · Dealer
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
                Deal again
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
      <div class="flex flex-wrap justify-center gap-2">
        <Button
          :disabled="!canAct"
          @click="gameHost?.start('hit')"
          ><Icon
            name="tabler:plus"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Hit</Button
        ><Button
          color="secondary"
          variant="outline"
          :disabled="!canAct"
          @click="gameHost?.start('stand')"
          ><Icon
            name="tabler:hand-stop"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Stand</Button
        ><Button
          color="secondary"
          variant="ghost"
          :disabled="!loaded || state.status === 'playing'"
          @click="gameHost?.restart()"
          ><Icon
            name="tabler:refresh"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />New hand</Button
        >
      </div>
      <p class="text-muted-foreground text-center font-mono text-xs">
        {{ state.playerCards }} player cards · {{ state.dealerCards }} dealer cards · no account
        needed
      </p>
    </div>
  </section>
</template>
