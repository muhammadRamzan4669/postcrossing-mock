/**
 * PostCrossing Tab Sorter (Background Service Worker)
 * ---------------------------------------------------
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
 *   - Toolbar button click
 *   - Keyboard command "sort-postcrossing-tabs" (defined in manifest)
 */

const DEBUG = false;

// Match "CC-12345" where CC is two letters, number is 1+ digits.
// Case-insensitive by uppercasing titles before matching.
const CODE_RE = /(^|[^A-Z])([A-Z]{2})-(\d+)\b/;

/**
 * Extract postcard info from a tab title.
 * @param {chrome.tabs.Tab} tab
 * @returns {{country: string, num: number} | null}
 */
function extractFromTab(tab) {
  const title = String(tab.title || '').toUpperCase();
  const m = title.match(CODE_RE);
  if (!m) return null;
  const country = m[2];
  const num = Number.parseInt(m[3], 10);
  if (!Number.isFinite(num)) return null;
  return { country, num };
}

/**
 * Stable partition of tabs into matchers and non-matchers, preserving original order for non-matchers.
 * @param {Array<chrome.tabs.Tab>} tabs
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
 * @param {Array<chrome.tabs.Tab>} tabs
 * @returns {Array<chrome.tabs.Tab>} ordered tabs as objects
 */
function computeOrder(tabs) {
  const pinned = tabs.filter(t => t.pinned);
  const unpinned = tabs.filter(t => !t.pinned);

  const { matchers, rest } = partitionTabs(unpinned);
  matchers.sort(compareByPostcard);

  const orderedUnpinned = [...matchers.map(m => m.tab), ...rest];
  return [...pinned, ...orderedUnpinned];
}

/**
 * Apply the new order by moving tabs to their target indices.
 * Firefox/Chromium will shift indices as we move; iterating left-to-right is fine.
 * @param {Array<chrome.tabs.Tab>} current
 * @param {Array<chrome.tabs.Tab>} desired
 */
async function applyOrder(current, desired) {
  // Build quick maps for comparison
  const currentIds = current.map(t => t.id);
  const desiredIds = desired.map(t => t.id);

  // If already ordered, skip operations.
  const same =
    currentIds.length === desiredIds.length &&
    currentIds.every((id, i) => id === desiredIds[i]);
  if (same) {
    if (DEBUG) console.info('[PostCrossing Sorter] Tabs already in desired order.');
    return;
  }

  // Move each tab to its target index in sequence.
  for (let i = 0; i < desired.length; i++) {
    const t = desired[i];
    // Skip if a tab became invalid (rare race conditions)
    if (typeof t.id !== 'number') continue;
    try {
      await chrome.tabs.move(t.id, { index: i });
    } catch (err) {
      // Ignore move failures (tab closed, moved to another window, etc.)
      if (DEBUG) console.warn('[PostCrossing Sorter] move failed for tab', t.id, err);
    }
  }
}

/**
 * Sort tabs in the current window.
 */
async function sortTabsInCurrentWindow() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (tabs.length === 0) return;

  const desired = computeOrder(tabs);
  await applyOrder(tabs, desired);
}

/**
 * Event wiring
 */
chrome.action.onClicked.addListener(() => {
  sortTabsInCurrentWindow().catch(err => {
    if (DEBUG) console.error('[PostCrossing Sorter] action error', err);
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'sort-postcrossing-tabs') {
    sortTabsInCurrentWindow().catch(err => {
      if (DEBUG) console.error('[PostCrossing Sorter] command error', err);
    });
  }
});

// Optional: context menu for manual trigger
chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: 'postcrossing-sorter',
      title: 'Sort PostCrossing Tabs by Number',
      contexts: ['action', 'page']
    });
  } catch {
    // ignore duplicate on re-install in development
  }
});

chrome.contextMenus?.onClicked?.addListener((info) => {
  if (info.menuItemId === 'postcrossing-sorter') {
    sortTabsInCurrentWindow().catch(err => {
      if (DEBUG) console.error('[PostCrossing Sorter] context menu error', err);
    });
  }
});
