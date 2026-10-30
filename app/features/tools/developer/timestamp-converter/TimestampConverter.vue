<script setup lang="ts">
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { dateInZone } from "../../everyday/dateMath";

type TimestampUnit = "milliseconds" | "seconds";

const unitItems: { label: string; value: TimestampUnit }[] = [
  { label: "Seconds", value: "seconds" },
  { label: "Milliseconds", value: "milliseconds" },
];

const timestampInput = ref("");
const timestampUnit = ref<TimestampUnit>("seconds");
const dateInput = ref("");
const { copyText } = useCopyToClipboard();

const timestampDate = computed(() => {
  const value = Number(timestampInput.value);
  if (!timestampInput.value.trim() || !Number.isFinite(value)) return null;
  const date = new Date(timestampUnit.value === "seconds" ? value * 1_000 : value);
  return Number.isNaN(date.getTime()) ? null : date;
});

const timestampResult = computed(() => {
  const date = timestampDate.value;
  if (!date) return null;
  return {
    iso: date.toISOString(),
    local: date.toLocaleString(),
    utc: date.toUTCString(),
  };
});

const dateResult = computed(() => {
  if (!dateInput.value) return null;
  let date: Date;
  try {
    date = dateInZone(dateInput.value);
  } catch {
    return null;
  }
  if (Number.isNaN(date.getTime())) return null;
  return {
    milliseconds: String(date.getTime()),
    seconds: String(Math.floor(date.getTime() / 1_000)),
  };
});

function localDateTimeValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function useCurrentTime() {
  const now = new Date();
  timestampInput.value = String(
    timestampUnit.value === "seconds" ? Math.floor(now.getTime() / 1_000) : now.getTime(),
  );
  dateInput.value = localDateTimeValue(now);
}

function setUnit(value: string | undefined) {
  if (value !== "seconds" && value !== "milliseconds") return;
  const currentDate = timestampDate.value;
  timestampUnit.value = value;
  if (!currentDate) return;
  timestampInput.value = String(
    value === "seconds" ? Math.floor(currentDate.getTime() / 1_000) : currentDate.getTime(),
  );
}

onMounted(useCurrentTime);
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-8 lg:gap-10 @[48rem]:grid-cols-2">
      <section class="grid content-start gap-5">
        <div>
          <p class="text-highlighted font-semibold">Timestamp to date</p>
          <p class="text-muted-foreground mt-1 text-sm leading-6">
            Read a Unix timestamp in seconds or milliseconds.
          </p>
        </div>
        <div class="grid gap-4 @[30rem]:grid-cols-[minmax(0,1fr)_11rem]">
          <Field
            label="Timestamp"
            :error="
              timestampInput && !timestampResult ? 'Enter a valid Unix timestamp.' : undefined
            "
            ><Input
              v-model="timestampInput"
              inputmode="numeric"
              placeholder="1710000000"
              class="w-full"
            ></Input></Field
          ><Field label="Unit"
            ><Select
              :model-value="timestampUnit"
              class="w-full"
              :options="selectOptions(unitItems)"
              @update:model-value="setUnit"
            ></Select
          ></Field>
        </div>
        <dl class="border-border/70 divide-outline/70 divide-y overflow-hidden rounded-lg border-y">
          <div class="grid gap-1 py-4">
            <dt class="text-muted-foreground text-xs">ISO 8601</dt>
            <dd class="text-highlighted font-mono text-sm break-all">
              {{ timestampResult?.iso || "Waiting for a valid timestamp." }}
            </dd>
          </div>
          <div class="grid gap-1 py-4">
            <dt class="text-muted-foreground text-xs">Local time</dt>
            <dd class="text-highlighted font-mono text-sm">
              {{ timestampResult?.local || "Not available" }}
            </dd>
          </div>
          <div class="grid gap-1 py-4">
            <dt class="text-muted-foreground text-xs">UTC</dt>
            <dd class="text-highlighted font-mono text-sm">
              {{ timestampResult?.utc || "Not available" }}
            </dd>
          </div>
        </dl>
        <ToolActions>
          <Button
            color="secondary"
            variant="ghost"
            @click="useCurrentTime"
            ><Icon
              name="tabler:clock"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Use current time</Button
          >
          <Button
            :disabled="!timestampResult"
            color="secondary"
            variant="outline"
            @click="copyText(timestampResult?.iso || '')"
            ><Icon
              name="tabler:copy"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Copy ISO time</Button
          >
        </ToolActions>
      </section>
      <section
        class="border-border/70 grid content-start gap-5 border-t pt-8 @[48rem]:border-t-0 @[48rem]:border-l @[48rem]:pt-0 @[48rem]:pl-8"
      >
        <div>
          <p class="text-highlighted font-semibold">Date to timestamp</p>
          <p class="text-muted-foreground mt-1 text-sm leading-6">
            The selected value is interpreted in your local time zone.
          </p>
        </div>
        <Field
          label="Local date and time"
          :error="dateInput && !dateResult ? 'Choose a valid date and time.' : undefined"
          ><Input
            v-model="dateInput"
            type="datetime-local"
            class="w-full"
          ></Input
        ></Field>
        <dl class="border-border/70 divide-outline/70 divide-y overflow-hidden rounded-lg border-y">
          <div class="grid gap-1 py-4">
            <dt class="text-muted-foreground text-xs">Seconds</dt>
            <dd class="text-highlighted font-mono text-lg tabular-nums">
              {{ dateResult?.seconds || "Not available" }}
            </dd>
          </div>
          <div class="grid gap-1 py-4">
            <dt class="text-muted-foreground text-xs">Milliseconds</dt>
            <dd class="text-highlighted font-mono text-lg tabular-nums">
              {{ dateResult?.milliseconds || "Not available" }}
            </dd>
          </div>
        </dl>
        <ToolActions>
          <Button
            :disabled="!dateResult"
            color="secondary"
            variant="outline"
            @click="copyText(dateResult?.seconds || '')"
            ><Icon
              name="tabler:copy"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Copy seconds</Button
          >
        </ToolActions>
      </section>
    </div>
  </ToolWorkspace>
</template>
