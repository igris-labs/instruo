import type { Ref } from "vue";

/** Progressive enhancement: server-rendered content stays visible without motion. */
export function useLandingMotion(root: Readonly<Ref<HTMLElement | null>>) {
  const reduced = usePreferredReducedMotion();
  const animations = new Set<Animation>();
  let observer: IntersectionObserver | undefined;
  function stop() {
    observer?.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  }
  onMounted(() => {
    if (!root.value || reduced.value === "reduce") return;
    const easing =
      getComputedStyle(root.value).getPropertyValue("--ease-out-expo").trim() ||
      "cubic-bezier(0.19, 1, 0.22, 1)";
    function animate(element: Element, frames: Keyframe[], delay = 0, duration = 600) {
      const animation = element.animate(frames, { duration, delay, easing, fill: "backwards" });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    }
    root.value.querySelectorAll("[data-line]").forEach((line, index) => {
      animate(
        line,
        [{ transform: "translateY(110%)" }, { transform: "translateY(0)" }],
        index * 90,
        720,
      );
    });
    observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            animate(
              entry.target,
              [
                { opacity: 0, transform: "translateY(14px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              Math.min(index, 3) * 55,
            );
            observer?.unobserve(entry.target);
          });
      },
      { threshold: 0.12 },
    );
    root.value.querySelectorAll("[data-reveal]").forEach((element) => observer?.observe(element));
  });
  watch(reduced, (value) => {
    if (value === "reduce") stop();
  });
  onBeforeUnmount(stop);
}
