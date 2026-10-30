export function segmentWords(text: string) {
  if (text.length > 200_000) throw new Error("Use text shorter than 200,000 characters.");
  return Array.from(new Intl.Segmenter(undefined, { granularity: "word" }).segment(text))
    .filter((item) => item.isWordLike)
    .map((item) => item.segment);
}
export function analyzeText(text: string, wordsPerMinute = 200) {
  const words = segmentWords(text);
  const characters = Array.from(
    new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
    (item) => item.segment,
  );
  const sentences = Array.from(
    new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(text),
  ).filter((item) => /[\p{L}\p{N}]/u.test(item.segment)).length;
  return {
    words: words.length,
    characters: characters.length,
    withoutSpaces: characters.filter((item) => !/\s/u.test(item)).length,
    lines: text ? text.split(/\r?\n/).length : 0,
    sentences,
    paragraphs: text.trim() ? text.trim().split(/\n\s*\n/).length : 0,
    bytes: new TextEncoder().encode(text).length,
    readingSeconds: Math.ceil(
      (words.length * 60) / Math.max(40, Math.min(1000, wordsPerMinute || 200)),
    ),
  };
}
