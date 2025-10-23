/**
 * PostCrossing Tab Sorter (Background Script - Manifest V2)
 * ----------------------------------------------------------
 * Sorts tabs in the current Firefox window by the numeric part of postcard codes
 * found in the tab titles, e.g.:
 *   - "postcrossing Postcrossing postcard CL-34269 from Chile"
 *   - "postcrossing Postcrossing postcard CN-4087990 from China"
 *   - "postcrossing Postcrossing postcard US-11797804 from U.S.A."
 *
 * Sorting rule:
 *   1) Tabs with a recognizable code [A-Z]{2}-\d+ are sorted first by the
 *      numeric part (ascending). When numeric parts are equal, sort by country code.
 *   2) Tabs without a recognizable code remain after, preserving their relative order.
 *   3) Pinned tabs are left untouched and remain at the beginning of the tab strip.
 *
 * Trigger:
 *   - Toolbar button popup
 *   - Keyboard command "sort-postcrossing-tabs" (defined in manifest)
 *   - Context menu item
 */

const DEBUG = true;

// Match "CC-12345" where CC is two letters, number is 1+ digits.
// Case-insensitive by uppercasing titles before matching.
const CODE_RE = /(^|[^A-Z])([A-Z]{2})-(\d+)\b/;

/**
 * Extract postcard info from a tab title.
 * @param {browser.tabs.Tab} tab
 * @returns {{country: string, num: number} | null}
 */
function extractFromTab(tab) {
  const title = String(tab.title || "").toUpperCase();
  if (DEBUG)
    console.log(`[DEBUG] Checking tab title: "${tab.title}" -> "${title}"`);
  const m = title.match(CODE_RE);
  if (!m) {
    if (DEBUG) console.log(`[DEBUG] No match for title: "${title}"`);
    return null;
  }
  if (DEBUG) console.log(`[DEBUG] Regex match:`, m);
  const country = m[2];
  const num = Number.parseInt(m[3], 10);
  if (!Number.isFinite(num)) {
    if (DEBUG) console.log(`[DEBUG] Invalid number: "${m[3]}"`);
    return null;
  }
  if (DEBUG) console.log(`[DEBUG] Extracted: country=${country}, num=${num}`);
  return { country, num };
}

/**
 * Stable partition of tabs into matchers and non-matchers, preserving original order for non-matchers.
 * @param {Array<browser.tabs.Tab>} tabs
 */
function partitionTabs(tabs) {
  const matchers = [];
  const rest = [];
  for (const t of tabs) {
    const info = extractFromTab(t);
    if (info) matchers.push({ ...info, tab: t });
    else rest.push(t);
  }
  return { matchers, rest };
}

/**
 * Compare function for sorting by numeric part, then by country code.
 */
function compareByPostcard(a, b) {
  if (a.num !== b.num) return a.num - b.num;
  return a.country.localeCompare(b.country);
}

/**
 * Compute the desired final order of tab IDs.
 * Pinned tabs remain at the beginning unchanged.
 * @param {Array<browser.tabs.Tab>} tabs
 * @returns {Array<browser.tabs.Tab>} ordered tabs as objects
 */
function computeOrder(tabs) {
  const pinned = tabs.filter((t) => t.pinned);
  const unpinned = tabs.filter((t) => !t.pinned);

  const { matchers, rest } = partitionTabs(unpinned);
  matchers.sort(compareByPostcard);

  const orderedUnpinned = [...matchers.map((m) => m.tab), ...rest];
  return [...pinned, ...orderedUnpinned];
}

/**
 * Apply the new order by moving tabs to their target indices.
 * Firefox will shift indices as we move; iterating left-to-right is fine.
 * @param {Array<browser.tabs.Tab>} current
 * @param {Array<browser.tabs.Tab>} desired
 */
