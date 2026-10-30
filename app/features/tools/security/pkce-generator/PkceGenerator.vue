<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useToolTask } from "~/features/tools/useToolTask";
const { output, error, busy, run } = useToolTask([]);
const pair = computed(() =>
  output.value ? (JSON.parse(output.value) as { verifier: string; challenge: string }) : null,
);
const verifier = computed(() => pair.value?.verifier ?? "");
const challenge = computed(() => pair.value?.challenge ?? "");
const { copyText } = useCopyToClipboard();
function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
function generate() {
  return run(async () => {
    const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64Url(
      new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))),
    );
    return JSON.stringify({ verifier, challenge });
  });
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <Field label="Code verifier"
        ><Input
          v-model="verifier"
          readonly
          class="w-full font-mono"
        ></Input></Field
      ><Field label="S256 code challenge"
        ><Input
          v-model="challenge"
          readonly
          class="w-full font-mono"
        ></Input
      ></Field>
      <StatusMessage
        v-if="error"
        tone="error"
        title="Operation failed"
        :description="error"
      />
      <p class="text-muted-foreground text-xs">
        Send the S256 challenge with the authorization request. Keep the verifier until the token
        exchange; never send it with the authorization request.
      </p>
      <ToolActions
        ><Button
          color="secondary"
          variant="outline"
          :disabled="!verifier"
          @click="copyText(verifier)"
          >Copy verifier</Button
        ><Button
          color="secondary"
          variant="outline"
          :disabled="!challenge"
          @click="copyText(challenge)"
          >Copy challenge</Button
        >
        <Button
          class="w-fit"
          :disabled="busy"
          @click="generate"
          ><Icon
            name="tabler:shield-check"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Generate PKCE pair</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
