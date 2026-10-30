<script setup lang="ts">
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Accordion } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import { Input, inputVariants } from "~/components/ui/input";
import { NumberField } from "~/components/ui/number-field";
import { Select } from "~/components/ui/select";
import { selectOptions } from "~/features/tools/options";
import { downloadBlob, downloadDataUrl } from "~/utils/browser-tools";
import { useQrGenerator } from "./useQrGenerator";
const {
  kind,
  value,
  password,
  security,
  subject,
  size,
  margin,
  level,
  shape,
  foreground,
  background,
  contrast,
  inverted,
  image,
  svg,
  error,
  pending,
  ready,
} = useQrGenerator();
function downloadSvg() {
  downloadBlob(new Blob([svg.value], { type: "image/svg+xml" }), "qr-code.svg");
}
</script>
<template>
  <ToolWorkspace>
    <div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <section
        class="border-border grid gap-6 rounded-lg border p-5 sm:p-6"
        aria-label="QR code settings"
      >
        <h2 class="font-semibold">Content and appearance</h2>
        <Field label="Content type"
          ><Select
            v-model="kind"
            class="w-full"
            :options="[
              { label: 'Website URL', value: 'url' },
              { label: 'Plain text', value: 'text' },
              { label: 'Wi-Fi network', value: 'wifi' },
              { label: 'Email address', value: 'email' },
            ]"
        /></Field>
        <Field
          v-slot="{ controlProps }"
          :label="
            kind === 'wifi'
              ? 'Network name (SSID)'
              : kind === 'email'
                ? 'Email address'
                : kind === 'url'
                  ? 'Website URL'
                  : 'Text'
          "
          ><Textarea
            v-if="kind === 'text'"
            v-bind="controlProps"
            v-model="value"
            class="w-full"
            :rows="4"
            placeholder="What should the code contain?" /><Input
            v-else
            v-bind="controlProps"
            v-model="value"
            class="w-full"
            :placeholder="
              kind === 'url'
                ? 'https://example.com'
                : kind === 'wifi'
                  ? 'My Wi-Fi network'
                  : 'name@example.com'
            "
        /></Field>
        <template v-if="kind === 'wifi'"
          ><Field label="Network security"
            ><Select
              v-model="security"
              class="w-full"
              :options="[
                { label: 'WPA / WPA2', value: 'WPA' },
                { label: 'WEP', value: 'WEP' },
                { label: 'Open network', value: 'nopass' },
              ]" /></Field
          ><Field
            v-if="security !== 'nopass'"
            label="Wi-Fi password"
            ><Input
              v-model="password"
              type="password"
              class="w-full"
              autocomplete="off" /></Field
        ></template>
        <Field
          v-if="kind === 'email'"
          label="Subject (optional)"
          ><Input
            v-model="subject"
            class="w-full"
        /></Field>
        <Accordion
          :items="[{ value: 'appearance', label: 'Customize appearance and export' }]"
          collapsible
          :ui="{
            root: 'overflow-visible',
            contentWrapper: 'data-[akaza-state=open]:overflow-visible',
            contentInner: 'overflow-visible',
            trigger: 'rounded-t-lg',
          }"
        >
          <template #content
            ><div class="grid gap-5 @[30rem]:grid-cols-2">
              <Field
                v-slot="{ controlProps }"
                label="Foreground"
                ><input
                  v-bind="controlProps"
                  v-model="foreground"
                  type="color"
                  class="h-9 w-full cursor-pointer p-1"
                  :class="inputVariants({ size: 'sm' }).root()"
              /></Field>
              <Field
                v-slot="{ controlProps }"
                label="Background"
                ><input
                  v-bind="controlProps"
                  v-model="background"
                  type="color"
                  class="h-9 w-full cursor-pointer p-1"
                  :class="inputVariants({ size: 'sm' }).root()"
              /></Field>
              <Field label="PNG size (px)"
                ><NumberField
                  v-model="size"
                  :min="128"
                  :max="2048"
                  :step="64"
                  :step-snapping="false"
                  class="w-full"
              /></Field>
              <Field label="Quiet zone (modules)"
                ><NumberField
                  v-model="margin"
                  :min="4"
                  :max="16"
                  class="w-full"
              /></Field>
              <Field
                label="Module style"
                class="@[30rem]:col-span-2"
                ><Select
                  v-model="shape"
                  class="w-full"
                  :options="[
                    { label: 'Square · maximum compatibility', value: 'square' },
                    { label: 'Soft rounded · square detection patterns', value: 'rounded' },
                  ]"
              /></Field>
              <Field
                label="Error correction"
                class="@[30rem]:col-span-2"
                ><Select
                  v-model="level"
                  class="w-full"
                  :options="
                    selectOptions([
                      { label: 'Low · 7% recovery', value: 'L' },
                      { label: 'Medium · 15% recovery', value: 'M' },
                      { label: 'Quartile · 25% recovery', value: 'Q' },
                      { label: 'High · 30% recovery', value: 'H' },
                    ])
                  "
              /></Field></div></template
        ></Accordion>
      </section>
      <section
        class="bg-muted/30 grid content-start gap-5 rounded-lg p-5 sm:p-6"
        aria-label="QR preview"
        :aria-busy="pending"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="font-semibold">Live preview</h2>
          <span
            class="text-muted-foreground text-xs"
            role="status"
            >{{ pending ? "Updating…" : error ? "Needs attention" : "Ready to download" }}</span
          >
        </div>
        <div class="grid min-h-72 place-items-center rounded-md bg-white p-5">
          <img
            v-if="image && !error"
            :src="image"
            alt="Generated QR code"
            class="aspect-square w-full max-w-80 object-contain"
            :class="pending ? 'opacity-50' : ''"
          />
          <div
            v-else
            class="grid justify-items-center gap-3 text-center text-sm text-neutral-600"
          >
            <Icon
              name="tabler:qrcode"
              class="size-12"
            />
            <p>
              {{ error ? "Fix the settings to see your code." : "Your code will appear here." }}
            </p>
          </div>
        </div>
        <StatusMessage
          v-if="error"
          tone="error"
          title="Check your QR settings"
          :description="error"
        />
        <StatusMessage
          v-else-if="contrast < 4.5 || inverted"
          tone="warning"
          title="Check scan readability"
          description="Use a dark foreground and a light background with good contrast. Test the downloaded code before sharing or printing."
        />
        <p class="text-muted-foreground text-sm">
          PNG: {{ size ?? "—" }} × {{ size ?? "—" }} px. SVG scales without losing sharpness. Keep
          the quiet zone when cropping or printing.
        </p>
        <ToolActions
          ><Button
            color="secondary"
            variant="outline"
            :disabled="!ready"
            @click="downloadSvg"
            >Download SVG</Button
          ><Button
            color="secondary"
            variant="outline"
            :disabled="!ready"
            @click="downloadDataUrl(image, 'qr-code.png')"
            ><Icon
              name="tabler:download"
              class="mr-1.5"
            />Download PNG</Button
          ></ToolActions
        >
        <p class="text-muted-foreground text-xs">
          Generated on this device. No tracking links, expiry, or signup. Scan-test before
          publishing; custom colors can reduce readability.
        </p>
      </section>
    </div>
  </ToolWorkspace>
</template>
