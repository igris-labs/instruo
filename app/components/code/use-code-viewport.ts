import type { Ref } from "vue";
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import { codeViewport } from "./viewport";

export function useCodeViewport(
  element: Readonly<Ref<HTMLTextAreaElement | null>>,
  count: () => number,
) {
  const scroll = shallowRef({ x: 0, y: 0, height: 336, lineHeight: 24 });
  let observer: ResizeObserver | undefined;
  function sync() {
    if (!element.value) return;
    scroll.value = {
      ...scroll.value,
      x: element.value.scrollLeft,
      y: element.value.scrollTop,
      height: element.value.clientHeight,
    };
  }
  onMounted(() => {
    if (!element.value) return;
    scroll.value = {
      ...scroll.value,
      lineHeight: Number.parseFloat(getComputedStyle(element.value).lineHeight) || 24,
    };
    observer = new ResizeObserver(sync);
    observer.observe(element.value);
    sync();
  });
  watch(count, async () => {
    await nextTick();
    sync();
  });
  onBeforeUnmount(() => observer?.disconnect());
  const range = computed(() =>
    codeViewport(scroll.value.y, scroll.value.height, count(), scroll.value.lineHeight),
  );
  const offset = computed(() => range.value.start * scroll.value.lineHeight - scroll.value.y);
  return { scroll, range, offset, sync };
}
