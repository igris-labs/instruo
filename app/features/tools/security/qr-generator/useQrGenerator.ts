import QRCode from "qrcode";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { relativeLuminance } from "../../../../utils/browser-tools";

export type QrKind = "text" | "url" | "wifi" | "email";
export function roundedQrSvg(
  matrix: QRCode.QRCode["modules"],
  size: number,
  margin: number,
  foreground: string,
  background: string,
) {
  const extent = matrix.size + margin * 2;
  const modules: string[] = [];
  for (let row = 0; row < matrix.size; row++)
    for (let column = 0; column < matrix.size; column++) {
      if (matrix.get(row, column))
        modules.push(
          `<rect x="${column + margin}" y="${row + margin}" width="1" height="1" rx="${matrix.isReserved(row, column) ? 0 : 0.18}"${matrix.isReserved(row, column) ? ' shape-rendering="crispEdges"' : ""}/>`,
        );
    }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${extent} ${extent}"><rect width="${extent}" height="${extent}" fill="${background}"/><g fill="${foreground}">${modules.join("")}</g></svg>`;
}
async function rasterizeQr(svg: string, size: number) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not render this QR code.");
    context.drawImage(image, 0, 0, size, size);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
export function qrContent(
  kind: QrKind,
  value: string,
  password = "",
  security = "WPA",
  subject = "",
) {
  const clean = value.trim();
  if (!clean)
    throw new Error(kind === "wifi" ? "Enter a network name." : "Enter content for your QR code.");
  if (kind === "url") {
    let url: URL;
    try {
      url = new URL(clean);
    } catch {
      throw new Error("Enter a complete URL, starting with https:// or http://.");
    }
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Use an http or https URL.");
  }
  if (kind === "wifi") {
    const escape = (text: string) => text.replace(/([\\;,:"])/g, "\\$1");
    return `WIFI:T:${security};S:${escape(clean)};P:${security === "nopass" ? "" : escape(password)};;`;
  }
  if (kind === "email") {
    if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(clean))
      throw new Error("Enter a valid email address.");
    return `mailto:${clean}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  }
  return clean;
}
export function useQrGenerator() {
  const kind = ref<QrKind>("url");
  const contentByKind = reactive({ url: "https://instruo.org", text: "", wifi: "", email: "" });
  const value = computed({
    get: () => contentByKind[kind.value],
    set: (value: string) => {
      contentByKind[kind.value] = value;
    },
  });
  const password = ref("");
  const security = ref("WPA");
  const subject = ref("");
  const size = ref<number | null>(512);
  const margin = ref<number | null>(4);
  const level = ref<QRCode.QRCodeErrorCorrectionLevel>("M");
  const shape = ref("square");
  const foreground = ref("#111111");
  const background = ref("#ffffff");
  const image = ref("");
  const svg = ref("");
  const error = ref("");
  const pending = ref(false);
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let mounted = false;
  const contrast = computed(() => {
    if (![foreground.value, background.value].every((color) => /^#[\da-f]{6}$/i.test(color)))
      return 0;
    const a = relativeLuminance(foreground.value);
    const b = relativeLuminance(background.value);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
  const inverted = computed(
    () =>
      contrast.value > 0 &&
      relativeLuminance(foreground.value) >= relativeLuminance(background.value),
  );
  async function generate(turn: number) {
    try {
      const content = qrContent(
        kind.value,
        value.value,
        password.value,
        security.value,
        subject.value,
      );
      if (new TextEncoder().encode(content).length > 4096)
        throw new Error("Content is too long. Shorten the text to fit in a QR code.");
      if (!contrast.value) throw new Error("Choose valid six-digit HEX colors.");
      if (!size.value || size.value < 128 || size.value > 2048 || !Number.isInteger(size.value))
        throw new Error("Choose a whole-number size from 128 to 2048px.");
      if (
        margin.value === null ||
        margin.value < 4 ||
        margin.value > 16 ||
        !Number.isInteger(margin.value)
      )
        throw new Error("Keep a quiet zone of 4 to 16 modules.");
      const options = {
        width: size.value,
        margin: margin.value,
        errorCorrectionLevel: level.value,
        color: { dark: foreground.value, light: background.value },
      };
      const matrix = QRCode.create(content, { errorCorrectionLevel: level.value }).modules;
      if (matrix.size + margin.value * 2 > size.value)
        throw new Error("Increase the PNG size or shorten the content to keep every module sharp.");
      const vector =
        shape.value === "rounded"
          ? roundedQrSvg(matrix, size.value, margin.value, foreground.value, background.value)
          : await QRCode.toString(content, { ...options, type: "svg" });
      const png =
        shape.value === "rounded"
          ? await rasterizeQr(vector, size.value)
          : await QRCode.toDataURL(content, options);
      if (turn !== generation) return;
      image.value = png;
      svg.value = vector;
    } catch (cause) {
      if (turn !== generation) return;
      image.value = svg.value = "";
      error.value =
        cause instanceof Error
          ? cause.message
          : "Could not generate this QR code. Try shorter content.";
    } finally {
      if (turn === generation) pending.value = false;
    }
  }
  function schedule() {
    const turn = ++generation;
    clearTimeout(timer);
    error.value = "";
    pending.value = true;
    if (mounted)
      timer = setTimeout(() => {
        void generate(turn);
      }, 180);
  }
  watch(
    [kind, value, password, security, subject, size, margin, level, shape, foreground, background],
    schedule,
    { flush: "sync" },
  );
  onMounted(() => {
    mounted = true;
    schedule();
  });
  onBeforeUnmount(() => {
    ++generation;
    clearTimeout(timer);
  });
  const ready = computed(() => !!image.value && !pending.value && !error.value);
  return {
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
  };
}
