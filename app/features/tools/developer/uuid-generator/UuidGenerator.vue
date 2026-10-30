<script setup lang="ts">
import { v1, v3, v4, v5, v6, v7 } from "uuid";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";

import { selectOptions } from "~/features/tools/options";

type UuidVersion = "v1" | "v3" | "v4" | "v5" | "v6" | "v7";
type NamespacePreset = "dns" | "url";

const versionItems = [
  { label: "UUID v1", value: "v1" },
  { label: "UUID v3", value: "v3" },
  { label: "UUID v4", value: "v4" },
  { label: "UUID v5", value: "v5" },
  { label: "UUID v6", value: "v6" },
  { label: "UUID v7", value: "v7" },
];
const namespaceItems = [
  { label: "URL namespace", value: "url" },
  { label: "DNS namespace", value: "dns" },
];
const versionDescriptions: Record<UuidVersion, string> = {
  v1: "Time-based UUID with a random node identifier.",
  v3: "Deterministic UUID generated from a name using MD5.",
  v4: "Random UUID generated with a cryptographic random source.",
  v5: "Deterministic UUID generated from a name using SHA-1.",
  v6: "Reordered time-based UUID designed for database locality.",
  v7: "Unix timestamp UUID designed for sortable records.",
};

const count = ref(1);
const version = ref<UuidVersion>("v4");
const name = ref("https://example.com");
const namespacePreset = ref<NamespacePreset>("url");
const ids = shallowRef<string[]>([]);
const { copyText } = useCopyToClipboard();

const isNameBased = computed(() => version.value === "v3" || version.value === "v5");
const output = computed(() => ids.value.join("\n"));
const description = computed(() => versionDescriptions[version.value]);

function createUuid() {
  switch (version.value) {
    case "v1":
      return v1();
    case "v3":
      return v3(name.value, namespacePreset.value === "dns" ? v3.DNS : v3.URL);
    case "v4":
      return v4();
    case "v5":
      return v5(name.value, namespacePreset.value === "dns" ? v5.DNS : v5.URL);
    case "v6":
      return v6();
    case "v7":
      return v7();
  }
}

function generate() {
  const total = isNameBased.value ? 1 : Math.min(50, Math.max(1, Math.floor(count.value || 1)));
  ids.value = Array.from({ length: total }, createUuid);
}

function selectVersion(value: string) {
  version.value = value as UuidVersion;
  generate();
}

onMounted(generate);
watch(
  [count, name, namespacePreset],
  () => {
    ids.value = [];
  },
  { flush: "sync" },
);
</script>
<template>
  <ToolWorkspace>
    <div class="grid gap-6">
      <div class="grid gap-5 @[30rem]:grid-cols-2">
        <Field
          label="UUID version"
          :description="description"
          ><Select
            :model-value="version"
            class="w-full"
            :options="selectOptions(versionItems)"
            @update:model-value="selectVersion"
          ></Select></Field
        ><template v-if="isNameBased"
          ><Field
            label="Name"
            description="The same name and namespace always return the same UUID."
            ><Input
              v-model="name"
              class="w-full"
              placeholder="https://example.com"
            ></Input></Field
          ><Field
            label="Namespace"
            description="Use URL or DNS semantics."
            ><Select
              v-model="namespacePreset"
              class="w-full"
              :options="selectOptions(namespaceItems)"
            ></Select></Field></template
        ><Field
          v-else
          label="Number of UUIDs"
          description="Generate up to 50 at once."
          ><NumberField
            v-model="count"
            :min="1"
            :max="50"
            class="w-full"
          ></NumberField
        ></Field>
      </div>
      <Field
        v-slot="{ controlProps }"
        :label="`UUID ${version} output`"
        ><Textarea
          v-bind="controlProps"
          :model-value="output"
          readonly
          :rows="Math.min(Math.max(ids.length, 3), 10)"
          class="w-full"
        ></Textarea
      ></Field>

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
          />Copy output</Button
        >
        <Button @click="generate"
          ><Icon
            name="tabler:refresh"
            mode="svg"
            class="mr-1.5"
            aria-hidden="true"
          />Generate</Button
        >
      </ToolActions>
    </div>
  </ToolWorkspace>
</template>