async function applyOrder(current, desired) {
  // Build quick maps for comparison
  const currentIds = current.map((t) => t.id);
  const desiredIds = desired.map((t) => t.id);

  // If already ordered, skip operations.
  const same =
    currentIds.length === desiredIds.length &&
    currentIds.every((id, i) => id === desiredIds[i]);
  if (same) {
    if (DEBUG)
      console.info("[PostCrossing Sorter] Tabs already in desired order.");
    return;
  }

  // Move each tab to its target index in sequence.
  for (let i = 0; i < desired.length; i++) {
    const t = desired[i];
    // Skip if a tab became invalid (rare race conditions)
    if (typeof t.id !== "number") continue;
    try {
      await browser.tabs.move(t.id, { index: i });
    } catch (err) {
      // Ignore move failures (tab closed, moved to another window, etc.)
      if (DEBUG)
        console.warn("[PostCrossing Sorter] move failed for tab", t.id, err);
    }
  }
}

/**
 * Sort tabs in the current window.
 */
async function sortTabsInCurrentWindow() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    if (tabs.length === 0) return;

    if (DEBUG) {
      console.log("[DEBUG] All tabs before sorting:");
      tabs.forEach((tab, i) => {
        console.log(
          `  ${i}: "${tab.title}" (id: ${tab.id}, pinned: ${tab.pinned})`,
        );
      });
    }

    const desired = computeOrder(tabs);

    if (DEBUG) {
      console.log("[DEBUG] Desired order:");
      desired.forEach((tab, i) => {
        console.log(`  ${i}: "${tab.title}" (id: ${tab.id})`);
      });
    }

    await applyOrder(tabs, desired);

    if (DEBUG) {
      console.info("[PostCrossing Sorter] Successfully sorted tabs");
    }
  } catch (err) {
    if (DEBUG) console.error("[PostCrossing Sorter] Error sorting tabs:", err);
  }
}

/**
 * Event handlers for Manifest V2
 */

// Note: Browser action click handler removed since we use a popup interface
// The sorting is triggered from popup.js or keyboard commands

// Handle keyboard commands
browser.commands.onCommand.addListener((command) => {
  if (command === "sort-postcrossing-tabs") {
    sortTabsInCurrentWindow().catch((err) => {
      if (DEBUG) console.error("[PostCrossing Sorter] command error", err);
    });
  }
});

// Create context menu on installation/startup
browser.runtime.onInstalled.addListener(() => {
  try {
    browser.contextMenus.create({
      id: "postcrossing-sorter",
      title: "Sort PostCrossing Tabs by Number",
      contexts: ["browser_action", "page", "tab"],
      documentUrlPatterns: ["*://*/*"],
    });

    if (DEBUG) {
      console.info(
        "[PostCrossing Sorter] Extension installed and context menu created",
      );
    }
  } catch (err) {
    // Ignore errors (e.g., if context menu already exists)
    if (DEBUG) {
      console.warn("[PostCrossing Sorter] Context menu creation failed:", err);
    }
  }
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "postcrossing-sorter") {
    sortTabsInCurrentWindow().catch((err) => {
      if (DEBUG) console.error("[PostCrossing Sorter] context menu error", err);
    });
  }
});

// Optional: Handle startup to recreate context menu if needed
browser.runtime.onStartup.addListener(() => {
  try {
    // Clear existing context menus to avoid duplicates
    browser.contextMenus.removeAll();

    browser.contextMenus.create({
      id: "postcrossing-sorter",
      title: "Sort PostCrossing Tabs by Number",
      contexts: ["browser_action", "page", "tab"],
      documentUrlPatterns: ["*://*/*"],
    });

    if (DEBUG) {
      console.info(
        "[PostCrossing Sorter] Extension started and context menu recreated",
      );
    }
  } catch (err) {
    if (DEBUG) {
      console.warn(
        "[PostCrossing Sorter] Startup context menu setup failed:",
        err,
      );
    }
  }
});

if (DEBUG) {
  console.info("[PostCrossing Sorter] Background script loaded");
}
