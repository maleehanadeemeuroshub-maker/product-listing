import { describe, it, expect } from "vitest";
import { scorePassword, isStrongEnough } from "./passwordStrength";

describe("scorePassword", () => {
  it("scores an empty password as very weak", () => {
    expect(scorePassword("").score).toBe(0);
  });

  it("scores a long password with all character classes as strong", () => {
    const { score, label } = scorePassword("Str0ng!Pass");
    expect(score).toBe(4);
    expect(label).toBe("Strong");
  });

  it("gives a mid-range score to a password with only some character classes", () => {
    const { score } = scorePassword("password1");
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(4);
  });

  it("never returns a score outside 0-4", () => {
    expect(scorePassword("a").score).toBeGreaterThanOrEqual(0);
    expect(scorePassword("Aa1!Aa1!Aa1!Aa1!").score).toBeLessThanOrEqual(4);
  });
});

describe("isStrongEnough", () => {
  it("rejects short passwords", () => {
    expect(isStrongEnough("a1")).toBe(false);
  });

  it("rejects passwords without a number", () => {
    expect(isStrongEnough("longenoughpassword")).toBe(false);
  });

  it("accepts a password with 8+ chars, a letter and a number", () => {
    expect(isStrongEnough("password123")).toBe(true);
  });
});
