import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";

export async function decodeQrPixels(data: Uint8ClampedArray, width: number, height: number) {
  const { default: jsQR } = await import("jsqr");
  return jsQR(data, width, height, { inversionAttempts: "attemptBoth" })?.data ?? null;
}
export function useQrScanner() {
  const result = ref("");
  const error = ref("");
  const scanning = ref(false);
  const preview = ref("");
  const cameraOn = ref(false);
  const selectedFile = shallowRef<File | null>(null);
  let generation = 0;
  let stream: MediaStream | undefined;
  let activeVideo: HTMLVideoElement | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let previewUrl = "";
  function stopCamera() {
    ++generation;
    stream?.getTracks().forEach((track) => track.stop());
    stream = undefined;
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.srcObject = null;
      activeVideo = undefined;
    }
    clearTimeout(timer);
    cameraOn.value = false;
    scanning.value = false;
  }
  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = preview.value = "";
  }
  async function decode(source: CanvasImageSource, width: number, height: number) {
    const scale = Math.min(1, 1800 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Your browser could not read this image.");
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    return decodeQrPixels(
      context.getImageData(0, 0, canvas.width, canvas.height).data,
      canvas.width,
      canvas.height,
    );
  }
  async function scan(file: File | null | undefined) {
    stopCamera();
    const turn = generation;
    clearPreview();
    selectedFile.value = file ?? null;
    result.value = error.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      error.value = "Choose an image smaller than 10 MB.";
      return;
    }
    scanning.value = true;
    const source = new Image();
    try {
      previewUrl = URL.createObjectURL(file);
      source.src = previewUrl;
      await source.decode();
      if (turn !== generation) return;
      if (source.naturalWidth * source.naturalHeight > 32_000_000)
        throw new Error("Choose an image below 32 megapixels.");
      preview.value = previewUrl;
      const decoded = await decode(source, source.naturalWidth, source.naturalHeight);
      if (turn !== generation) return;
      if (decoded === null)
        throw new Error(
          "No QR code found. Try a sharper image with the whole code and its white border visible.",
        );
      result.value = decoded;
    } catch (cause) {
      if (turn === generation)
        error.value = cause instanceof Error ? cause.message : "Could not read this image.";
    } finally {
      source.src = "";
      if (turn === generation) scanning.value = false;
    }
  }
  async function startCamera(video: HTMLVideoElement | null) {
    stopCamera();
    clearPreview();
    selectedFile.value = null;
    const turn = generation;
    error.value = result.value = "";
    if (!video || !navigator.mediaDevices?.getUserMedia) {
      error.value =
        "Camera scanning needs HTTPS and a browser with camera support. You can still upload an image.";
      return;
    }
    scanning.value = true;
    try {
      const acquired = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (turn !== generation) {
        acquired.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = acquired;
      activeVideo = video;
      cameraOn.value = true;
      video.srcObject = stream;
      await video.play();
      async function frame() {
        if (turn !== generation) return;
        try {
          if (video!.readyState >= 2) {
            const decoded = await decode(video!, video!.videoWidth, video!.videoHeight);
            if (turn !== generation) return;
            if (decoded !== null) {
              result.value = decoded;
              stopCamera();
              return;
            }
          }
          timer = setTimeout(() => {
            void frame();
          }, 400);
        } catch {
          if (turn === generation) {
            stopCamera();
            error.value = "Camera frame could not be read. Try uploading an image.";
          }
        }
      }
      void frame();
    } catch {
      if (turn === generation) {
        stopCamera();
        error.value = "Camera could not start. Check permission or upload an image instead.";
      }
    }
  }
  const safeUrl = computed(() => {
    try {
      const url = new URL(result.value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  });
  function onVisibilityChange() {
    if (document.hidden) stopCamera();
  }
  onMounted(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
    stopCamera();
    clearPreview();
  });
  return {
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
  };
}
