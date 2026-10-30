<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

interface MatchResult {
  index: number;
  length: number;
  value: string;
}

const pattern = ref("\\btool\\b");
const flags = ref("gi");
const input = ref("");
const { copyText } = useCopyToClipboard();

const result = ref<{ error: string; matches: MatchResult[] }>({ error: "", matches: [] });
const busy = ref(false);
let worker: Worker | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let debounce: ReturnType<typeof setTimeout> | undefined;
let mounted = false;
function stop() {
  worker?.terminate();
  worker = undefined;
  clearTimeout(timer);
  busy.value = false;
}
function fail(message: string) {
  stop();
  result.value = { error: message, matches: [] };
}
function run() {
  if (!pattern.value) return;
  try {
    const current = new Worker(new URL("./regex.worker.ts", import.meta.url), { type: "module" });
    worker = current;
    current.onmessage = ({ data }) => {
      if (worker !== current) return;
      stop();
      result.value = data;
    };
    current.onerror = () =>
      fail("Could not start background testing. Check browser worker support.");
    current.postMessage({ pattern: pattern.value, flags: flags.value, input: input.value });
    timer = setTimeout(
      fail,
      1500,
      "Pattern took too long and was stopped. Simplify it to avoid excessive backtracking.",
    );
  } catch {
    fail("Your browser blocked background pattern testing.");
  }
}
function schedule() {
  stop();
  clearTimeout(debounce);
  result.value = { error: "", matches: [] };
  busy.value = !!pattern.value;
  if (mounted) debounce = setTimeout(run, 180);
}
watch([pattern, flags, input], schedule, { flush: "sync" });
onMounted(() => {
  mounted = true;
  schedule();
});
onBeforeUnmount(() => {
  stop();
  clearTimeout(debounce);
});
const output = computed(() => result.value.matches.map((match) => match.value).join("\n"));
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6">
      <div class="grid gap-4 @[30rem]:grid-cols-[minmax(0,1fr)_9rem]">
        <Field
          label="Pattern"
          description="Use JavaScript regular expression syntax."
          :error="result.error || undefined"
          ><Input
            v-model="pattern"
            class="w-full"
            placeholder="\\bword\\b"
          ></Input></Field
        ><Field
          label="Flags"
          description="For example, gi."
          ><Input
            v-model="flags"
            class="w-full font-mono"
            placeholder="gi"
          ></Input
        ></Field>
      </div>
      <Field
        v-slot="{ controlProps }"
        label="Test text"
        ><Textarea
          v-bind="controlProps"
          v-model="input"
          :rows="10"
          class="w-full"
          placeholder="Paste text to test…"
        ></Textarea
      ></Field>
      <section
        class="border-border/70 border-t pt-5"
        aria-live="polite"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-highlighted font-semibold">Matches</h2>
          <span class="text-muted-foreground font-mono text-sm tabular-nums">{{
            result.matches.length
          }}</span>
        </div>
        <p
          v-if="!result.matches.length"
          class="text-muted-foreground border-border mt-4 rounded-md border p-4 text-sm"
        >
          {{
            busy
              ? "Testing in a background worker…"
              : result.error
                ? "Fix the pattern or input to continue."
                : "No matches. Add test text or adjust the pattern."
          }}
        </p>
        <ol
          v-else
          class="border-border/70 mt-4 border-t"
        >
          <li
            v-for="match in result.matches"
            :key="`${match.index}-${match.value}`"
            class="border-border/70 flex items-center justify-between gap-4 border-b py-3 font-mono text-sm"
          >
            <code class="text-highlighted break-all">{{ match.value }}</code
            ><span class="text-muted-foreground shrink-0">index {{ match.index }}</span>
          </li>
        </ol>
      </section>
      <ToolActions>
        <Button
          :disabled="!output"
          color="secondary"
          variant="outline"
          @click="copyText(output)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy matches</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
