/**
 * Testoptimierer – Tag Generator
 * Generates the dynamic JavaScript snippet for A/B testing on external pages.
 */

import type { AbTest, AbElement, AbProject } from "../../drizzle/schema";

export interface TagConfig {
  project: AbProject;
  element: AbElement;
  test: AbTest;
  baseUrl: string;
}

/**
 * Generate the client-side A/B testing script for a given project.
 * If no active test is running, returns an empty script.
 */
export function generateTag(config: TagConfig | null): string {
  if (!config) {
    // No active test – return minimal no-op script
    return `/* Testoptimierer: Kein aktiver Test */`;
  }

  const { project, element, test, baseUrl } = config;

  return `(function(){
  "use strict";
  var CONFIG = {
    projectId: ${project.id},
    testId: ${test.id},
    cssSelector: ${JSON.stringify(element.cssSelector)},
    controlText: ${JSON.stringify(test.controlText)},
    variantText: ${JSON.stringify(test.variantText)},
    trafficSplit: ${test.trafficSplit},
    conversionPattern: ${JSON.stringify(project.conversionUrlPattern)},
    conversionMatchType: ${JSON.stringify(project.conversionMatchType)},
    baseUrl: ${JSON.stringify(baseUrl)}
  };

  // Anti-Flicker: Hide target element immediately
  var style = document.createElement("style");
  style.id = "to-antiflicker-" + CONFIG.testId;
  style.textContent = CONFIG.cssSelector + " { visibility: hidden !important; }";
  document.head.appendChild(style);

  // Cookie helpers
  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  }
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
  }

  // UUID generator
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // Deterministic variant assignment based on visitor ID hash
  function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  function assignVariant(visitorId, split) {
    var hash = hashCode(visitorId + "-" + CONFIG.testId);
    return (hash % 100) < split ? "b" : "a";
  }

  // Get or create visitor ID
  var COOKIE_NAME = "_to_uid";
  var visitorId = getCookie(COOKIE_NAME);
  if (!visitorId) {
    visitorId = uuid();
    setCookie(COOKIE_NAME, visitorId, 365);
  }

  // Assign variant
  var variant = assignVariant(visitorId, CONFIG.trafficSplit);

  // Apply variant and remove anti-flicker
  function applyVariant() {
    var el = document.querySelector(CONFIG.cssSelector);
    if (el && variant === "b") {
      el.textContent = CONFIG.variantText;
    }
    // Remove anti-flicker
    var flickerStyle = document.getElementById("to-antiflicker-" + CONFIG.testId);
    if (flickerStyle) flickerStyle.remove();
    if (el) el.style.visibility = "visible";
  }

  // Track impression
  function trackImpression() {
    var url = CONFIG.baseUrl + "/api/testoptimierer/track/impression";
    var body = JSON.stringify({
      testId: CONFIG.testId,
      visitorId: visitorId,
      variant: variant
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(body);
    }
  }

  // Track conversion (if current page matches conversion pattern)
  function checkConversion() {
    var path = window.location.pathname + window.location.search;
    var href = window.location.href;
    var match = false;
    if (CONFIG.conversionMatchType === "exact") {
      match = path === CONFIG.conversionPattern || href === CONFIG.conversionPattern;
    } else {
      match = path.indexOf(CONFIG.conversionPattern) !== -1 || href.indexOf(CONFIG.conversionPattern) !== -1;
    }
    if (match) {
      var url = CONFIG.baseUrl + "/api/testoptimierer/track/conversion";
      var body = JSON.stringify({
        testId: CONFIG.testId,
        visitorId: visitorId
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(body);
      }
    }
  }

  // Execute with retry for SPA (React may not have rendered yet)
  var MAX_RETRIES = 20;
  var RETRY_INTERVAL = 100; // ms
  var retries = 0;
  var applied = false;

  function tryApply() {
    var el = document.querySelector(CONFIG.cssSelector);
    if (el) {
      applied = true;
      applyVariant();
      trackImpression();
      checkConversion();
    } else if (retries < MAX_RETRIES) {
      retries++;
      setTimeout(tryApply, RETRY_INTERVAL);
    } else {
      // Fallback: remove anti-flicker even if element not found
      var flickerStyle = document.getElementById("to-antiflicker-" + CONFIG.testId);
      if (flickerStyle) flickerStyle.remove();
    }
  }

  // Global marker for verification
  window.__TESTOPTIMIERER_LOADED = window.__TESTOPTIMIERER_LOADED || {};
  window.__TESTOPTIMIERER_LOADED[CONFIG.projectId] = {
    testId: CONFIG.testId,
    variant: variant,
    visitorId: visitorId,
    loadedAt: new Date().toISOString()
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryApply);
  } else {
    tryApply();
  }

  // Also check conversion on SPA navigation (popstate)
  window.addEventListener("popstate", checkConversion);
  // Handle SPA pushState navigation
  var origPushState = history.pushState;
  history.pushState = function() {
    origPushState.apply(this, arguments);
    setTimeout(checkConversion, 100);
  };
})();`;
}
