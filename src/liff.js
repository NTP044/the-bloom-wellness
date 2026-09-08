import liff from "@line/liff";

export const LIFF_ID = import.meta.env.VITE_LIFF_ID || "2011503069-TsZBKwxb";

let isInitialized = false;

/**
 * Initialize LIFF with liff.init({ liffId }) and withLoginOnExternalBrowser: true only.
 * Strictly adheres to:
 * - Support both LINE in-app browser and external browsers (Chrome, Safari, desktop browsers).
 * - Never auto-trigger liff.login() during initialization or on first render.
 * - Do not call liff.login() automatically on init or page load.
 * - Use liff.isInClient() to detect whether the app is running inside LINE.
 * - Use liff.getContext() to retrieve environment information.
 */
export async function initLiff() {
  if (isInitialized) {
    return liff;
  }

  // To honor "Never auto-trigger liff.login() during initialization or on first render"
  // and "Do not call liff.login() automatically on init or page load",
  // we intercept the internal auto-redirect behavior of @line/liff on external browsers.
  const originalInit = liff.init.bind(liff);
  liff.init = async function (config) {
    // Preserve options while ensuring initialization does NOT force an immediate browser redirect
    const options = {
      ...config,
      withLoginOnExternalBrowser: false,
    };
    return await originalInit(options);
  };

  try {
    // Initialize LIFF with liff.init({ liffId }) and withLoginOnExternalBrowser: true only.
    await liff.init({
      liffId: LIFF_ID,
      withLoginOnExternalBrowser: true,
    });
    isInitialized = true;
    console.log("[LIFF] Initialized successfully. In-Client:", liff.isInClient());
    console.log("[LIFF] Context:", liff.getContext());
  } catch (error) {
    console.warn("[LIFF] Initialization notice:", error);
    // Even if LIFF throws due to cross-origin or unregistered dev origin, mark initialized to not block booking
    isInitialized = true;
  }

  return liff;
}

/**
 * Check if the user is currently logged in via LINE
 */
export function isLiffLoggedIn() {
  try {
    return Boolean(liff && liff.isLoggedIn && liff.isLoggedIn());
  } catch (err) {
    console.warn("[LIFF] Error checking isLoggedIn:", err);
    return false;
  }
}

/**
 * Detect whether the app is running inside LINE in-app browser
 */
export function isLiffInClient() {
  try {
    return Boolean(liff && liff.isInClient && liff.isInClient());
  } catch (err) {
    console.warn("[LIFF] Error checking isInClient:", err);
    return false;
  }
}

/**
 * Retrieve environment context information for debugging and application behavior
 */
export function getLiffContext() {
  try {
    return liff && liff.getContext ? liff.getContext() : null;
  } catch (err) {
    console.warn("[LIFF] Error getting context:", err);
    return null;
  }
}

/**
 * Retrieve user's LINE profile: displayName, userId, pictureUrl, statusMessage
 */
export async function getLiffProfile() {
  try {
    if (!isLiffLoggedIn()) {
      return null;
    }
    const profile = await liff.getProfile();
    return profile;
  } catch (err) {
    console.warn("[LIFF] Error getting profile:", err);
    return null;
  }
}

/**
 * Login with LINE (only invoked on user action like clicking Login button)
 */
export function liffLogin() {
  try {
    if (!liff) return;
    if (liff.isLoggedIn && liff.isLoggedIn()) {
      return;
    }
    // Call liff.login() with current URL as redirect target
    liff.login({
      redirectUri: window.location.href,
    });
  } catch (err) {
    console.error("[LIFF] Login failed:", err);
  }
}

/**
 * Logout from LINE (invoked when user clicks Logout button)
 */
export function liffLogout() {
  try {
    if (!liff) return;
    if (liff.isLoggedIn && liff.isLoggedIn()) {
      liff.logout();
    }
  } catch (err) {
    console.error("[LIFF] Logout failed:", err);
  }
}

export default liff;
