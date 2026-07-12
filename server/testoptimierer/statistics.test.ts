/**
 * Vitest tests for Testoptimierer statistics engine
 */
import { describe, it, expect } from "vitest";
import { calculateSignificance, shouldAutoStop, calculateOverallPerformance } from "./statistics";

describe("calculateSignificance", () => {
  it("returns not significant for very small sample", () => {
    const result = calculateSignificance(10, 1, 10, 2);
    expect(result.isSignificant).toBe(false);
    expect(result.winner).toBe("none");
    expect(result.pValue).toBeGreaterThan(0.05);
  });

  it("returns not significant for equal conversion rates", () => {
    const result = calculateSignificance(500, 50, 500, 50);
    expect(result.isSignificant).toBe(false);
    expect(result.winner).toBe("none");
    expect(result.pValue).toBeGreaterThan(0.5);
  });

  it("detects significant improvement for large difference", () => {
    // A: 1000 visitors, 50 conversions (5%)
    // B: 1000 visitors, 100 conversions (10%)
    const result = calculateSignificance(1000, 50, 1000, 100);
    expect(result.isSignificant).toBe(true);
    expect(result.winner).toBe("b");
    expect(result.pValue).toBeLessThan(0.05);
    expect(result.improvementPercent).toBeGreaterThan(50);
    expect(result.confidencePercent).toBeGreaterThan(95);
  });

  it("detects winner A when A is better", () => {
    const result = calculateSignificance(1000, 100, 1000, 50);
    expect(result.isSignificant).toBe(true);
    expect(result.winner).toBe("a");
    expect(result.improvementPercent).toBeLessThan(0);
  });

  it("handles zero conversions gracefully", () => {
    const result = calculateSignificance(100, 0, 100, 0);
    expect(result.isSignificant).toBe(false);
    expect(result.winner).toBe("none");
    expect(result.crA).toBe(0);
    expect(result.crB).toBe(0);
  });

  it("handles very small visitor counts", () => {
    const result = calculateSignificance(1, 0, 1, 1);
    expect(result.isSignificant).toBe(false);
    expect(result.winner).toBe("none");
  });

  it("uses custom significance threshold", () => {
    // With strict threshold (0.01), a moderate difference might not be significant
    const result = calculateSignificance(200, 20, 200, 35, 0.01);
    // With default 0.05 this might be significant, but with 0.01 it might not
    expect(result.pValue).toBeDefined();
    expect(typeof result.isSignificant).toBe("boolean");
  });
});

describe("shouldAutoStop", () => {
  // Signature: shouldAutoStop(visitorsA, visitorsB, pValue, minVisitorsForStop, pValueThresholdForStop)
  it("returns false when below minimum visitors", () => {
    const result = shouldAutoStop(250, 250, 0.5, 1000, 0.20);
    expect(result).toBe(false);
  });

  it("returns true when above min visitors and p-value is high", () => {
    const result = shouldAutoStop(600, 600, 0.5, 1000, 0.20);
    expect(result).toBe(true);
  });

  it("returns true when max visitors exceeded and p-value high", () => {
    const result = shouldAutoStop(1250, 1250, 0.30, 1000, 0.20);
    expect(result).toBe(true);
  });

  it("returns false when p-value is below stop threshold", () => {
    const result = shouldAutoStop(600, 600, 0.10, 1000, 0.20);
    expect(result).toBe(false);
  });
});

describe("calculateOverallPerformance", () => {
  it("returns zeros for empty test array", () => {
    const result = calculateOverallPerformance([]);
    expect(result.totalTests).toBe(0);
    expect(result.completedTests).toBe(0);
    expect(result.weightedImprovement).toBe(0);
    expect(result.estimatedAdditionalLeads).toBe(0);
  });

  it("only counts completed tests", () => {
    const tests = [
      { status: "running", visitorsA: 100, visitorsB: 100, conversionsA: 10, conversionsB: 15, improvementPercent: 50 },
      { status: "winner_b", visitorsA: 500, visitorsB: 500, conversionsA: 50, conversionsB: 75, improvementPercent: 50 },
    ];
    const result = calculateOverallPerformance(tests);
    expect(result.totalTests).toBe(2);
    expect(result.completedTests).toBe(1);
    expect(result.totalVisitors).toBe(1000);
  });

  it("calculates weighted improvement correctly", () => {
    const tests = [
      { status: "winner_b", visitorsA: 500, visitorsB: 500, conversionsA: 50, conversionsB: 75, improvementPercent: 50 },
      { status: "winner_a", visitorsA: 500, visitorsB: 500, conversionsA: 60, conversionsB: 45, improvementPercent: -25 },
    ];
    const result = calculateOverallPerformance(tests);
    expect(result.completedTests).toBe(2);
    expect(result.positiveTests).toBe(1);
    expect(result.negativeTests).toBe(1);
    // Baseline: 50 + 60 = 110, Actual: 75 + 45 = 120
    expect(result.estimatedAdditionalLeads).toBe(10);
    expect(result.weightedImprovement).toBeCloseTo((120 - 110) / 110 * 100, 1);
  });

  it("handles no_result tests", () => {
    const tests = [
      { status: "no_result", visitorsA: 1000, visitorsB: 1000, conversionsA: 100, conversionsB: 102, improvementPercent: 2 },
    ];
    const result = calculateOverallPerformance(tests);
    expect(result.completedTests).toBe(1);
    expect(result.positiveTests).toBe(1);
    expect(result.estimatedAdditionalLeads).toBe(2);
  });
});
