<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";

import { Input } from "~/components/ui/input";
import { useToolTask } from "~/features/tools/useToolTask";
import { decryptAes, encryptAes } from "./aes";
const password = ref("");
const input = ref("");
const { output, error, busy, run } = useToolTask([password, input]);
const { copyText } = useCopyToClipboard();
function encrypt() {
  return run(() => encryptAes(input.value, password.value));
}
function decrypt() {
  return run(() => decryptAes(input.value, password.value));
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5">
      <Field
        label="Password"
        description="The password stays in memory and is used to derive an AES-256 key."
        ><Input
          v-model="password"
          class="w-full"
          type="password"
          placeholder="Encryption password"
        ></Input
      ></Field>
      <div class="grid gap-5 @[48rem]:grid-cols-2">
        <Field
          v-slot="{ controlProps }"
          label="Input"
          ><Textarea
            v-bind="controlProps"
            v-model="input"
            class="w-full"
            :rows="10"
            placeholder="Plaintext or encrypted JSON payload"
          ></Textarea></Field
        ><Field
          v-slot="{ controlProps }"
          label="Output"
          ><Textarea
            v-bind="controlProps"
            v-model="output"
            class="w-full"
            :rows="10"
            readonly
            placeholder="Result appears here."
          ></Textarea
        ></Field>
      </div>

      <StatusMessage
        v-if="error"
        tone="error"
        title="Could not process text"
        :description="error"
      />
      <p class="text-muted-foreground text-xs">
        AES-256-GCM with a random salt and IV, PBKDF2-SHA-256 (100,000 iterations). Protect your
        password and exported payload. No password recovery or storage is provided.
      </p>
      <ToolActions
        ><Button
          color="secondary"
          variant="outline"
          :disabled="!output || busy"
          @click="copyText(output)"
          >Copy output</Button
        >
        <Button
          color="secondary"
          variant="outline"
          :disabled="busy || !password"
          @click="decrypt"
          ><Icon
            name="tabler:lock-open"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Decrypt</Button
        >
        <Button
          :disabled="busy || !password"
          @click="encrypt"
          ><Icon
            name="tabler:lock"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Encrypt</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
