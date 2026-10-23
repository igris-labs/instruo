import { useToast } from "akaza-ui";

export function useCopyToClipboard() {
  const toast = useToast();
  const { copy, isSupported } = useClipboard({ legacy: true });

  async function copyText(text: string) {
    if (!text) return;

    try {
      await copy(text);
      toast.add({
        title: "Copied",
        description: "Output copied to your clipboard.",
        type: "success",
      });
    } catch {
      toast.add({
        title: "Copy failed",
        description: "Select the output and copy it manually.",
        type: "error",
      });
    }
  }

  return { copyText, isSupported };
}
