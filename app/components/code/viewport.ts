export function codeViewport(
  scrollTop: number,
  height: number,
  count: number,
  lineHeight = 24,
  overscan = 8,
) {
  const start = Math.max(
    0,
    Math.min(count - 1, Math.floor(Math.max(0, scrollTop - 12) / lineHeight) - overscan),
  );
  const end = Math.min(count, Math.ceil((scrollTop + height) / lineHeight) + overscan);
  return { start, end: Math.max(start, end) };
}
