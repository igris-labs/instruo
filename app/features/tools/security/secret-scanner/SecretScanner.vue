<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Field } from "~/components/ui/field";

interface Finding {
  kind: string;
  line: number;
  preview: string;
}
const source = ref(`const stripeKey = "sk_live_1234567890abcdef";\nconst password = "change-me";`);
const patterns: [string, RegExp][] = [
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["Private key", /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/],
  ["GitHub token", /gh[pousr]_\w{20,}/],
  ["Stripe secret", /sk_(live|test)_\w{12,}/],
  [
    "Generic secret assignment",
    /(?:password|secret|token|api[_-]?key)\s*[:=]\s*["'][^"']{6,}["']/i,
  ],
];
const findings = computed<Finding[]>(() => {
  const result: Finding[] = [];
  source.value
    .slice(0, 200_000)
    .split("\n")
    .forEach((line, index) => {
      for (const [kind, pattern] of patterns) {
        const match = line.match(pattern);
        if (match?.[0])
          result.push({
            kind,
            line: index + 1,
            preview:
              match[0].length > 10
                ? `${match[0].slice(0, 4)}…${match[0].slice(-4)}`
                : "Possible secret",
          });
      }
    });
  return result.slice(0, 200);
});
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5 @[48rem]:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <Field
        v-slot="{ controlProps }"
        label="Code or configuration"
        :error="
          source.length > 200_000
            ? 'Only the first 200,000 characters are scanned. Use a smaller snippet.'
            : undefined
        "
        ><Textarea
          v-bind="controlProps"
          v-model="source"
          :rows="20"
          class="w-full font-mono"
        ></Textarea
      ></Field>
      <div class="grid content-start gap-3">
        <div class="border-border bg-muted/20 rounded-md border p-4">
          <p class="text-muted-foreground text-xs">Findings (up to 200)</p>
          <p class="text-highlighted mt-1 text-3xl font-semibold tabular-nums">
            {{ findings.length }}
          </p>
        </div>
        <ul
          v-if="findings.length"
          class="grid gap-2"
          aria-live="polite"
        >
          <li
            v-for="finding in findings"
            :key="`${finding.line}-${finding.kind}`"
            class="border-border rounded-md border p-3"
          >
            <p class="font-medium">{{ finding.kind }}</p>
            <p class="text-muted-foreground mt-1 text-xs">
              Line {{ finding.line }} · {{ finding.preview }}
            </p>
          </li>
        </ul>
        <StatusMessage
          v-else
          tone="success"
          title="No common patterns found"
          description="This scanner is heuristic. Review code manually before sharing it."
        ></StatusMessage>
      </div>
    </div>
  </ToolWorkspace>
</template>
