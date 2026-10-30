import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { formatEnv } from "../app/features/tools/developer/env-formatter/formatEnv";
import {
  formatDockerfile,
  formatNginx,
} from "../app/features/tools/developer/formatting/configFormats";
import { compareText } from "../app/features/tools/developer/text-diff/compareText";
import { calculateAge } from "../app/features/tools/everyday/age-calculator/calculateAge";
import { calculateBusinessDays } from "../app/features/tools/everyday/business-days/calculateBusinessDays";
import { calculateCompound } from "../app/features/tools/everyday/compound-interest/calculateCompound";
import { dateInZone } from "../app/features/tools/everyday/dateMath";
import { calculateLoan } from "../app/features/tools/everyday/loan-calculator/calculateLoan";
import { calculatePercentage } from "../app/features/tools/everyday/percentage-calculator/calculatePercentage";
import { secureToken } from "../app/features/tools/security/secure-random/random";
import {
  fingerprint,
  parsePublicKey,
} from "../app/features/tools/security/ssh-fingerprint/fingerprint";
import { decodeBase32, totp } from "../app/features/tools/security/totp-generator/totp";

describe("calendar and financial engines", () => {
  it("counts calendar age including leap-day birthdays and short months", () => {
    expect(calculateAge("2000-02-29", "2025-02-28")).toMatchObject({
      years: 25,
      months: 0,
      days: 0,
      next: "2025-02-28",
    });
    expect(calculateAge("2025-01-31", "2025-03-01")).toMatchObject({
      years: 0,
      months: 1,
      days: 1,
    });
    expect(() => calculateAge("2030-01-01", "2025-01-01")).toThrow();
    expect(() => calculateAge("2025-02-30", "2025-03-01")).toThrow();
  });
  it("rejects ambiguous or skipped DST times rather than silently moving them", () => {
    expect(() => dateInZone("2025-03-09T02:30", "America/New_York")).toThrow();
    expect(() => dateInZone("2025-11-02T01:30", "America/New_York")).toThrow();
    expect(dateInZone("2025-03-09T03:30", "America/New_York").toISOString()).toBe(
      "2025-03-09T07:30:00.000Z",
    );
  });
  it("counts business days once per unique weekday holiday", () => {
    expect(
      calculateBusinessDays("2025-03-03", "2025-03-09", "2025-03-03,2025-03-03,2025-03-08", [0, 6]),
    ).toEqual({ calendar: 7, weekend: 2, skippedHolidays: 1, working: 4 });
    expect(calculateBusinessDays("2025-03-03", "2025-03-03", "", [0, 6], false).working).toBe(0);
    expect(
      calculateBusinessDays("1000-01-01", "9999-12-31", "", [0, 1, 2, 3, 4, 5, 6]).working,
    ).toBe(0);
  });
  it("guards percentage bases and preserves negative change direction", () => {
    expect(calculatePercentage(200, 15, "of")).toBe(30);
    expect(calculatePercentage(-100, -50, "change")).toBe(50);
    expect(() => calculatePercentage(0, 10, "ratio")).toThrow();
  });
  it("amortizes zero-interest and ordinary loans with a complete schedule", () => {
    expect(calculateLoan(1200, 0, 12).monthly).toBe(100);
    const result = calculateLoan(100000, 6, 360);
    expect(result.schedule).toHaveLength(360);
    expect(result.schedule.at(-1)!.balance).toBeCloseTo(0, 5);
    expect(result.schedule.reduce((sum, row) => sum + row.principal, 0)).toBeCloseTo(100000, 5);
    expect(() => calculateLoan(10, 1, 1.5)).toThrow();
  });
  it("uses contributions per compounding period and explicit timing", () => {
    expect(calculateCompound(100, 10, 0, 2, 12).value).toBe(340);
    expect(calculateCompound(100, 0, -10, 1, 1).value).toBeCloseTo(90);
    expect(calculateCompound(100, 10, 10, 2, 12, true).value).toBeGreaterThan(
      calculateCompound(100, 10, 10, 2, 12).value,
    );
    expect(() => calculateCompound(1e12, 1e9, 100, 100, 12)).toThrow();
  });
});

