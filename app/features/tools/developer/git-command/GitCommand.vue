<script setup lang="ts">
import CodeBlock from "~/components/code/CodeBlock.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";

const action = ref("commit");
const branch = ref("main");
const message = ref("update");
const files = ref("");
function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}
const error = computed(() =>
  ["branch", "push"].includes(action.value) &&
  (!branch.value ||
    branch.value.startsWith("-") ||
    /[\s~^:?*[\\]/.test(branch.value) ||
    branch.value.includes(".."))
    ? "Use a valid branch name, without spaces, '..', or a leading dash."
    : "",
);
const command = computed(() => {
  if (error.value) return "";
  const target = files.value.trim() ? ` ${shellQuote(files.value.trim())}` : " .";
  if (action.value === "branch")
    return `git switch -c ${shellQuote(branch.value || "feature/name")}`;
  if (action.value === "push")
    return `git add --${target} && git commit -m ${shellQuote(message.value || "update")} && git push -u origin ${shellQuote(branch.value || "main")}`;
  if (action.value === "log") return "git log --oneline --decorate --graph -20";
  return `git add --${target} && git commit -m ${shellQuote(message.value || "update")}`;
});
const { copyText } = useCopyToClipboard();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6">
      <div class="grid gap-5 @[48rem]:grid-cols-2">
        <Field label="Action"
          ><Select
            v-model="action"
            class="w-full"
            :options="
              selectOptions([
                { label: 'Commit', value: 'commit' },
                { label: 'Commit and push', value: 'push' },
                { label: 'Create branch', value: 'branch' },
                { label: 'Recent log', value: 'log' },
              ])
            "
          ></Select></Field
        ><Field
          label="Branch"
          :error="error || undefined"
          ><Input
            v-model="branch"
            :disabled="!['branch', 'push'].includes(action)"
            class="w-full"
          ></Input></Field
        ><Field label="Message"
          ><Input
            v-model="message"
            :disabled="!['commit', 'push'].includes(action)"
            class="w-full"
          ></Input></Field
        ><Field
          label="Files"
          description="One file or folder path. Leave empty to stage all changes."
          ><Input
            v-model="files"
            :disabled="!['commit', 'push'].includes(action)"
            class="w-full"
            placeholder="src/"
          ></Input
        ></Field>
      </div>
      <section class="bg-muted/55 ring-border overflow-hidden rounded-md ring-1">
        <header class="border-border flex items-center justify-between gap-4 border-b px-4 py-3">
          <div>
            <h2 class="text-highlighted text-sm font-medium">Generated command</h2>
            <p class="text-muted-foreground mt-0.5 text-xs">
              Review before running it in your terminal.
            </p>
          </div>
          <Button
            color="secondary"
            variant="outline"
            :disabled="!command"
            @click="copyText(command)"
            ><Icon
              name="tabler:copy"
              mode="svg"
              class="mr-1.5"
              aria-hidden="true"
            />Copy command</Button
          >
        </header>
        <CodeBlock
          class="text-highlighted min-h-28 overflow-x-auto p-4 font-mono text-sm leading-6 whitespace-pre-wrap sm:p-5"
          language="bash"
          :code="command"
        />
      </section>
    </div>
  </ToolWorkspace>
</template>
