<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";

import { totp } from "./totp";
const secret = ref("");
const account = ref("");
const issuer = ref("");
const code = ref("");
const error = ref("");
const algorithm = ref<"SHA-1" | "SHA-256" | "SHA-512">("SHA-1");
const digits = ref(6);
const period = ref(30);
const now = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;
const remaining = computed(() => {
  if (!now.value) return period.value;
  return period.value - (now.value % period.value);
});
const progress = computed(() => (remaining.value / period.value) * 100);
const { copyText } = useCopyToClipboard();

let request = 0;
let active = false;
let lastCounter = -1;
watch(
  [secret, algorithm, digits, period],
  () => {
    request++;
    code.value = "";
    error.value = "";
    active = false;
  },
  { flush: "sync" },
);
async function generate() {
  const id = ++request;
  error.value = "";
  now.value = Math.floor(Date.now() / 1000);
  try {
    const value = await totp(secret.value, now.value, digits.value, period.value, algorithm.value);
    if (id !== request) return;
    code.value = value;
    active = true;
    lastCounter = Math.floor(now.value / period.value);
  } catch (cause) {
    if (id !== request) return;
    code.value = "";
    active = false;
    error.value = cause instanceof Error ? cause.message : "Could not generate code.";
  }
}
function importUri() {
  try {
    const uri = new URL(secret.value);
    if (uri.protocol !== "otpauth:" || uri.hostname !== "totp")
      throw new Error("Paste an otpauth:// URI or a Base32 secret.");
    secret.value = uri.searchParams.get("secret") ?? "";
    issuer.value = uri.searchParams.get("issuer") ?? "";
    account.value = decodeURIComponent(uri.pathname.replace(/^\//, ""));
    const uriAlgorithm = (uri.searchParams.get("algorithm") ?? "SHA1")
      .toUpperCase()
      .replace(/^SHA-?/, "SHA-");
    if (uriAlgorithm === "SHA-1" || uriAlgorithm === "SHA-256" || uriAlgorithm === "SHA-512") {
      algorithm.value = uriAlgorithm;
    }
    const uriDigits = Number(uri.searchParams.get("digits"));
    if (uriDigits === 6 || uriDigits === 8) digits.value = uriDigits;
    const uriPeriod = Number(uri.searchParams.get("period"));
    if (Number.isInteger(uriPeriod) && uriPeriod >= 5 && uriPeriod <= 300) period.value = uriPeriod;
    void generate();
  } catch {
    error.value = "That does not look like a valid otpauth:// URI.";
  }
}

onMounted(() => {
  now.value = Math.floor(Date.now() / 1000);
  timer = setInterval(() => {
    now.value = Math.floor(Date.now() / 1000);
    if (active && Math.floor(now.value / period.value) !== lastCounter) void generate();
  }, 1000);
});
onBeforeUnmount(() => {
  request++;
  if (timer) clearInterval(timer);
});
</script>
<template>
  <ToolWorkspace layout="form">
    <div class="grid gap-5">
      <Field label="Secret or otpauth URI"
        ><Input
          v-model="secret"
          class="w-full font-mono"
          placeholder="JBSWY3DPEHPK3PXP"
          @keyup.enter="generate"
        ></Input
      ></Field>

      <StatusMessage
        v-if="error"
        tone="error"
        icon="tabler:alert-circle"
        title="Could not generate code"
        :description="error"
      ></StatusMessage>
      <div class="border-border bg-card grid gap-3 rounded-lg border p-5 text-center">
        <span class="text-muted-foreground text-sm">{{
          issuer || account || "Authenticator code"
        }}</span
        ><output
          class="text-highlighted font-mono text-5xl font-semibold tracking-[0.25em] tabular-nums"
          aria-live="polite"
          >{{ code || "-".repeat(digits) }}</output
        ><Progress
          :model-value="progress"
          aria-label="Code lifetime"
        ></Progress
        ><span class="text-muted-foreground text-sm"
          >Refreshes in {{ remaining }}s · {{ algorithm }} · {{ digits }} digits</span
        ><Button
          class="mx-auto"
          :disabled="!code"
          color="secondary"
          variant="outline"
          @click="copyText(code)"
          ><Icon
            name="tabler:copy"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Copy code</Button
        >
      </div>
      <p class="text-muted-foreground text-sm">
        TOTP secrets are sensitive. Use this tool on a trusted device and never share the secret.
      </p>
      <ToolActions>
        <Button
          color="secondary"
          variant="outline"
          @click="importUri"
          >Read URI</Button
        >
        <Button @click="generate"
          ><Icon
            name="tabler:key"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Generate code</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
