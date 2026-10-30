<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { downloadBlob } from "~/utils/browser-tools";
import { formatElapsed, useStopwatch } from "./useStopwatch";
const {
  elapsed,
  running,
  laps,
  display,
  fastest,
  slowest,
  average,
  start,
  pause,
  lap,
  reset,
  csv,
} = useStopwatch();
function exportLaps() {
  downloadBlob(new Blob([csv.value], { type: "text/csv;charset=utf-8" }), "stopwatch-laps.csv");
}
function keyboard(event: KeyboardEvent) {
  if (
    event.target !== event.currentTarget ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.repeat
  )
    return;
  if (event.code === "Space") {
    event.preventDefault();
    if (running.value) pause();
    else start();
  }
  if (event.key.toLowerCase() === "l") lap();
  if (event.key.toLowerCase() === "r" && !running.value) reset();
}
</script>
<template>
  <ToolWorkspace>
    <div
      tabindex="0"
      class="focus-visible:outline-ring rounded-lg outline-offset-4 focus-visible:outline-2"
      aria-label="Stopwatch controls. Space starts or pauses. L records a lap. R resets when paused."
      @keydown="keyboard"
    >
      <div class="grid gap-6 @[48rem]:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <section
          class="bg-muted/30 grid min-h-80 content-center gap-7 rounded-lg p-5 sm:p-8"
          aria-label="Stopwatch timer"
        >
          <p
            class="text-center text-sm font-medium"
            :class="running ? 'text-success' : elapsed ? 'text-warning' : 'text-muted-foreground'"
            role="status"
          >
            {{ running ? "Running" : elapsed ? "Paused" : "Ready to start" }}
          </p>
          <output
            role="timer"
            aria-live="off"
            aria-label="Elapsed time"
            class="text-highlighted block text-center font-mono text-[clamp(2.2rem,6cqw,5rem)] leading-none font-semibold tracking-tight tabular-nums"
            >{{ display }}</output
          >
          <ToolActions class="justify-center!">
            <Button
              color="secondary"
              variant="ghost"
              :disabled="!elapsed"
              @click="reset"
              ><Icon
                name="tabler:rotate"
                class="mr-1.5"
              />Reset</Button
            >
            <Button
              color="secondary"
              variant="outline"
              :disabled="!running || laps.length >= 500"
              @click="lap"
              ><Icon
                name="tabler:flag"
                class="mr-1.5"
              />Lap</Button
            >
            <Button
              v-if="!running"
              @click="start"
              ><Icon
                name="tabler:player-play"
                class="mr-1.5"
              />{{ elapsed ? "Resume" : "Start" }}</Button
            >
            <Button
              v-else
              @click="pause"
              ><Icon
                name="tabler:player-pause"
                class="mr-1.5"
              />Pause</Button
            >
          </ToolActions>
          <p class="text-muted-foreground text-center text-xs">
            Focus this panel: Space to start/pause · L for lap · R to reset when paused.
          </p>
        </section>
        <aside
          class="border-border grid content-start gap-6 rounded-lg border p-5 sm:p-6"
          aria-label="Session summary"
        >
          <h2 class="font-semibold">This session</h2>
          <dl class="grid gap-5">
            <div>
              <dt class="text-muted-foreground text-xs">Laps recorded</dt>
              <dd class="mt-1 font-mono text-2xl tabular-nums">
                {{ laps.length }}<span class="text-muted-foreground text-xs"> / 500</span>
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Average lap</dt>
              <dd class="mt-1 font-mono tabular-nums">
                {{ average === null ? "—" : formatElapsed(average) }}
              </dd>
            </div>
            <div>
              <dt class="text-muted-foreground text-xs">Fastest / slowest lap</dt>
              <dd class="mt-1 font-mono text-sm tabular-nums">
                {{ fastest === null ? "—" : formatElapsed(fastest) }} /
                {{ slowest === null ? "—" : formatElapsed(slowest) }}
              </dd>
            </div>
          </dl>
          <p class="text-muted-foreground text-xs">
            Times stay in this tab. Download laps before resetting or leaving.
          </p>
        </aside>
      </div>
    </div>
    <section aria-label="Lap history">
      <header class="flex items-center justify-between gap-4">
        <h2 class="font-semibold">Laps</h2>
        <Button
          color="secondary"
          variant="outline"
          :disabled="!laps.length"
          @click="exportLaps"
          ><Icon
            name="tabler:download"
            class="mr-1.5"
          />Export CSV</Button
        >
      </header>
      <div class="border-border mt-4 max-h-96 overflow-auto rounded-lg border">
        <table
          v-if="laps.length"
          class="w-full text-left text-sm"
        >
          <thead class="bg-card sticky top-0">
            <tr class="border-border border-b">
              <th
                scope="col"
                class="px-5 py-3 font-medium"
              >
                Lap
              </th>
              <th
                scope="col"
                class="px-5 py-3 font-medium"
              >
                Split
              </th>
              <th
                scope="col"
                class="px-5 py-3 font-medium"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in [...laps].reverse()"
              :key="item.number"
              class="border-border border-b last:border-0"
            >
              <th
                scope="row"
                class="px-5 py-3 font-mono font-normal tabular-nums"
              >
                {{ item.number }}
              </th>
              <td
                class="px-5 py-3 font-mono tabular-nums"
                :class="
                  item.split === fastest
                    ? 'text-success'
                    : item.split === slowest
                      ? 'text-warning'
                      : ''
                "
              >
                {{ formatElapsed(item.split)
                }}<span
                  v-if="item.split === fastest || item.split === slowest"
                  class="ml-2 font-sans text-xs"
                  >{{ item.split === fastest ? "Fastest" : "Slowest" }}</span
                >
              </td>
              <td class="px-5 py-3 font-mono tabular-nums">{{ formatElapsed(item.total) }}</td>
            </tr>
          </tbody>
        </table>
        <p
          v-else
          class="text-muted-foreground px-5 py-7 text-center text-sm"
        >
          Start the stopwatch, then record a lap to compare split times.
        </p>
      </div>
    </section>
  </ToolWorkspace>
</template>
