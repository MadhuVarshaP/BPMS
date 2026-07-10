import { stripVersion, isVersionNewer } from "../versionCompare";

describe("stripVersion", () => {
  test("removes a leading v (any case) and trims whitespace", () => {
    expect(stripVersion("v1.2.3")).toBe("1.2.3");
    expect(stripVersion("V1.2.3")).toBe("1.2.3");
    expect(stripVersion("  1.0.0  ")).toBe("1.0.0");
  });

  test("handles empty / nullish input", () => {
    expect(stripVersion("")).toBe("");
    expect(stripVersion(undefined as unknown as string)).toBe("");
  });
});

describe("isVersionNewer — semver ordering", () => {
  test.each([
    ["1.0.1", "1.0.0", true],
    ["1.1.0", "1.0.9", true],
    ["2.0.0", "1.9.9", true],
    ["1.0.0", "1.0.0", false], // equal is not newer
    ["1.0.0", "1.0.1", false],
    ["0.9.9", "1.0.0", false],
  ])("%s newer than %s -> %s", (cand, cur, expected) => {
    expect(isVersionNewer(cand, cur)).toBe(expected);
  });

  test("v-prefix does not affect comparison", () => {
    expect(isVersionNewer("v1.0.1", "1.0.0")).toBe(true);
    expect(isVersionNewer("1.0.1", "v1.0.0")).toBe(true);
  });

  test("shorter version strings are zero-padded (1.1 vs 1.0.5)", () => {
    expect(isVersionNewer("1.1", "1.0.5")).toBe(true);
    expect(isVersionNewer("1.0", "1.0.5")).toBe(false);
  });
});

describe("isVersionNewer — KB build ids (Windows style)", () => {
  test("KB ids compare numerically", () => {
    expect(isVersionNewer("KB5030212", "KB5030211")).toBe(true);
    expect(isVersionNewer("KB5030211", "KB5030212")).toBe(false);
    expect(isVersionNewer("KB5030211", "KB5030211")).toBe(false);
  });

  test("VKB prefix is accepted", () => {
    expect(isVersionNewer("VKB5030212", "VKB5030211")).toBe(true);
  });

  test("KB id vs semver falls back to compact-rank comparison", () => {
    // KB5030211 (5030211) > 1.0.9 compact rank (1000009)
    expect(isVersionNewer("VKB5030211", "1.0.9")).toBe(true);
  });
});

describe("isVersionNewer — edge cases", () => {
  test("empty current: any candidate is newer", () => {
    expect(isVersionNewer("1.0.0", "")).toBe(true);
  });

  test("empty candidate is never newer", () => {
    expect(isVersionNewer("", "1.0.0")).toBe(false);
    expect(isVersionNewer("", "")).toBe(false);
  });

  test("garbage alphabetic candidate is not newer", () => {
    expect(isVersionNewer("abc", "1.0.0")).toBe(false);
  });
});
