<script setup lang="ts">
import type { PhaserGameFactory, PhaserGameHandle } from "../../core/phaser/types";
const props = defineProps<{ create: PhaserGameFactory; label: string }>();
const emit = defineEmits<{
  state: [state: Record<string, unknown>];
  ready: [];
  error: [cause: unknown];
}>();
const mount = useTemplateRef<HTMLElement>("mount");
const search = useState("instruo-search", () => false);
const isFullscreen = ref(false);
const isMuted = ref(false);
let game: PhaserGameHandle | undefined;
let disposed = false;
let events: AbortController | undefined;
interface Keyboard {
  enabled: boolean;
  preventDefault?: boolean;
}
function keyboard(enabled: boolean) {
  const runtime = game as
    | (PhaserGameHandle & {
        input?: { keyboard?: Keyboard };
        scene?: { getScenes: (active: boolean) => Array<{ input?: { keyboard?: Keyboard } }> };
      })
    | undefined;
  const active = enabled && !search.value;
  if (runtime?.input?.keyboard) {
    runtime.input.keyboard.enabled = active;
    runtime.input.keyboard.preventDefault = active;
  }
  for (const scene of runtime?.scene?.getScenes(true) ?? [])
    if (scene.input?.keyboard) scene.input.keyboard.enabled = active;
}
function owns(target: EventTarget | null) {
  if (!(target instanceof HTMLElement) || !mount.value?.contains(target)) return false;
  return !target.closest(
    "input,textarea,select,button,a,[contenteditable],[role=dialog],[role=menu],[role=listbox]",
  );
}
watch(search, (value) => {
  if (value) keyboard(false);
});
function start(option?: unknown) {
  game?.startGame?.(option);
  mount.value?.focus();
  keyboard(true);
}
function restart(option?: unknown) {
  game?.restartGame?.(option);
  mount.value?.focus();
  keyboard(true);
}
function toggleMute() {
  const value = game?.toggleMute?.();
  isMuted.value = typeof value === "boolean" ? value : !isMuted.value;
  return isMuted.value;
}
function fullscreenSurface() {
  return mount.value?.closest<HTMLElement>("[data-phaser-game-shell]") ?? mount.value;
}
async function toggleFullscreen() {
  const surface = fullscreenSurface();
  if (!surface) return;
  try {
    if (document.fullscreenElement === surface) await document.exitFullscreen();
    else await surface.requestFullscreen();
  } catch {
    /* Browsers may deny fullscreen; inline play remains available. */
  }
}
defineExpose({ start, restart, toggleMute, toggleFullscreen, isFullscreen, isMuted });
onMounted(async () => {
  if (!mount.value) return;
  events = new AbortController();
  const options = { capture: true, signal: events.signal };
  document.addEventListener(
    "fullscreenchange",
    () => {
      isFullscreen.value = document.fullscreenElement === fullscreenSurface();
    },
    { signal: events.signal },
  );
  document.addEventListener("focusin", (event) => keyboard(owns(event.target)), options);
  document.addEventListener(
    "pointerdown",
    (event) => {
      const active = owns(event.target);
      if (active) mount.value?.focus();
      keyboard(active);
    },
    options,
  );
  window.addEventListener("blur", () => keyboard(false), { signal: events.signal });
  try {
    await document.fonts.ready;
    if (disposed || !mount.value) return;
    game = await props.create(
      mount.value,
      (state) => {
        if (!disposed) emit("state", state);
      },
      () => {
        if (!disposed) emit("ready");
      },
      (cause) => {
        if (!disposed) emit("error", cause);
      },
    );
    if (disposed) game.destroy(true);
    else keyboard(false);
  } catch (cause) {
    if (!disposed) emit("error", cause);
  }
});
onBeforeUnmount(() => {
  disposed = true;
  events?.abort();
  keyboard(false);
  game?.destroy(true);
});
</script>
<template>
  <div
    ref="mount"
    :aria-label="label"
    role="application"
    tabindex="0"
    class="focus-visible:outline-ring h-full w-full outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 [&_canvas]:block [&_canvas]:max-h-full [&_canvas]:max-w-full"
  />
</template>
