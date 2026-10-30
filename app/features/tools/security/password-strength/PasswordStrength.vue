<script setup lang="ts">
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import { usePasswordStrength } from "./usePasswordStrength";
const { password, visible, assessment } = usePasswordStrength();
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6 @[48rem]:grid-cols-2">
      <section
        class="border-border grid content-start gap-6 rounded-lg border p-5 sm:p-6"
        aria-label="Password assessment"
      >
        <h2 class="font-semibold">Check a password</h2>
        <Field
          label="Password"
          description="Checked on this device. Never saved or sent to a server."
          ><div class="flex items-center gap-2">
            <Input
              v-model="password"
              class="min-w-0 flex-1"
              :type="visible ? 'text' : 'password'"
              autocomplete="off"
              spellcheck="false"
              placeholder="Type a password to check"
            /><Button
              color="secondary"
              variant="ghost"
              :aria-label="visible ? 'Hide password' : 'Show password'"
              :aria-pressed="visible"
              @click="visible = !visible"
              ><Icon :name="visible ? 'tabler:eye-off' : 'tabler:eye'"
            /></Button></div
        ></Field>
        <div class="flex items-baseline justify-between gap-4">
          <strong
            class="text-2xl"
            :class="assessment.text"
            role="status"
            >{{ assessment.label }}</strong
          ><span class="text-muted-foreground text-xs tabular-nums"
            >{{ password.length }} characters</span
          >
        </div>
        <Progress
          :model-value="assessment.score"
          :max="5"
          :ui="{ indicator: assessment.bar }"
          aria-label="Estimated password strength"
          :aria-valuetext="assessment.label"
        />
        <p class="text-muted-foreground text-sm">
          An estimate, not a security guarantee. This does not check breaches, personal information,
          or reuse.
        </p>
      </section>
      <section
        class="bg-muted/30 grid content-start gap-5 rounded-lg p-5 sm:p-6"
        aria-label="Password guidance"
      >
        <h2 class="font-semibold">What makes it harder to guess?</h2>
        <ul class="grid gap-4">
          <li
            v-for="check in assessment.checks"
            :key="check.label"
            class="flex items-start gap-3 text-sm"
          >
            <Icon
              :name="check.passed ? 'tabler:circle-check' : 'tabler:circle'"
              class="mt-0.5 size-5 shrink-0"
              :class="check.passed ? 'text-success' : 'text-muted-foreground'"
            /><span
              >{{ check.label
              }}<span class="sr-only">{{ check.passed ? ": met" : ": not met" }}</span></span
            >
          </li>
        </ul>
        <p class="text-muted-foreground text-sm text-pretty">
          Use a unique password for every account. A password manager can create and store long,
          random passwords.
        </p>
        <NuxtLink
          to="/tools/password-generator"
          class="text-info w-fit text-sm underline underline-offset-4"
          >Create a random password</NuxtLink
        >
      </section>
    </div>
  </ToolWorkspace>
</template>
