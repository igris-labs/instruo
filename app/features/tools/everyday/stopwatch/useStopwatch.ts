import { computed, onBeforeUnmount, ref, shallowRef } from "vue";

export function formatElapsed(milliseconds: number) {
  const value = Math.max(0, Math.floor(milliseconds / 10));
  const minutes = Math.floor(value / 6000)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(value / 100) % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${(value % 100)
    .toString()
    .padStart(2, "0")}`;
}
export function useStopwatch() {
  const elapsed = ref(0);
  const running = ref(false);
  const laps = shallowRef<Array<{ number: number; split: number; total: number }>>([]);
  let timer: ReturnType<typeof setInterval> | undefined;
  let startedAt = 0;
  let carried = 0;
  const display = computed(() => formatElapsed(elapsed.value));
  const fastest = computed(() =>
    laps.value.length > 1 ? Math.min(...laps.value.map((lap) => lap.split)) : null,
  );
  const slowest = computed(() =>
    laps.value.length > 1 ? Math.max(...laps.value.map((lap) => lap.split)) : null,
  );
  const average = computed(() =>
    laps.value.length ? laps.value.at(-1)!.total / laps.value.length : null,
  );
  function tick() {
    elapsed.value = carried + performance.now() - startedAt;
  }
  function start() {
    if (running.value) return;
    startedAt = performance.now();
    running.value = true;
    timer = setInterval(tick, 30);
  }
  function pause() {
    if (running.value) tick();
    carried = elapsed.value;
    running.value = false;
    clearInterval(timer);
    timer = undefined;
  }
  function lap() {
    if (!running.value || laps.value.length >= 500) return;
    tick();
    laps.value = [
      ...laps.value,
      {
        number: laps.value.length + 1,
        split: elapsed.value - (laps.value.at(-1)?.total ?? 0),
        total: elapsed.value,
      },
    ];
  }
  function reset() {
    pause();
    carried = elapsed.value = 0;
    laps.value = [];
  }
  const csv = computed(
    () =>
      `Lap,Split,Total\n${laps.value
        .map((lap) => [lap.number, formatElapsed(lap.split), formatElapsed(lap.total)].join(","))
        .join("\n")}`,
  );
  onBeforeUnmount(() => {
    clearInterval(timer);
  });
  return {
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
  };
}
