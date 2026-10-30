import type { UnitCategory } from "../app/features/tools/everyday/unit-converter/useUnitConverter";
import { readFileSync } from "node:fs";
import QRCode from "qrcode";
import { describe, expect, it } from "vitest";
import { inspectColor } from "../app/features/tools/developer/color-converter/useColorConverter";
import { decodeQrPixels } from "../app/features/tools/everyday/qr-scanner/useQrScanner";
import { formatElapsed } from "../app/features/tools/everyday/stopwatch/useStopwatch";
import { splitBill } from "../app/features/tools/everyday/tip-splitter/useTipSplitter";
import {
  convertUnit,
  unitGroups,
} from "../app/features/tools/everyday/unit-converter/useUnitConverter";
import { assessPassword } from "../app/features/tools/security/password-strength/usePasswordStrength";
import { qrContent } from "../app/features/tools/security/qr-generator/useQrGenerator";

describe("product color conversion", () => {
  it.each([
    "#f97316",
    "rebeccapurple",
    "rgb(249 115 22)",
    "hsl(25 95% 53%)",
    "oklch(70% 0.15 160)",
    "lch(50% 30 100)",
    "color(display-p3 1 0.5 0.1)",
  ])("parses %s with eight copyable formats", (value) => {
    const result = inspectColor(value);
    expect(result?.formats).toHaveLength(8);
    for (const format of result!.formats) expect(inspectColor(format.value)).not.toBeNull();
  });
  it("preserves alpha and flags out-of-sRGB values", () => {
    expect(inspectColor("rgb(255 0 0 / 50%)")?.alpha).toBe(0.5);
    expect(inspectColor("rgb(255 0 0 / 50%)")?.formats[0]?.value).toBe("#ff000080");
    expect(inspectColor("oklch(70% 0.4 30)")?.inSrgb).toBe(false);
  });
  it.each(["", "not a color", "url(https://example.com)", "var(--unknown)"])(
    "rejects %s without a stale result",
    (value) => expect(inspectColor(value)).toBeNull(),
  );
});

describe("complete conversion and bill calculations", () => {
  it.each(Object.keys(unitGroups) as UnitCategory[])("round-trips %s measurements", (category) => {
    const [from, to] = Object.keys(unitGroups[category].units);
    const result = convertUnit(25, from!, to!, category)!;
    expect(convertUnit(result, to!, from!, category)).toBeCloseTo(25, 8);
  });
  it("distinguishes decimal/binary storage, US volume, and absolute zero", () => {
    expect(convertUnit(1, "kibibyte", "byte", "data")).toBe(1024);
    expect(convertUnit(1, "kilobyte", "byte", "data")).toBe(1000);
    expect(convertUnit(1, "US gallon", "liter", "volume")).toBe(3.785411784);
    expect(convertUnit(-274, "celsius", "kelvin", "temperature")).toBeNull();
    expect(convertUnit(Number.NaN, "meter", "foot", "length")).toBeNull();
    expect(convertUnit(-1, "meter", "foot", "length")).toBeNull();
  });
  it("allocates every cent and supports currencies without fractional units", () => {
    const bill = splitBill(100, 0, 3)!;
    expect(bill.share).toBe(33.33);
    expect(bill.extraShare).toBe(33.34);
    expect(bill.extraPeople).toBe(1);
    expect(bill.share * 2 + bill.extraShare).toBe(100);
    expect(splitBill(100, 15, 3, 0)?.total).toBe(115);
    expect(splitBill(0, 18, 2)?.total).toBe(0);
    expect(splitBill(80, 18, 2)?.share).toBe(47.2);
  });
  it.each([
    [100, 15, 0],
    [100, 15, 1.5],
    [-1, 15, 2],
    [Infinity, 15, 2],
    [1e18, 15, 2],
  ])("rejects invalid bill input %j", (bill, tip, people) =>
    expect(splitBill(bill, tip, people)).toBeNull(),
  );
});

describe("qR payloads and real decoding", () => {
  it("escapes Wi-Fi delimiters and encodes email subjects", () => {
    expect(qrContent("wifi", "My;Network", "p:ass", "WPA")).toBe(
      "WIFI:T:WPA;S:My\\;Network;P:p\\:ass;;",
    );
    expect(qrContent("wifi", "Guest Wi-Fi", "ignored", "nopass")).toBe(
      "WIFI:T:nopass;S:Guest Wi-Fi;P:;;",
    );
    expect(qrContent("email", "test@example.com", "", "WPA", "Hello & goodbye")).toBe(
      "mailto:test@example.com?subject=Hello%20%26%20goodbye",
    );
    expect(() => qrContent("url", "javascript:alert(1)")).toThrow();
    expect(() => qrContent("email", "not-an-email")).toThrow();
    expect(() => qrContent("text", "")).toThrow();
  });
  it("decodes Unicode QR pixels without BarcodeDetector", async () => {
    const content = "Instruo — नमस्ते 🌍";
    const matrix = QRCode.create(content, { errorCorrectionLevel: "M" }).modules;
    const scale = 6;
    const margin = 4;
    const size = (matrix.size + margin * 2) * scale;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const mx = Math.floor(x / scale) - margin;
        const my = Math.floor(y / scale) - margin;
        const dark =
          mx >= 0 && my >= 0 && mx < matrix.size && my < matrix.size && matrix.get(my, mx);
        if (dark) pixels.fill(0, (y * size + x) * 4, (y * size + x) * 4 + 3);
      }
    expect(await decodeQrPixels(pixels, size, size)).toBe(content);
    expect(
      await decodeQrPixels(new Uint8ClampedArray(100 * 100 * 4).fill(255), 100, 100),
    ).toBeNull();
  });
});

describe("password feedback and stopwatch formatting", () => {
  it("does not call a short, common or repeated password strong", () => {
    expect(assessPassword("Password123!").score).toBe(1);
    expect(assessPassword("Abc!234?").score).toBeLessThan(4);
    expect(assessPassword("xxxxxxxxxxxxxxxxxxxxxxxx").score).toBe(1);
    expect(assessPassword("river meadow lantern orbit").score).toBe(5);
    expect(assessPassword("").score).toBe(0);
    expect(assessPassword("Password123!").bar).toBe("bg-destructive");
    expect(assessPassword("river meadow lantern orbit").bar).toBe("bg-success");
  });
  it("formats centiseconds without losing elapsed hours", () => {
    expect(formatElapsed(0)).toBe("00:00.00");
    expect(formatElapsed(61234)).toBe("01:01.23");
    expect(formatElapsed(3600000)).toBe("60:00.00");
  });
  it("keeps required Nuxt modules registered and installed", () => {
    const config = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");
    const dependencies = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ).dependencies;
    for (const name of ["nuxt-gtag", "@nuxt/image"]) {
      expect(config).toContain(`"${name}"`);
      expect(dependencies[name]).toBeTruthy();
    }
  });
});
