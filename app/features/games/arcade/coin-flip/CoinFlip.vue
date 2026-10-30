<script setup lang="ts">
import { Button } from "~/components/ui/button";

const result = ref<"Heads" | "Tails" | null>(null);
const flipping = ref(false);
const flips = ref(0);
let timer: ReturnType<typeof setTimeout> | undefined;

const statusText = computed(() =>
  flipping.value
    ? "Flipping…"
    : result.value
      ? `${result.value}. Flip again?`
      : "Call it, then flip.",
);

function flip() {
  if (flipping.value) return;
  flipping.value = true;
  result.value = null;
  timer = setTimeout(() => {
    result.value = Math.random() < 0.5 ? "Heads" : "Tails";
    flips.value += 1;
    flipping.value = false;
  }, 560);
}

onBeforeUnmount(() => timer && clearTimeout(timer));
</script>
<template>
  <section
    data-ui
    aria-label="Interactive workspace"
    class="min-w-0 space-y-5"
  >
    <div class="mx-auto grid max-w-xl gap-6">
      <div class="border-border/70 flex items-center justify-between gap-4 border-b pb-4">
        <p
          class="text-muted-foreground text-sm"
          role="status"
          aria-live="polite"
        >
          {{ statusText }}
        </p>
        <span class="text-muted-foreground shrink-0 font-mono text-xs uppercase"
          >{{ flips }} tosses</span
        >
      </div>
      <div
        class="coin-console border-border/70 bg-muted/20 grid justify-items-center gap-7 border p-6 text-center sm:p-8"
      >
        <div class="coin-disc-wrap">
          <button
            type="button"
            class="coin-disc focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none active:scale-95"
            :class="flipping ? 'coin-disc--flipping' : ''"
            aria-label="Tap coin to flip"
            :disabled="flipping"
            @click="flip"
          >
            <Icon
              name="tabler:coin"
              class="coin-disc__icon"
              aria-hidden="true"
            ></Icon
            ><Transition
              name="coin-face"
              mode="out-in"
              ><strong
                :key="result || 'ready'"
                class="coin-disc__label"
                >{{ result?.toUpperCase() || "READY" }}</strong
              ></Transition
            ><span class="coin-disc__odds">50 / 50</span>
          </button>
        </div>
        <div class="grid gap-1">
          <span class="text-muted-foreground font-mono text-[0.7rem] tracking-[0.16em] uppercase"
            >Last toss</span
          ><strong class="text-highlighted text-2xl font-semibold">{{
            result || "Not started"
          }}</strong
          ><span class="text-muted-foreground text-sm">Heads or tails. One clean result.</span>
        </div>
      </div>
      <div class="flex justify-center">
        <Button
          class="min-w-40 justify-center"
          :loading="flipping"
          @click="flip"
          ><Icon
            name="tabler:arrows-shuffle"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Flip coin</Button
        >
      </div>
    </div>
  </section>
</template>
<style scoped>
.coin-disc {
  display: grid;
  width: clamp(10rem, 42vw, 13rem);
  aspect-ratio: 1;
  align-content: center;
  justify-items: center;
  gap: 0.35rem;
  border: 0.65rem solid color-mix(in srgb, #e8b457 72%, var(--background));
  border-radius: 50%;
  background: #e8b457;
  color: #2e210c;
  box-shadow:
    inset 0 0 0 0.2rem #fff4d438,
    0 1rem 2rem #e8b45738;
  transform-style: preserve-3d;
}

.coin-disc__icon {
  width: 2.1rem;
  height: 2.1rem;
  opacity: 0.88;
}
.coin-disc__label {
  font-family: var(--font-mono);
  font-size: clamp(1.35rem, 5vw, 2rem);
  letter-spacing: 0.08em;
}
.coin-disc__odds {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  opacity: 0.76;
}
.coin-disc--flipping {
  animation: coin-spin 560ms cubic-bezier(0.25, 0.7, 0.35, 1);
}

.coin-face-enter-active,
.coin-face-leave-active {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}
.coin-face-enter-from,
.coin-face-leave-to {
  opacity: 0;
  transform: translateY(0.25rem);
}

@keyframes coin-spin {
  to {
    transform: rotateY(720deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .coin-disc--flipping,
  .coin-face-enter-active,
  .coin-face-leave-active {
    animation: none;
    transition: none;
  }
}
</style>
