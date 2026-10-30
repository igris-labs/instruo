import type { TransformOptions } from "../app/features/tools/text/text-transformer/useTextTransformer";
import { describe, expect, it } from "vitest";
import { queryJson } from "../app/features/tools/developer/jsonpath-tester/query";
import { transformEncoding } from "../app/features/tools/encoder-decoder/encoder-decoder/useEncoderDecoder";
import { transformText } from "../app/features/tools/text/text-transformer/useTextTransformer";
const options: TransformOptions = {
  operation: "",
  insensitive: false,
  trim: false,
  descending: false,
  keepEmpty: false,
  unicode: false,
};
describe("text transformations preserve meaningful content", () => {
  it("reverses graphemes, not broken emoji or combining accents", () => {
    expect(transformText("Hi 👨‍👩‍👧‍👦 é", "reverse", options).output).toBe("é 👨‍👩‍👧‍👦 iH");
    expect(transformText("one\ntwo", "reverse", { ...options, operation: "lines" }).output).toBe(
      "two\none",
    );
  });
  it("sorts numeric lines without silently discarding other lines", () => {
    expect(
      transformText("pear\n20\n3\napple", "sort", { ...options, operation: "numerical" }).output,
    ).toBe("3\n20\npear\napple");
    expect(
      transformText("pear\n20\n3\napple", "sort", {
        ...options,
        operation: "numerical",
        descending: true,
      }).output,
    ).toBe("20\n3\npear\napple");
  });
  it("deduplicates with opt-in comparison rules while preserving original spelling", () => {
    expect(
      transformText(" Name \nname\nNext", "dedupe", { ...options, trim: true, insensitive: true })
        .output,
    ).toBe(" Name \nNext");
    expect(transformText(" Name \nname", "dedupe", options).output).toBe(" Name \nname");
  });
  it("provides code cases and explicit Unicode slugs", () => {
    expect(transformText("hello World", "case", { ...options, operation: "camel" }).output).toBe(
      "helloWorld",
    );
    expect(transformText("Café & Tea", "slug", options).output).toBe("cafe-tea");
    expect(transformText("日本語 café", "slug", { ...options, unicode: true }).output).toBe(
      "日本語-cafe",
    );
    expect(
      transformText(" one  \n  two ", "whitespace", { ...options, operation: "trim-lines" }).output,
    ).toBe("one\ntwo");
  });
});
describe("uTF-8 encoders and honest failures", () => {
  it.each(["base64", "binary", "url"] as const)(
    "round-trips Unicode and whitespace through %s",
    (kind) => {
      for (const text of ["Hello 🌍", "  ", "a\n b"]) {
        expect(transformEncoding(transformEncoding(text, kind, "encode"), kind, "decode")).toBe(
          text,
        );
      }
    },
  );
  it("supports unpadded Base64URL and URI vs component semantics", () => {
    const encoded = transformEncoding("Hello 🌍", "base64", "encode", "url");
    expect(encoded).not.toMatch(/[+/=]/);
    expect(transformEncoding(encoded, "base64", "decode", "url")).toBe("Hello 🌍");
    expect(transformEncoding("https://example.com/a?q=b&x=1", "url", "encode", "uri")).toBe(
      "https://example.com/a?q=b&x=1",
    );
    expect(transformEncoding("a&b", "url", "encode")).toBe("a%26b");
  });
  it("never silently drops unsupported Morse characters or replaces corrupt bytes", () => {
    expect(transformEncoding(transformEncoding("SOS!", "morse", "encode"), "morse", "decode")).toBe(
      "SOS!",
    );
    expect(() => transformEncoding("Hello 🌍", "morse", "encode")).toThrow("does not support");
    expect(() => transformEncoding("/w==", "base64", "decode")).toThrow("UTF-8");
    expect(() => transformEncoding("11111111", "binary", "decode")).toThrow("UTF-8");
    expect(() => transformEncoding("a!", "base64", "decode")).toThrow("alphabet");
  });
});
describe("parsed JSONPath with no JavaScript execution", () => {
  const source =
    '{"users":[{"name":"Ada","active":true},{"name":"Linus","active":false}],"nested":{"name":"Grace"}}';
  it("supports recursive descent, filters, slices and normalized paths", () => {
    expect(JSON.parse(queryJson(source, "$..name").output)).toEqual(["Ada", "Linus", "Grace"]);
    expect(JSON.parse(queryJson(source, "$.users[?@.active == true].name").output)).toEqual([
      "Ada",
    ]);
    expect(JSON.parse(queryJson(source, "$.users[0:1].name", true).output)).toEqual([
      { value: "Ada", path: "$['users'][0]['name']" },
    ]);
    expect(JSON.parse(queryJson(source, "$.missing").output)).toEqual([]);
  });
  it("rejects script expressions and invalid input", () => {
    expect(() => queryJson(source, "$[(globalThis.x=1)]")).toThrow();
    expect(() => queryJson("{broken", "$..name")).toThrow();
  });
});
