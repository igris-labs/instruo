export function useImageConversion() {
  const file = shallowRef<File | null>(null);
  const source = ref("");
  const result = shallowRef<{ url: string; bytes: number; mime: string } | null>(null);
  const width = ref(0);
  const height = ref(0);
  const format = ref("image/webp");
  const error = ref("");
  const reading = ref(false);
  const converting = ref(false);
  let image: HTMLImageElement | null = null;
  let selection = 0;
  let operation = 0;
  let disposed = false;
  const urls = new Set<string>();
  function release(url?: string) {
    if (!url || !urls.delete(url)) return;
    URL.revokeObjectURL(url);
  }
  function clearResult() {
    operation++;
    converting.value = false;
    release(result.value?.url);
    result.value = null;
  }
  watch(format, () => {
    clearResult();
    error.value = "";
  });
  async function select(next: File | null) {
    const turn = ++selection;
    clearResult();
    release(source.value);
    source.value = "";
    file.value = null;
    image = null;
    width.value = 0;
    height.value = 0;
    error.value = "";
    reading.value = false;
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      error.value = "Choose an image file.";
      return;
    }
    if (next.size > 25 * 1024 * 1024) {
      error.value = "Choose an image smaller than 25 MB.";
      return;
    }
    reading.value = true;
    const url = URL.createObjectURL(next);
    urls.add(url);
    try {
      const decoded = new Image();
      await new Promise<void>((resolve, reject) => {
        decoded.onload = () => resolve();
        decoded.onerror = () =>
          reject(new Error("This image could not be decoded. Try another file."));
        decoded.src = url;
      });
      if (disposed || turn !== selection) {
        release(url);
        return;
      }
      if (
        !decoded.naturalWidth ||
        !decoded.naturalHeight ||
        decoded.naturalWidth * decoded.naturalHeight > 40_000_000
      )
        throw new Error("Choose an image with at most 40 megapixels.");
      image = decoded;
      file.value = next;
      source.value = url;
      width.value = decoded.naturalWidth;
      height.value = decoded.naturalHeight;
    } catch (cause) {
      release(url);
      if (!disposed && turn === selection)
        error.value = cause instanceof Error ? cause.message : "Image unavailable.";
    } finally {
      if (!disposed && turn === selection) reading.value = false;
    }
  }
  async function convert() {
    if (!image || converting.value) return;
    const turn = ++operation;
    const selectedImage = image;
    const mime = format.value;
    error.value = "";
    converting.value = true;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = selectedImage.naturalWidth;
      canvas.height = selectedImage.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable in this browser.");
      if (mime === "image/jpeg") {
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(selectedImage, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(new Error("Conversion failed. Try a different format.")),
          mime,
          0.9,
        ),
      );
      if (disposed || turn !== operation) return;
      if (blob.type !== mime) throw new Error("This browser cannot export that format. Try PNG.");
      release(result.value?.url);
      const url = URL.createObjectURL(blob);
      urls.add(url);
      result.value = { url, bytes: blob.size, mime: blob.type };
    } catch (cause) {
      if (!disposed && turn === operation)
        error.value = cause instanceof Error ? cause.message : "Conversion failed.";
    } finally {
      if (!disposed && turn === operation) converting.value = false;
    }
  }
  function download() {
    if (!result.value) return;
    const extension = result.value.mime === "image/jpeg" ? "jpg" : result.value.mime.split("/")[1];
    const name = file.value?.name.replace(/\.[^.]+$/, "") || "converted-image";
    const anchor = Object.assign(document.createElement("a"), {
      href: result.value.url,
      download: `${name}.${extension}`,
    });
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }
  onBeforeUnmount(() => {
    disposed = true;
    selection++;
    operation++;
    for (const url of urls) URL.revokeObjectURL(url);
    urls.clear();
  });
  return {
    file,
    source,
    result,
    width,
    height,
    format,
    error,
    reading,
    converting,
    select,
    convert,
    download,
  };
}
