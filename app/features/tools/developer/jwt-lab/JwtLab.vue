<script setup lang="ts">
import StatusLabel from "~/components/adapters/StatusLabel.vue";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";

type JsonObject = Record<string, unknown>;
type InspectionState = "empty" | "valid" | "invalid";

interface Inspection {
  state: InspectionState;
  header: string;
  payload: string;
  error: string;
  hasSignature: boolean;
}

const token = ref("");
const header = ref('{"alg":"none","typ":"JWT"}');
const payload = ref('{"sub":"demo"}');
const headerDescription = 'Example: {"alg":"none","typ":"JWT"}';
const payloadDescription = 'Example: {"sub":"demo"}';

function resetExample() {
  header.value = '{"alg":"none","typ":"JWT"}';
  payload.value = '{"sub":"demo"}';
}

function decodeBase64Url(value: string) {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function parseJsonObject(value: string, label: string): JsonObject {
  const parsed: unknown = JSON.parse(value);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object.`);
  }

  return parsed as JsonObject;
}

const inspection = computed<Inspection>(() => {
  const value = token.value.trim();

  if (!value) {
    return { state: "empty", header: "", payload: "", error: "", hasSignature: false };
  }

  const parts = value.length > 200_000 ? [] : value.split(".");

  if (parts.length !== 3) {
    return {
      state: "invalid",
      header: "",
      payload: "",
      error: "JWT must contain three dot-separated parts: header, payload, and signature.",
      hasSignature: false,
    };
  }

  try {
    const decodedHeader = parseJsonObject(decodeBase64Url(parts[0] ?? ""), "Header");
    const decodedPayload = parseJsonObject(decodeBase64Url(parts[1] ?? ""), "Payload");

    return {
      state: "valid",
      header: JSON.stringify(decodedHeader, null, 2),
      payload: JSON.stringify(decodedPayload, null, 2),
      error: "",
      hasSignature: Boolean(parts[2]),
    };
  } catch {
    return {
      state: "invalid",
      header: "",
      payload: "",
      error: "JWT header or payload is not valid base64url-encoded JSON.",
      hasSignature: false,
    };
  }
});

const generated = computed(() => {
  try {
    if (header.value.length + payload.value.length > 200_000)
      throw new Error("Use JSON smaller than 200,000 characters combined.");
    const parsedHeader = parseJsonObject(header.value, "Header JSON");
    if (parsedHeader.alg !== "none")
      throw new Error('Unsigned output requires header alg: "none".');
    const parsedPayload = parseJsonObject(payload.value, "Payload JSON");

    return {
      token: `${encodeBase64Url(JSON.stringify(parsedHeader))}.${encodeBase64Url(JSON.stringify(parsedPayload))}.`,
      error: "",
    };
  } catch (error) {
    return {
      token: "",
      error:
        error instanceof Error
          ? error.message
          : "Header and payload must contain valid JSON objects.",
    };
  }
});

const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-7">
      <StatusMessage
        tone="warning"
        icon="tabler:alert-triangle"
        title="Unsigned output only"
        description="Generated values have an empty signature. Use them for local demos and decoding only — never for access control or production credentials."
      ></StatusMessage>
      <section class="grid gap-5">
        <div>
          <h2 class="text-highlighted text-base font-semibold">Inspect a token</h2>
          <p class="text-muted-foreground mt-1 text-sm">
            Decode header and payload locally. Signature presence is shown, but never verified.
          </p>
        </div>
        <Field
          v-slot="{ controlProps }"
          label="JWT to inspect"
          description="Paste a three-part token. Nothing leaves your browser."
          ><Textarea
            v-bind="controlProps"
            v-model="token"
            :rows="5"
            class="w-full font-mono"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
          ></Textarea></Field
        ><StatusMessage
          v-if="inspection.state === 'invalid'"
          tone="error"
          icon="tabler:alert-circle"
          title="Could not decode token"
          :description="inspection.error"
        ></StatusMessage>
        <div
          v-else
          class="grid gap-5"
        >
          <div
            v-if="inspection.state === 'valid'"
            class="flex flex-wrap items-center gap-2"
          >
            <StatusLabel :tone="inspection.hasSignature ? 'success' : 'warning'">{{
              inspection.hasSignature ? "Signature present · not verified" : "Unsigned token"
            }}</StatusLabel
            ><span class="text-muted-foreground text-sm"
              >Decoded locally from the pasted value.</span
            >
          </div>
          <div class="grid gap-5 @[48rem]:grid-cols-2">
            <Field
              v-slot="{ controlProps }"
              label="Header JSON"
              description="Algorithm and token metadata."
              ><Textarea
                language="json"
                v-bind="controlProps"
                :model-value="inspection.header"
                :rows="7"
                readonly
                class="w-full font-mono"
                placeholder="Decoded header appears here."
              ></Textarea></Field
            ><Field
              v-slot="{ controlProps }"
              label="Payload JSON"
              description="Claims carried by the token."
              ><Textarea
                language="json"
                v-bind="controlProps"
                :model-value="inspection.payload"
                :rows="7"
                readonly
                class="w-full font-mono"
                placeholder="Decoded payload appears here."
              ></Textarea
            ></Field>
          </div>
        </div>
      </section>
      <div class="border-border border-t"></div>
      <section class="grid gap-5">
        <div>
          <h2 class="text-highlighted text-base font-semibold">Create an unsigned token</h2>
          <p class="text-muted-foreground mt-1 text-sm">
            Shape JSON for a demo token. The final signature segment stays empty by design.
          </p>
        </div>
        <div class="grid gap-5 @[48rem]:grid-cols-2">
          <Field
            v-slot="{ controlProps }"
            label="Header JSON"
            :description="headerDescription"
            ><Textarea
              v-bind="controlProps"
              v-model="header"
              language="json"
              :rows="7"
              class="w-full font-mono"
              spellcheck="false"
            ></Textarea></Field
          ><Field
            v-slot="{ controlProps }"
            label="Payload JSON"
            :description="payloadDescription"
            ><Textarea
              v-bind="controlProps"
              v-model="payload"
              language="json"
              :rows="7"
              class="w-full font-mono"
              spellcheck="false"
            ></Textarea
          ></Field>
        </div>
        <StatusMessage
          v-if="generated.error"
          tone="error"
          icon="tabler:braces"
          title="Invalid JSON"
          :description="generated.error"
        ></StatusMessage
        ><Field
          v-slot="{ controlProps }"
          label="Token-shaped output"
          description="Unsigned output ends with a trailing dot because no signature is created."
          ><Textarea
            v-bind="controlProps"
            :model-value="generated.token"
            :rows="4"
            readonly
            class="w-full font-mono"
            placeholder="Encoded value appears here."
          ></Textarea
        ></Field>
        <ToolActions>
          <Button
            color="secondary"
            variant="ghost"
            @click="resetExample"
            ><Icon
              name="tabler:refresh"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Reset example</Button
          >
          <Button
            :disabled="!generated.token"
            color="secondary"
            variant="outline"
            @click="copyText(generated.token)"
            ><Icon
              name="tabler:copy"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Copy token-shaped value</Button
          >
        </ToolActions>
      </section>
    </div>
  </ToolWorkspace>
</template>
