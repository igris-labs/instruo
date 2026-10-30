<script setup lang="ts">
import { useToast } from "akaza-ui";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { Field } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Menu } from "../components/ui/menu";
import { NumberField } from "../components/ui/number-field";
import { Select } from "../components/ui/select";
import { Tabs } from "../components/ui/tabs";

useHead({ title: "IPEX conformance" });
const theme = useColorMode();
const text = ref("");
const count = ref(2.5);
const selected = ref("webp");
const open = ref(false);
const tab = ref("inputs");
const toast = useToast();
</script>

<template>
  <main class="text-foreground mx-auto max-w-3xl p-6">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">IPEX conformance</h1>
      <Button
        variant="ghost"
        @click="theme.preference = theme.value === 'dark' ? 'light' : 'dark'"
        >Toggle theme</Button
      >
    </div>
    <div class="mb-6 flex flex-wrap gap-2">
      <Button data-testid="primary">Primary</Button>
      <Button
        color="accent"
        data-testid="accent"
        >Accent</Button
      >
      <Button
        color="secondary"
        variant="soft"
        >Secondary</Button
      >
      <Button disabled>Disabled</Button>
      <Button loading>Working</Button>
    </div>
    <Tabs
      v-model="tab"
      :items="[
        { value: 'inputs', label: 'Inputs' },
        { value: 'overlays', label: 'Overlays' },
      ]"
    >
      <template #panel-inputs>
        <div class="grid gap-5 py-5">
          <Field
            v-slot="{ controlProps }"
            label="Name"
            ><Input
              v-bind="controlProps"
              v-model="text"
              placeholder="Placeholder"
          /></Field>
          <Field
            v-slot="{ controlProps }"
            label="Amount"
            ><NumberField
              v-bind="controlProps"
              v-model="count"
              :step="0.1"
          /></Field>
          <Field
            v-slot="{ controlProps }"
            label="Format"
            ><Select
              v-bind="controlProps"
              v-model="selected"
              :options="[
                { label: 'WebP', value: 'webp' },
                { label: 'PNG', value: 'png' },
              ]"
          /></Field>
          <p role="status">Selected: {{ selected }} · Amount: {{ count }}</p>
        </div>
      </template>
      <template #panel-overlays>
        <div class="flex flex-wrap gap-2 py-5">
          <Dialog
            v-model="open"
            title="Test dialog"
          >
            <template #trigger="{ toggle }"><Button @click="toggle">Open dialog</Button></template>
            <template #body
              ><Field
                v-slot="{ controlProps }"
                label="Dialog input"
                ><Input v-bind="controlProps" /></Field
            ></template>
          </Dialog>
          <Menu
            :items="[
              { value: 'copy', label: 'Copy' },
              { value: 'download', label: 'Download' },
            ]"
          >
            <template #trigger="{ toggle }"
              ><Button
                color="secondary"
                variant="outline"
                @click="toggle"
                >Actions</Button
              ></template
            >
          </Menu>
          <Button
            color="secondary"
            variant="outline"
            @click="toast.add({ title: 'Test notification', type: 'success' })"
            >Notify</Button
          >
        </div>
      </template>
    </Tabs>
  </main>
</template>
