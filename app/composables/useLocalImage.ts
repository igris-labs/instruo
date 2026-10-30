export function useLocalImage() {
  const maxBytes = 25 * 1024 * 1024;
  const maxPixels = 40_000_000;
  const file = shallowRef<File | null>(null);
  const error = ref("");
  const sourceUrl = ref("");
  const outputUrl = ref("");
  const width = ref(0);
  const height = ref(0);
  let selection = 0;
  let conversion = 0;

  function release(url: string) {
    if (url) URL.revokeObjectURL(url);
  }
  function invalidate() {
    conversion++;
    release(outputUrl.value);
    outputUrl.value = "";
  }
  function load(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image could not be decoded."));
      image.src = url;
    });
  }
  async function select(input: Event | File | null | undefined) {
    const ticket = ++selection;
    conversion++;
    const next = input instanceof File ? input : (input?.target as HTMLInputElement)?.files?.[0];
    release(sourceUrl.value);
    release(outputUrl.value);
    file.value = null;
    sourceUrl.value = "";
    outputUrl.value = "";
    width.value = 0;
    height.value = 0;
    error.value = "";
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      error.value = "Choose an image file.";
      return;
    }
    if (next.size > maxBytes) {
      error.value = "That image is larger than 25 MB. Choose a smaller file.";
      return;
    }
    release(sourceUrl.value);
    release(outputUrl.value);
    file.value = next;
    sourceUrl.value = URL.createObjectURL(next);
    outputUrl.value = "";
    try {
      const image = await load(sourceUrl.value);
      if (ticket !== selection) return;
      if (image.naturalWidth * image.naturalHeight > maxPixels) {
        release(sourceUrl.value);
        sourceUrl.value = "";
        file.value = null;
        error.value = "That image has more than 40 megapixels. Choose a smaller image.";
        return;
      }
      width.value = image.naturalWidth;
      height.value = image.naturalHeight;
    } catch (cause) {
      if (ticket !== selection) return;
      release(sourceUrl.value);
      sourceUrl.value = "";
      file.value = null;
      error.value = cause instanceof Error ? cause.message : "Image could not be decoded.";
    }
  }
  async function render(options: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    crop?: boolean;
    mime?: string;
    quality?: number;
  }) {
    if (!sourceUrl.value) return;
    const ticket = ++conversion;
    const selected = selection;
    const source = sourceUrl.value;
    error.value = "";
    release(outputUrl.value);
    outputUrl.value = "";
    try {
      const image = await load(source);
      if (ticket !== conversion || selected !== selection) return;
      const canvas = document.createElement("canvas");
      if (
        ![
          options.width ?? image.naturalWidth,
          options.height ?? image.naturalHeight,
          options.x ?? 0,
          options.y ?? 0,
        ].every(Number.isFinite)
      )
        throw new Error("Enter valid dimensions and coordinates.");
      if (
        options.crop &&
        ((options.x ?? 0) < 0 ||
          (options.y ?? 0) < 0 ||
          (options.x ?? 0) + (options.width ?? image.naturalWidth) > image.naturalWidth ||
          (options.y ?? 0) + (options.height ?? image.naturalHeight) > image.naturalHeight)
      )
        throw new Error("The crop must fit inside the source image.");
      canvas.width = options.width ?? image.naturalWidth;
      canvas.height = options.height ?? image.naturalHeight;
      if (canvas.width < 1 || canvas.height < 1 || canvas.width * canvas.height > maxPixels) {
        error.value = "Choose output dimensions between 1 pixel and 40 megapixels.";
        return;
      }
      const context = canvas.getContext("2d");
      if (!context) return;
      if (options.mime === "image/jpeg") {
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (options.crop) {
        context.drawImage(
          image,
          options.x ?? 0,
          options.y ?? 0,
          options.width ?? image.naturalWidth,
          options.height ?? image.naturalHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      } else {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, options.mime ?? "image/png", options.quality),
      );
      if (ticket !== conversion || selected !== selection) return;
      if (!blob) {
        error.value = "Your browser could not encode this image.";
        return;
      }
      if (blob.type !== (options.mime ?? "image/png"))
        throw new Error("This browser cannot encode the selected format. Choose PNG or JPEG.");
      release(outputUrl.value);
      outputUrl.value = URL.createObjectURL(blob);
      return blob;
    } catch (cause) {
      if (ticket === conversion && selected === selection)
        error.value = cause instanceof Error ? cause.message : "Image conversion failed.";
    }
  }
  function download(filename: string) {
    if (!outputUrl.value) return;
    const link = document.createElement("a");
    link.href = outputUrl.value;
    link.download = filename;
    link.click();
  }
  onBeforeUnmount(() => {
    selection++;
    conversion++;
    release(sourceUrl.value);
    release(outputUrl.value);
  });
  return { file, sourceUrl, outputUrl, width, height, error, select, render, download, invalidate };
}