describe("security format contracts", () => {
  it("matches the RFC 6238 TOTP test vectors", async () => {
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(await totp(secret, 59, 8)).toBe("94287082");
    expect(await totp(secret, 1234567890, 8)).toBe("89005924");
    expect(() => decodeBase32("NOT!BASE32")).toThrow();
    expect(() => decodeBase32("MZ")).toThrow();
  });
  it("calculates standard OpenSSH Base64 fingerprints from checked wire fields", async () => {
    const field = (value: Buffer) => {
      const length = Buffer.alloc(4);
      length.writeUInt32BE(value.length);
      return Buffer.concat([length, value]);
    };
    const body = Buffer.concat([field(Buffer.from("ssh-ed25519")), field(Buffer.alloc(32, 255))]);
    const key = `ssh-ed25519 ${body.toString("base64")} comment`;
    expect((await fingerprint(key)).fingerprint).toBe(
      `SHA256:${createHash("sha256").update(body).digest("base64").replace(/=+$/, "")}`,
    );
    expect(() => parsePublicKey(key.replace("ssh-ed25519 ", "ssh-rsa "))).toThrow();
    expect(() => parsePublicKey("ssh-ed25519 AAAA")).toThrow();
  });
  it("bounds random alphabets and supports whole Unicode characters", () => {
    const result = secureToken("🙂🙂🙃", 64);
    expect(Array.from(result)).toHaveLength(64);
    expect([...result].every((x) => ["🙂", "🙃"].includes(x))).toBe(true);
    expect(() => secureToken("a", 10)).toThrow();
    expect(() =>
      secureToken(
        Array.from({ length: 257 }, (_, i) => String.fromCodePoint(1000 + i)).join(""),
        10,
      ),
    ).toThrow();
    expect(() => secureToken("ab", 1.5)).toThrow();
  });
});

/* eslint-disable no-template-curly-in-string -- Nginx variable fixture */
describe("source fidelity and diff", () => {
  it("preserves multiline configuration values and redacts their entire value", () => {
    const source = 'PASSWORD = "first\n  second"\nexport API_KEY = abc\n# unchanged   comment';
    expect(formatEnv(source)).toBe(
      'PASSWORD="first\n  second"\nexport API_KEY=abc\n# unchanged   comment',
    );
    const safe = formatEnv(source, true);
    expect(safe).not.toContain("second");
    expect(safe).not.toContain("abc");
    expect(safe).toContain('PASSWORD="[REDACTED]"');
    expect(() => formatEnv('KEY="unclosed')).toThrow();
  });
  it("does not uppercase Dockerfile heredoc content or shell continuations", () => {
    expect(formatDockerfile("from alpine\nrun <<EOF\nfrom content\nEOF\nworkdir /app")).toBe(
      "FROM alpine\nRUN <<EOF\nfrom content\nEOF\nWORKDIR /app",
    );
    expect(formatDockerfile("run echo hello \\\n  from shell")).toContain("  from shell");
  });
  it("formats Nginx blocks without splitting quoted punctuation or variables", () => {
    const formatted = formatNginx(
      'server { set $x "${uri};{x}"; location / { return 200 "ok"; } }',
    );
    expect(formatted).toContain('set $x "${uri};{x}";');
    expect(formatted).toContain('    return 200 "ok";');
    expect(() => formatNginx("server {")).toThrow();
  });
  it("recognizes an insertion without treating following lines as changes", () => {
    const result = compareText("one\ntwo\nthree\n", "one\nnew\ntwo\nthree\n");
    expect(result.added).toBe(1);
    expect(result.removed).toBe(0);
    expect(result.rows.filter((r) => r.type === "same")).toHaveLength(3);
  });
});
