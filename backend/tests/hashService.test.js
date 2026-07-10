const { sha256Hex, ensureBytes32 } = require("../services/hashService");

describe("sha256Hex", () => {
  test("hashes a buffer to 0x-prefixed 64-char hex", () => {
    const out = sha256Hex(Buffer.from("hello world"));
    expect(out).toMatch(/^0x[0-9a-f]{64}$/);
  });

  test("matches the known SHA-256 vector for 'hello world'", () => {
    expect(sha256Hex(Buffer.from("hello world"))).toBe(
      "0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    );
  });

  test("matches the known SHA-256 vector for empty input", () => {
    expect(sha256Hex(Buffer.alloc(0))).toBe(
      "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });

  test("different content produces different hashes", () => {
    expect(sha256Hex(Buffer.from("patch-v1"))).not.toBe(
      sha256Hex(Buffer.from("patch-v2"))
    );
  });

  test("same content always produces the same hash (deterministic)", () => {
    const a = sha256Hex(Buffer.from("firmware.bin"));
    const b = sha256Hex(Buffer.from("firmware.bin"));
    expect(a).toBe(b);
  });
});

describe("ensureBytes32", () => {
  const valid =
    "0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

  test("accepts a valid bytes32 hex string", () => {
    expect(ensureBytes32(valid)).toBe(valid);
  });

  test("lowercases mixed-case input", () => {
    expect(ensureBytes32(valid.toUpperCase().replace("0X", "0x"))).toBe(valid);
  });

  test.each([
    ["missing 0x prefix", valid.slice(2)],
    ["too short", "0xabc123"],
    ["too long", valid + "ff"],
    ["non-hex characters", "0x" + "zz".repeat(32)],
    ["empty string", ""],
  ])("rejects %s", (_label, bad) => {
    expect(() => ensureBytes32(bad)).toThrow("fileHash must be a bytes32 hex string");
  });
});
