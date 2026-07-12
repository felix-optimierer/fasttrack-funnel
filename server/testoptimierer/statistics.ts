/**
 * Testoptimierer – Statistik-Engine
 * Chi-Squared-Test für A/B-Testing Signifikanz-Berechnung.
 */

// Chi-squared CDF approximation using the regularized incomplete gamma function
// This avoids the need for external dependencies for a simple 1-df chi-squared test.

function gammainc(a: number, x: number): number {
  // Regularized lower incomplete gamma function P(a, x)
  // Using series expansion for small x, continued fraction for large x
  if (x < 0) return 0;
  if (x === 0) return 0;

  if (x < a + 1) {
    // Series expansion
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-10) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  } else {
    // Continued fraction (Lentz's method)
    let f = 1e-30;
    let c = 1e-30;
    let d = 1 / (x - a + 1);
    f = d;
    for (let n = 1; n < 200; n++) {
      const an = -n * (n - a);
      const bn = x - a + 1 + 2 * n;
      d = bn + an * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = bn + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const delta = c * d;
      f *= delta;
      if (Math.abs(delta - 1) < 1e-10) break;
    }
    return 1 - f * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
}

function logGamma(x: number): number {
  // Stirling's approximation with Lanczos coefficients
  const g = 7;
  const coef = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  x -= 1;
  let a = coef[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) {
    a += coef[i] / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/**
 * Chi-squared CDF with 1 degree of freedom.
 * Returns the probability that a chi-squared random variable is <= x.
 */
function chiSquaredCDF(x: number, df: number = 1): number {
  if (x <= 0) return 0;
  return gammainc(df / 2, x / 2);
}

export interface SignificanceResult {
  /** p-value (0-1). Lower = more significant. */
  pValue: number;
  /** Whether the result is statistically significant at the given threshold. */
  isSignificant: boolean;
  /** Chi-squared test statistic. */
  chiSquared: number;
  /** Conversion rate for variant A (control). */
  crA: number;
  /** Conversion rate for variant B (variant). */
  crB: number;
  /** Relative improvement of B over A in percent. */
  improvementPercent: number;
  /** Which variant is winning. */
  winner: "a" | "b" | "none";
  /** Confidence level (1 - pValue) as percentage. */
  confidencePercent: number;
}

/**
 * Calculate statistical significance using Chi-Squared test.
 * 
 * @param visitorsA - Number of visitors in control group
 * @param conversionsA - Number of conversions in control group
 * @param visitorsB - Number of visitors in variant group
 * @param conversionsB - Number of conversions in variant group
 * @param significanceThreshold - p-value threshold for significance (default 0.05 = 95% confidence)
 */
export function calculateSignificance(
  visitorsA: number,
  conversionsA: number,
  visitorsB: number,
  conversionsB: number,
  significanceThreshold: number = 0.05,
): SignificanceResult {
  // Guard against division by zero
  if (visitorsA === 0 || visitorsB === 0) {
    return {
      pValue: 1,
      isSignificant: false,
      chiSquared: 0,
      crA: 0,
      crB: 0,
      improvementPercent: 0,
      winner: "none",
      confidencePercent: 0,
    };
  }

  const crA = conversionsA / visitorsA;
  const crB = conversionsB / visitorsB;

  // Overall conversion rate (pooled)
  const totalVisitors = visitorsA + visitorsB;
  const totalConversions = conversionsA + conversionsB;
  const pooledCR = totalConversions / totalVisitors;

  // If no conversions at all, can't determine significance
  if (totalConversions === 0) {
    return {
      pValue: 1,
      isSignificant: false,
      chiSquared: 0,
      crA: 0,
      crB: 0,
      improvementPercent: 0,
      winner: "none",
      confidencePercent: 0,
    };
  }

  // Expected values under null hypothesis (same conversion rate)
  const expectedConvA = visitorsA * pooledCR;
  const expectedNoConvA = visitorsA * (1 - pooledCR);
  const expectedConvB = visitorsB * pooledCR;
  const expectedNoConvB = visitorsB * (1 - pooledCR);

  // Chi-squared statistic with Yates' correction for 2x2 table
  const noConvA = visitorsA - conversionsA;
  const noConvB = visitorsB - conversionsB;

  let chiSquared = 0;
  if (expectedConvA > 0) chiSquared += Math.pow(conversionsA - expectedConvA, 2) / expectedConvA;
  if (expectedNoConvA > 0) chiSquared += Math.pow(noConvA - expectedNoConvA, 2) / expectedNoConvA;
  if (expectedConvB > 0) chiSquared += Math.pow(conversionsB - expectedConvB, 2) / expectedConvB;
  if (expectedNoConvB > 0) chiSquared += Math.pow(noConvB - expectedNoConvB, 2) / expectedNoConvB;

  // p-value from chi-squared distribution with 1 degree of freedom
  const pValue = 1 - chiSquaredCDF(chiSquared, 1);

  // Improvement calculation
  const improvementPercent = crA > 0 ? ((crB - crA) / crA) * 100 : 0;

  // Determine winner
  let winner: "a" | "b" | "none" = "none";
  if (pValue < significanceThreshold) {
    winner = crB > crA ? "b" : "a";
  }

  return {
    pValue,
    isSignificant: pValue < significanceThreshold,
    chiSquared,
    crA,
    crB,
    improvementPercent,
    winner,
    confidencePercent: (1 - pValue) * 100,
  };
}

/**
 * Determine if a test should be auto-stopped due to no significance after enough visitors.
 */
export function shouldAutoStop(
  visitorsA: number,
  visitorsB: number,
  pValue: number,
  minVisitorsForStop: number = 1000,
  pValueThresholdForStop: number = 0.20,
): boolean {
  const totalVisitors = visitorsA + visitorsB;
  return totalVisitors >= minVisitorsForStop && pValue > pValueThresholdForStop;
}

/**
 * Calculate overall project performance across multiple completed tests.
 * Returns the cumulative weighted improvement and estimated additional leads.
 */
export function calculateOverallPerformance(
  tests: Array<{
    status: string;
    visitorsA: number;
    visitorsB: number;
    conversionsA: number;
    conversionsB: number;
    improvementPercent: number | null;
  }>,
): {
  totalTests: number;
  completedTests: number;
  positiveTests: number;
  negativeTests: number;
  weightedImprovement: number;
  estimatedAdditionalLeads: number;
  totalVisitors: number;
  baselineConversions: number;
} {
  const completedTests = tests.filter(t =>
    ["winner_a", "winner_b", "no_result"].includes(t.status)
  );

  let totalVisitors = 0;
  let baselineConversions = 0;
  let actualConversions = 0;
  let positiveTests = 0;
  let negativeTests = 0;

  for (const test of completedTests) {
    totalVisitors += test.visitorsA + test.visitorsB;
    baselineConversions += test.conversionsA;
    actualConversions += test.conversionsB;

    const improvement = test.improvementPercent ?? 0;
    if (improvement > 0) positiveTests++;
    else if (improvement < 0) negativeTests++;
  }

  // Weighted improvement: how many additional leads were gained/lost
  const estimatedAdditionalLeads = actualConversions - baselineConversions;

  // Weighted improvement percentage
  const weightedImprovement = baselineConversions > 0
    ? ((actualConversions - baselineConversions) / baselineConversions) * 100
    : 0;

  return {
    totalTests: tests.length,
    completedTests: completedTests.length,
    positiveTests,
    negativeTests,
    weightedImprovement,
    estimatedAdditionalLeads,
    totalVisitors,
    baselineConversions,
  };
}
