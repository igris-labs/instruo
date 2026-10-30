<script setup lang="ts">
import Textarea from "~/components/adapters/Textarea.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Field } from "~/components/ui/field";

import { checkHtml } from "./checkHtml";
const html = ref(
  '<html><main><h1>Welcome</h1><img src="hero.jpg"><button>Continue</button></main></html>',
);
const findings = computed(() => checkHtml(html.value));
const errors = computed(() => findings.value.filter((item) => item.severity === "error").length);
const warnings = computed(
  () => findings.value.filter((item) => item.severity === "warning").length,
);
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-5 @[48rem]:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
      <Field
        v-slot="{ controlProps }"
        label="HTML source"
        ><Textarea
          v-bind="controlProps"
          v-model="html"
          language="html"
          :rows="20"
          class="w-full font-mono"
        ></Textarea
      ></Field>
      <div class="grid content-start gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-muted/30 rounded-md p-4">
            <p class="text-muted-foreground text-xs">Errors</p>
            <p class="text-destructive mt-1 text-2xl font-semibold">{{ errors }}</p>
          </div>
          <div class="bg-muted/30 rounded-md p-4">
            <p class="text-muted-foreground text-xs">Warnings</p>
            <p class="text-warning mt-1 text-2xl font-semibold">{{ warnings }}</p>
          </div>
        </div>
        <ul
          class="grid gap-3"
          aria-live="polite"
        >
          <li
            v-for="finding in findings"
            :key="finding.title"
            class="border-border bg-muted/20 rounded-md border p-4"
          >
            <div class="flex items-start gap-3">
              <Icon
                :name="
                  finding.severity === 'error'
                    ? 'tabler:alert-circle'
                    : finding.severity === 'warning'
                      ? 'tabler:alert-triangle'
                      : 'tabler:check'
                "
                :class="
                  finding.severity === 'error'
                    ? 'text-destructive'
                    : finding.severity === 'warning'
                      ? 'text-warning'
                      : 'text-success'
                "
                class="mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              ></Icon>
              <div>
                <p class="font-medium">{{ finding.title }}</p>
                <p class="text-muted-foreground mt-1 text-sm">{{ finding.detail }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </ToolWorkspace>
</template>
