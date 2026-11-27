import { describe, it, expect } from "vitest";
import {
  getTotalReturnRate,
  getEffectiveMonthlyRate,
  INVESTMENT_CONFIG,
} from "./investment";

describe("return schedule", () => {
  it("has exactly the four allowed terms", () => {
    expect(INVESTMENT_CONFIG.availableTerms).toEqual([1, 3, 6, 12]);
  });

  it("effective monthly rate strictly increases with term", () => {
    const terms = INVESTMENT_CONFIG.availableTerms;
    for (let i = 1; i < terms.length; i++) {
      expect(getEffectiveMonthlyRate(terms[i])).toBeGreaterThan(
        getEffectiveMonthlyRate(terms[i - 1])
      );
    }
  });

  it("total return strictly increases with term", () => {
    const terms = INVESTMENT_CONFIG.availableTerms;
    for (let i = 1; i < terms.length; i++) {
      expect(getTotalReturnRate(terms[i])).toBeGreaterThan(
        getTotalReturnRate(terms[i - 1])
      );
    }
  });

  it("rejects terms not in the schedule", () => {
    expect(() => getTotalReturnRate(18)).toThrow(/18-month/);
  });
});