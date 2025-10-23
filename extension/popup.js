/**
 * PostCrossing Tab Sorter - Popup Script (Manifest V2)
 * Handles the popup interface for the extension
 */

const DEBUG = true;

// DOM elements
const sortButton = document.getElementById("sortButton");
const statusDiv = document.getElementById("status");

/**
 * Show status message to user
 */
function showStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${isError ? "error" : "success"}`;
  statusDiv.classList.remove("hidden");

  // Hide status after 3 seconds
  setTimeout(() => {
    statusDiv.classList.add("hidden");
  }, 3000);
}

/**
 * Count tabs that match PostCrossing pattern
 */
async function countPostCrossingTabs() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const codeRegex = /(^|[^A-Z])([A-Z]{2})-(\d+)\b/;

    let matchingTabs = 0;
    let pinnedTabs = 0;

    for (const tab of tabs) {
      if (tab.pinned) {
        pinnedTabs++;
        continue;
      }

      const title = String(tab.title || "").toUpperCase();
      if (codeRegex.test(title)) {
        matchingTabs++;
      }
    }

    return { total: tabs.length, matching: matchingTabs, pinned: pinnedTabs };
  } catch (err) {
    if (DEBUG) console.error("[Popup] Error counting tabs:", err);
    return { total: 0, matching: 0, pinned: 0 };
  }
}

/**
 * Sort tabs by sending message to background script
 */
async function sortTabs() {
  try {
    sortButton.disabled = true;
    sortButton.textContent = "Sorting...";

    // Get tab counts before sorting
    const beforeCounts = await countPostCrossingTabs();

    if (beforeCounts.matching === 0) {
      showStatus("No PostCrossing tabs found to sort", true);
      return;
    }

    // Execute the sorting logic directly
    const tabs = await browser.tabs.query({ currentWindow: true });
    if (tabs.length === 0) {
      showStatus("No tabs found in current window", true);
      return;
    }

    // Use the same logic as background script
    const desired = computeOrder(tabs);
    await applyOrder(tabs, desired);

    // Success message
    const message = `Sorted ${beforeCounts.matching} PostCrossing tab${beforeCounts.matching !== 1 ? "s" : ""}`;
    showStatus(message);

    if (DEBUG) {
      console.log("[Popup] Sort completed successfully");
    }
  } catch (err) {
    showStatus("Failed to sort tabs. Please try again.", true);
    if (DEBUG) console.error("[Popup] Sort error:", err);
  } finally {
    sortButton.disabled = false;
    sortButton.textContent = "Sort PostCrossing Tabs";
  }
}

/**
 * Extract postcard info from tab title (duplicated from background.js)
 */
function extractFromTab(tab) {
  const codeRegex = /(^|[^A-Z])([A-Z]{2})-(\d+)\b/;
  const title = String(tab.title || "").toUpperCase();
  const match = title.match(codeRegex);
  if (!match) return null;
  const country = match[2];
  const num = Number.parseInt(match[3], 10);
  if (!Number.isFinite(num)) return null;
  return { country, num };
}

/**
 * Partition tabs (duplicated from background.js)
 */
function partitionTabs(tabs) {
  const matchers = [];
  const rest = [];
  for (const tab of tabs) {
    const info = extractFromTab(tab);
    if (info) matchers.push({ ...info, tab });
    else rest.push(tab);
  }
  return { matchers, rest };
}

/**
 * Compare function for sorting (duplicated from background.js)
 */
function compareByPostcard(a, b) {
  if (a.num !== b.num) return a.num - b.num;
  return a.country.localeCompare(b.country);
}

/**
 * Compute desired order (duplicated from background.js)
 */
function computeOrder(tabs) {
  const pinned = tabs.filter((tab) => tab.pinned);
  const unpinned = tabs.filter((tab) => !tab.pinned);

  const { matchers, rest } = partitionTabs(unpinned);
  matchers.sort(compareByPostcard);

  const orderedUnpinned = [...matchers.map((m) => m.tab), ...rest];
  return [...pinned, ...orderedUnpinned];
}

/**
 * Apply new order (duplicated from background.js)
 */
async function applyOrder(current, desired) {
  const currentIds = current.map((tab) => tab.id);
  const desiredIds = desired.map((tab) => tab.id);

  // Check if already in desired order
  const same =
    currentIds.length === desiredIds.length &&
    currentIds.every((id, i) => id === desiredIds[i]);
  if (same) {
    if (DEBUG) console.info("[Popup] Tabs already in desired order");
    return;
  }

  // Move each tab to target index
  for (let i = 0; i < desired.length; i++) {
    const tab = desired[i];
    if (typeof tab.id !== "number") continue;
    try {
      await browser.tabs.move(tab.id, { index: i });
    } catch (err) {
      if (DEBUG) console.warn("[Popup] Move failed for tab", tab.id, err);
    }
  }
}

/**
 * Update button text with tab count
 */
async function updateButtonText() {
  try {
    const counts = await countPostCrossingTabs();
    if (counts.matching > 0) {
      sortButton.textContent = `Sort ${counts.matching} PostCrossing Tab${counts.matching !== 1 ? "s" : ""}`;
    } else {
      sortButton.textContent = "Sort PostCrossing Tabs";
    }
  } catch (err) {
    if (DEBUG) console.error("[Popup] Error updating button text:", err);
  }
}

// Event listeners
sortButton.addEventListener("click", sortTabs);

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  updateButtonText()
    .then(() => {
      if (DEBUG) {
        console.log("[Popup] Popup initialized");
      }
    })
    .catch((err) => {
      if (DEBUG) console.error("[Popup] Initialization error:", err);
    });
});

// Handle keyboard shortcut display
document.addEventListener("keydown", (event) => {
  // Listen for Alt+Shift+S and trigger sort
  if (event.altKey && event.shiftKey && event.key === "S") {
    event.preventDefault();
    sortTabs();
  }
});
