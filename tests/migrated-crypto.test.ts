import { describe, expect, it } from "vitest";
import { decryptAes, encryptAes } from "../app/features/tools/security/aes-encryptor/aes";

function aes() {
  const state = {
    password: { value: "test-only-password" },
    input: { value: "" },
    output: { value: "" },
  };
  const rules = {
    encrypt: async () => {
      state.output.value = await encryptAes(state.input.value, state.password.value);
    },
    decrypt: async () => {
      try {
        state.output.value = await decryptAes(state.input.value, state.password.value);
      } catch (cause) {
        state.output.value = (cause as Error).message;
      }
    },
  };
  return { ...state, ...rules };
}

describe("migrated AES export contract", () => {
  it("round-trips Unicode with salt, IV and authenticated ciphertext", async () => {
    const engine = aes();
    engine.input.value = "Instruo — नमस्ते 🔒";
    await engine.encrypt();
    const payload = JSON.parse(engine.output.value);
    expect(Object.keys(payload).sort()).toEqual(["data", "iv", "salt"]);
    expect(atob(payload.salt)).toHaveLength(16);
    expect(atob(payload.iv)).toHaveLength(12);
    engine.input.value = engine.output.value;
    await engine.decrypt();
    expect(engine.output.value).toBe("Instruo — नमस्ते 🔒");
  });

  it("does not reuse IV/salt on repeated encryption", async () => {
    const engine = aes();
    engine.input.value = "same test input";
    await engine.encrypt();
    const first = JSON.parse(engine.output.value);
    await engine.encrypt();
    const second = JSON.parse(engine.output.value);
    expect(first.iv).not.toBe(second.iv);
    expect(first.salt).not.toBe(second.salt);
    expect(first.data).not.toBe(second.data);
  });

  it.each(["wrong password", "tampered ciphertext", "malformed JSON"])(
    "rejects %s",
    async (scenario) => {
      const engine = aes();
      engine.input.value = "private test content";
      await engine.encrypt();
      const payload = JSON.parse(engine.output.value);
      if (scenario === "wrong password") engine.password.value = "not-the-password";
      if (scenario === "tampered ciphertext") {
        const bytes = atob(payload.data);
        payload.data = btoa(String.fromCharCode(bytes.charCodeAt(0) ^ 1) + bytes.slice(1));
      }
      engine.input.value = scenario === "malformed JSON" ? "{broken" : JSON.stringify(payload);
      await engine.decrypt();
      expect(engine.output.value).toBe("Unable to decrypt. Check password and payload.");
    },
  );
});
