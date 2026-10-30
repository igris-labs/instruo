<script setup lang="ts">
import { useLocalStorage, useMounted, useNow } from "@vueuse/core";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Select } from "~/components/ui/select";

import { selectOptions } from "~/features/tools/options";

interface ClockPreference {
  id: string;
  zone: string;
}

const defaultClocks: ClockPreference[] = [
  { id: "local", zone: "Local" },
  { id: "utc", zone: "UTC" },
  { id: "new-york", zone: "America/New_York" },
  { id: "tokyo", zone: "Asia/Tokyo" },
];

const zoneOptions = [
  { label: "Local time", value: "Local" },
  { label: "UTC", value: "UTC" },
  { label: "Los Angeles", value: "America/Los_Angeles" },
  { label: "New York", value: "America/New_York" },
  { label: "Toronto", value: "America/Toronto" },
  { label: "São Paulo", value: "America/Sao_Paulo" },
  { label: "London", value: "Europe/London" },
  { label: "Paris", value: "Europe/Paris" },
  { label: "Berlin", value: "Europe/Berlin" },
  { label: "Dubai", value: "Asia/Dubai" },
  { label: "Kolkata", value: "Asia/Kolkata" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
  { label: "Auckland", value: "Pacific/Auckland" },
];

const savedClocks = useLocalStorage<ClockPreference[]>("instruo-world-clock-zones", defaultClocks, {
  initOnMounted: true,
});
const timeFormat = useLocalStorage<"12" | "24">("instruo-world-clock-format", "12", {
  initOnMounted: true,
});
const mounted = useMounted();
const now = useNow({ scheduler: (update) => useIntervalFn(update, 1000) });
const { copyText } = useCopyToClipboard();

function zoneLabel(zone: string) {
  return zoneOptions.find((option) => option.value === zone)?.label ?? zone.replaceAll("_", " ");
}

function formatInZone(zone: string, options: Intl.DateTimeFormatOptions) {
  if (!mounted.value) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: zone === "Local" ? undefined : zone,
    }).format(now.value);
  } catch {
    return "Unavailable";
  }
}

watch(
  savedClocks,
  (value) => {
    if (
      !Array.isArray(value) ||
      value.length > 6 ||
      value.some(
        (clock) =>
          !clock ||
          typeof clock.id !== "string" ||
          !zoneOptions.some((zone) => zone.value === clock.zone),
      )
    )
      savedClocks.value = defaultClocks.map((clock) => ({ ...clock }));
  },
  { immediate: true },
);
const clocks = computed(() =>
  savedClocks.value.map((clock) => ({
    ...clock,
    label: zoneLabel(clock.zone),
    time: formatInZone(clock.zone, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: timeFormat.value === "12",
    }),
    date: formatInZone(clock.zone, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    offset: formatInZone(clock.zone, {
      timeZoneName: "shortOffset",
    })
      .split(", ")
      .at(-1),
  })),
);

function updateZone(index: number, zone: string | undefined) {
  if (!zone) return;
  savedClocks.value = savedClocks.value.map((clock, clockIndex) =>
    clockIndex === index ? { ...clock, zone } : clock,
  );
}

function addClock() {
  if (savedClocks.value.length >= 6) return;
  const unused = zoneOptions.find(
    (option) => !savedClocks.value.some((clock) => clock.zone === option.value),
  );
  savedClocks.value = [
    ...savedClocks.value,
    {
      id: globalThis.crypto?.randomUUID?.() ?? `clock-${Date.now()}`,
      zone: unused?.value ?? "UTC",
    },
  ];
}

function removeClock(id: string) {
  if (savedClocks.value.length === 1) return;
  savedClocks.value = savedClocks.value.filter((clock) => clock.id !== id);
}

function copyClock(clock: (typeof clocks.value)[number]) {
  copyText(`${clock.label}: ${clock.time}, ${clock.date} (${clock.offset})`);
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <div class="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div>
          <h2 class="text-highlighted text-base font-semibold">Your clocks</h2>
          <p class="text-muted-foreground mt-1 text-sm">
            Add up to 6 zones. Changes save automatically.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <ToolActions>
            <Button
              color="secondary"
              :variant="timeFormat === '12' ? 'soft' : 'ghost'"
              :aria-pressed="timeFormat === '12'"
              @click="timeFormat = '12'"
              >12 hour</Button
            >
            <Button
              color="secondary"
              :variant="timeFormat === '24' ? 'soft' : 'ghost'"
              :aria-pressed="timeFormat === '24'"
              @click="timeFormat = '24'"
              >24 hour</Button
            >
          </ToolActions>
          <Button
            color="secondary"
            variant="outline"
            :disabled="savedClocks.length >= 6"
            @click="addClock"
            ><Icon
              name="tabler:plus"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Add clock</Button
          >
        </div>
      </div>
      <div class="grid gap-4 @[40rem]:grid-cols-2">
        <section
          v-for="(clock, index) in clocks"
          :key="clock.id"
          class="border-border bg-muted/30 rounded-lg border"
        >
          <header class="border-border bg-card rounded-t-lg border-b p-4 sm:p-5">
            <div class="flex items-end gap-3">
              <Field
                :label="`Clock ${index + 1}`"
                class="min-w-0 flex-1"
                ><Select
                  :model-value="clock.zone"
                  class="w-full"
                  :options="selectOptions(zoneOptions)"
                  @update:model-value="updateZone(index, $event)"
                ></Select></Field
              ><Button
                aria-label="Remove clock"
                color="secondary"
                variant="ghost"
                :disabled="clocks.length === 1"
                class="mb-0.5 shrink-0"
                @click="removeClock(clock.id)"
                ><Icon
                  name="tabler:trash"
                  mode="svg"
                  class="mr-1.5"
                  aria-hidden="true"
              /></Button>
            </div>
          </header>
          <div class="p-5 sm:p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-muted-foreground text-sm font-medium">{{ clock.label }}</p>
                <p
                  class="text-highlighted mt-3 font-mono text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl"
                >
                  {{ clock.time || "--:--:--" }}
                </p>
              </div>
              <Button
                color="secondary"
                variant="soft"
                aria-label="Copy clock time"
                @click="copyClock(clock)"
                ><Icon
                  name="tabler:copy"
                  mode="svg"
                  class="mr-1.5"
                  aria-hidden="true"
              /></Button>
            </div>
            <div
              class="border-border mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4"
            >
              <p class="text-muted-foreground text-sm">{{ clock.date || "Loading local clock" }}</p>
              <p class="text-muted-foreground font-mono text-xs">{{ clock.offset }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </ToolWorkspace>
</template>
