<script setup lang="ts">
import type { BoardSize } from "./logic";
import { Button } from "../../../components/ui/button";
import { Field } from "../../../components/ui/field";
import { Select } from "../../../components/ui/select";
import { applyMove, hashSeed, makePuzzle, solveBoard } from "./logic";
const mode = ref("daily");
const size = computed<BoardSize>(() => (mode.value === "six" ? 6 : mode.value === "seven" ? 7 : 5));
const playing = ref(false);
const board = shallowRef<boolean[]>([]);
const moves = ref(0);
const hints = ref(0);
const par = ref(0);
const hint = ref<number | null>(null);
const day = ref("");
const streak = ref(0);
const best = ref<number | null>(null);
const sound = ref(true);
const scored = computed(() => moves.value + hints.value * 2);
const won = computed(
  () => playing.value && board.value.length > 0 && board.value.every((cell) => !cell),
);
const status = computed(() =>
  won.value ? `Circuit cleared in ${scored.value} scored moves.` : "Turn every light off.",
);
let seed = 0;
let hintTimer: ReturnType<typeof setTimeout> | undefined;
const audio = new Map<string, HTMLAudioElement>();
function play(name: "on" | "off" | "win") {
  if (!sound.value) return;
  if (!audio.has(name)) {
    const sources = {
      on: "/game-assets/kenney/ui/Sounds/switch-a.ogg",
      off: "/game-assets/kenney/ui/Sounds/switch-b.ogg",
      win: "/game-assets/kenney/interface-sounds/Audio/confirmation_001.ogg",
    };
    const next = new Audio(sources[name]);
    next.volume = 0.35;
    audio.set(name, next);
  }
  const next = audio.get(name)!;
  next.currentTime = 0;
  void next.play().catch(() => {});
}
function load(puzzleSeed: number) {
  seed = puzzleSeed;
  board.value = makePuzzle(size.value, seed);
  par.value = solveBoard(board.value, size.value).length;
  moves.value = 0;
  hints.value = 0;
  hint.value = null;
  playing.value = true;
}
function begin() {
  day.value = new Date().toISOString().slice(0, 10);
  load(
    mode.value === "daily"
      ? hashSeed(`instruo-lights-out:${day.value}`)
      : Math.floor(Math.random() * 4294967296),
  );
}
function recordWin() {
  if (best.value === null || scored.value < best.value) {
    best.value = scored.value;
    try {
      localStorage.setItem(`instruo:circuit-best:${mode.value}`, String(best.value));
    } catch {}
  }
  if (mode.value !== "daily") return;
  try {
    const key = "instruo-lights-out-streak";
    const previous = JSON.parse(localStorage.getItem(key) ?? "null") as {
      date?: string;
      count?: number;
    } | null;
    if (previous?.date === day.value) return;
    streak.value =
      previous?.date && Date.parse(day.value) - Date.parse(previous.date) === 86400000
        ? (Number(previous.count) || 0) + 1
        : 1;
    localStorage.setItem(key, JSON.stringify({ date: day.value, count: streak.value }));
  } catch {
    /* Storage must never prevent completion. */
  }
}
function toggle(index: number) {
  if (won.value || !playing.value) return;
  const next = [...board.value];
  applyMove(next, index, size.value);
  board.value = next;
  moves.value++;
  hint.value = null;
  play(next[index] ? "on" : "off");
  if (won.value) {
    play("win");
    recordWin();
  }
}
function showHint() {
  const next = solveBoard(board.value, size.value)[0];
  if (next === undefined || won.value) return;
  hints.value++;
  hint.value = next;
  if (hintTimer) clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    hint.value = null;
  }, 1600);
}
watch(mode, () => {
  playing.value = false;
  board.value = [];
  hint.value = null;
  if (hintTimer) clearTimeout(hintTimer);
  readBest();
});
function readBest() {
  try {
    const value = Number(localStorage.getItem(`instruo:circuit-best:${mode.value}`));
    best.value = Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    best.value = null;
  }
}
onMounted(() => {
  readBest();
  day.value = new Date().toISOString().slice(0, 10);
  try {
    const saved = JSON.parse(localStorage.getItem("instruo-lights-out-streak") ?? "null");
    streak.value = Math.max(0, Number(saved?.count) || 0);
    sound.value = localStorage.getItem("instruo-lights-out-sound") !== "off";
  } catch {}
});
watch(sound, (value) => {
  try {
    localStorage.setItem("instruo-lights-out-sound", value ? "on" : "off");
  } catch {}
});
onBeforeUnmount(() => {
  if (hintTimer) clearTimeout(hintTimer);
  for (const item of audio.values()) {
    item.pause();
    item.removeAttribute("src");
    item.load();
  }
  audio.clear();
});
</script>
<template>
  <section
    class="space-y-5"
    aria-label="Daily Circuit"
  >
    <div class="flex flex-wrap items-end justify-between gap-4">
      <Field
        v-slot="{ controlProps }"
        label="Circuit mode"
        class="w-48"
        ><Select
          v-bind="controlProps"
          v-model="mode"
          :options="[
            { value: 'daily', label: 'Daily · 5 × 5' },
            { value: 'classic', label: 'Classic · 5 × 5' },
            { value: 'six', label: 'Progressive · 6 × 6' },
            { value: 'seven', label: 'Progressive · 7 × 7' },
          ]"
      /></Field>
      <Button
        color="secondary"
        variant="ghost"
        :aria-label="sound ? 'Mute game sounds' : 'Unmute game sounds'"
        @click="sound = !sound"
        ><Icon
          :name="sound ? 'tabler:volume' : 'tabler:volume-off'"
          mode="svg"
        />{{ sound ? "Sound on" : "Sound off" }}</Button
      >
    </div>
    <div
      class="dark relative isolate overflow-hidden rounded-xl bg-neutral-950 p-3 sm:p-6"
      data-game-surface="dark"
    >
      <img
        src="/game-arts/lights-out.jpg"
        alt=""
        class="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div class="pointer-events-none absolute inset-0 -z-10 bg-black/70" />
      <div
        v-if="!playing"
        class="flex min-h-80 flex-col items-center justify-center px-4 text-center text-white"
      >
        <h2 class="text-3xl font-medium tracking-tight">Daily Circuit</h2>
        <p class="mt-4 max-w-sm text-sm leading-6 text-neutral-200">
          Every switch changes its neighbors. Can you turn the whole board dark?
        </p>
        <Button
          class="mt-6"
          color="accent"
          @click="begin"
          >Start circuit</Button
        >
        <p
          v-if="mode === 'daily'"
          class="mt-4 text-xs text-neutral-300"
        >
          A new solvable circuit every UTC day.
        </p>
      </div>
      <div
        v-else
        class="mx-auto max-w-lg"
      >
        <div class="mb-5 flex items-center justify-between gap-3 text-white">
          <p
            role="status"
            class="text-sm"
          >
            {{ status }}
          </p>
          <span class="shrink-0 text-xs text-neutral-300">Par {{ par }}</span>
        </div>
        <div
          class="grid gap-1 rounded-xl bg-amber-950/70 p-2 sm:gap-2 sm:p-3"
          :style="{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }"
          role="group"
          aria-label="Lights Out board"
        >
          <button
            v-for="(on, index) in board"
            :key="index"
            type="button"
            :disabled="won"
            :aria-label="`Light ${index + 1}, ${on ? 'on' : 'off'}`"
            :aria-pressed="on"
            class="grid aspect-square min-w-0 touch-manipulation place-items-center rounded-lg border-2 transition-[background-color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-default motion-reduce:transition-none"
            :class="[
              on
                ? 'border-amber-100/80 bg-amber-300 text-amber-950 shadow-[0_0_18px_#fbbf2470,inset_0_2px_8px_#fff8]'
                : 'border-white/10 bg-neutral-900 text-neutral-500 shadow-inner',
              hint === index && 'ring-2 ring-white ring-offset-2 ring-offset-amber-950',
            ]"
            @click="toggle(index)"
          >
            <Icon
              :name="on ? 'tabler:bulb' : 'tabler:bulb-off'"
              mode="svg"
              class="size-5 sm:size-6"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="playing"
      class="flex flex-wrap items-center justify-between gap-4"
    >
      <div class="flex gap-5 text-sm tabular-nums">
        <span
          ><strong>{{ moves }}</strong> moves</span
        ><span class="text-muted-foreground">{{ scored }} scored moves</span
        ><span
          v-if="best !== null"
          class="text-muted-foreground"
          >Best {{ best }}</span
        ><span
          v-if="streak"
          class="text-muted-foreground"
          >{{ streak }} day streak</span
        >
      </div>
      <div class="flex gap-2">
        <Button
          v-if="!won"
          color="secondary"
          variant="outline"
          @click="showHint"
          ><Icon
            name="tabler:bulb"
            mode="svg"
          />Hint +2</Button
        ><Button
          v-if="!won"
          color="secondary"
          variant="ghost"
          @click="load(seed)"
          >Reset circuit</Button
        ><Button
          v-else
          @click="begin"
          >Play again</Button
        >
      </div>
    </div>
    <p class="text-muted-foreground text-xs leading-5">
      Every circuit is solvable. Hints add two moves to your score.
    </p>
  </section>
</template>
