import { sha256OfBuffer, normalizeHash } from "../patchIntegrity";

function bytes(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer as ArrayBuffer;
}

describe("sha256OfBuffer", () => {
  test("produces 0x-prefixed lowercase 64-char hex", async () => {
    const h = await sha256OfBuffer(bytes("hello world"));
    expect(h).toMatch(/^0x[0-9a-f]{64}$/);
  });

  test("matches the known SHA-256 vector for 'hello world' (same as backend)", async () => {
    expect(await sha256OfBuffer(bytes("hello world"))).toBe(
      "0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    );
  });

  test("matches the known SHA-256 vector for empty input", async () => {
    expect(await sha256OfBuffer(new ArrayBuffer(0))).toBe(
      "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });

  test("tampered content yields a different hash", async () => {
    const original = await sha256OfBuffer(bytes("patch-payload"));
    const tampered = await sha256OfBuffer(bytes("patch-payloaX"));
    expect(tampered).not.toBe(original);
  });
});

describe("normalizeHash", () => {
  test("lowercases and trims", () => {
    expect(normalizeHash("  0xABCDEF  ")).toBe("0xabcdef");
  });

  test("handles empty / nullish input", () => {
    expect(normalizeHash("")).toBe("");
    expect(normalizeHash(null as unknown as string)).toBe("");
  });

  test("integrity check: normalized frontend hash equals normalized on-chain hash", async () => {
    const computed = await sha256OfBuffer(bytes("firmware"));
    const onChain = computed.toUpperCase().replace("0X", "0x");
    expect(normalizeHash(computed)).toBe(normalizeHash(onChain));
  });
});
