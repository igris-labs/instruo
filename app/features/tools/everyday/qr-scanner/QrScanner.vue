<script setup lang="ts">
import FilePicker from "~/components/adapters/FilePicker.vue";
import StatusMessage from "~/components/adapters/StatusMessage.vue";
import Textarea from "~/components/adapters/Textarea.vue";
import ToolActions from "~/components/product/ToolActions.vue";
import ToolWorkspace from "~/components/product/ToolWorkspace.vue";
import { Button, buttonVariants } from "~/components/ui/button";
import { useQrScanner } from "./useQrScanner";
const {
  result,
  error,
  scanning,
  preview,
  cameraOn,
  selectedFile,
  scan,
  startCamera,
  stopCamera,
  safeUrl,
} = useQrScanner();
const video = useTemplateRef<HTMLVideoElement>("video");
const { copyText } = useCopyToClipboard();
const linkStyles = buttonVariants({ color: "secondary", variant: "outline", size: "sm" });
</script>
<template>
  <ToolWorkspace>
    <div class="grid items-start gap-6 @[48rem]:grid-cols-2">
      <section
        class="border-border grid gap-5 rounded-lg border p-5 sm:p-6"
        aria-label="QR image or camera"
      >
        <h2 class="font-semibold">Scan a code</h2>
        <FilePicker
          :model-value="selectedFile"
          accept="image/*"
          label="Choose a QR image"
          description="Drop a screenshot or image here. Up to 10 MB and 32 megapixels. Nothing is uploaded."
          @update:model-value="scan"
        />
        <div class="flex items-center gap-3">
          <span class="border-border grow border-t" /><span class="text-muted-foreground text-xs"
            >or use your camera</span
          ><span class="border-border grow border-t" />
        </div>
        <Button
          v-if="!cameraOn"
          color="secondary"
          variant="outline"
          :disabled="scanning"
          @click="startCamera(video)"
          ><Icon
            name="tabler:camera"
            class="mr-1.5"
          />Start camera</Button
        >
        <Button
          v-else
          color="secondary"
          variant="outline"
          @click="stopCamera"
          >Stop camera</Button
        >
        <video
          v-show="cameraOn"
          ref="video"
          muted
          playsinline
          class="aspect-video w-full rounded-md bg-black object-cover"
          aria-label="Camera preview"
        />
        <figure
          v-if="preview && !cameraOn"
          class="bg-muted/30 grid min-h-44 place-items-center rounded-md p-4"
        >
          <img
            :src="preview"
            alt="Selected image for QR scanning"
            class="max-h-64 max-w-full object-contain"
          />
        </figure>
        <p class="text-muted-foreground text-xs">
          Camera access starts only when requested. The camera stops after a successful scan or when
          you leave.
        </p>
      </section>
      <section
        class="bg-muted/30 grid min-h-80 content-start gap-5 rounded-lg p-5 sm:p-6"
        aria-label="Decoded QR content"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="font-semibold">Decoded content</h2>
          <span
            class="text-sm"
            :class="result ? 'text-success' : 'text-muted-foreground'"
            role="status"
            >{{
              scanning
                ? cameraOn
                  ? "Point camera at a QR code"
                  : "Reading image…"
                : result
                  ? "Code found"
                  : "Waiting for a code"
            }}</span
          >
        </div>
        <StatusMessage
          v-if="error"
          tone="error"
          title="Could not read a code"
          :description="error"
        />
        <Textarea
          v-if="result"
          :model-value="result"
          :rows="7"
          readonly
          class="w-full"
          aria-label="QR result"
        />
        <div
          v-else-if="!error"
          class="text-muted-foreground grid min-h-40 content-center justify-items-center gap-3 text-center text-sm"
        >
          <Icon
            name="tabler:scan"
            class="size-10"
          />
          <p>Upload an image or start the camera.<br />The decoded text will appear here.</p>
        </div>
        <p
          v-if="result"
          class="text-muted-foreground text-xs"
        >
          {{
            safeUrl
              ? "This code contains a web link. Check its destination before opening it."
              : "Decoded text is shown as-is. Links and commands never run automatically."
          }}
        </p>
        <ToolActions v-if="result"
          ><a
            v-if="safeUrl"
            :href="safeUrl"
            target="_blank"
            rel="noopener noreferrer"
            :class="linkStyles.root()"
            ><span :class="linkStyles.content()"
              >Open link<Icon
                name="tabler:external-link"
                class="ml-1.5" /></span></a
          ><Button
            color="secondary"
            variant="outline"
            @click="copyText(result)"
            ><Icon
              name="tabler:copy"
              class="mr-1.5"
            />Copy content</Button
          ></ToolActions
        >
      </section>
    </div>
  </ToolWorkspace>
</template>
