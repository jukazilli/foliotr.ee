const usernameForm = document.querySelector("#username-form");
const usernameInput = document.querySelector("#username-input");
const previewUrl = document.querySelector("#preview-url");
const previewName = document.querySelector("#preview-name");
const autoActivateBlocks = document.querySelectorAll("[data-auto-activate]");
const topbar = document.querySelector("[data-topbar]");
const themeToggle = document.querySelector("#theme-toggle");
const loginForm = document.querySelector(".login-form");
const passwordRecoveryForm = document.querySelector(".password-recovery-form");
const THEME_STORAGE_KEY = "foliotree-theme";

function normalizeUsername(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 24);
}

function displayNameFromUsername(username) {
  if (!username) return "Ana";

  return username
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function syncPreview() {
  if (!usernameInput) return;

  const normalizedUsername = normalizeUsername(usernameInput.value);
  const username = normalizedUsername || "ana";
  usernameInput.value = normalizedUsername;

  if (previewUrl) {
    previewUrl.textContent = `linkfolio.co/@${username}`;
  }

  if (previewName) {
    previewName.textContent = displayNameFromUsername(username);
  }
}

function setupAutoActivateBlocks() {
  if (autoActivateBlocks.length === 0) return;

  const pendingBlocks = new Set(autoActivateBlocks);

  function isBlockInView(block) {
    const rect = block.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return rect.top <= viewportHeight * 0.78 && rect.bottom >= viewportHeight * 0.22;
  }

  function checkBlocks() {
    pendingBlocks.forEach((block) => {
      if (!isBlockInView(block)) return;

      block.classList.add("is-activated");
      pendingBlocks.delete(block);
    });

    if (pendingBlocks.size === 0) {
      window.removeEventListener("scroll", queueCheck);
      window.removeEventListener("resize", queueCheck);
    }
  }

  function queueCheck() {
    window.requestAnimationFrame(checkBlocks);
  }

  window.addEventListener("scroll", queueCheck, { passive: true });
  window.addEventListener("resize", queueCheck);
  checkBlocks();
}

function setupTopbarVisibility() {
  if (!topbar) return;

  let ticking = false;

  function updateTopbar() {
    topbar.classList.toggle("is-hidden", window.scrollY > 12);
    ticking = false;
  }

  function queueUpdate() {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(updateTopbar);
  }

  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", queueUpdate);
  updateTopbar();
}

function getStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures and keep the in-memory theme only.
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "noir" ? "noir" : "default";

  if (nextTheme === "noir") {
    document.body.dataset.theme = "noir";
  } else {
    delete document.body.dataset.theme;
  }

  if (themeToggle) {
    const isNoir = nextTheme === "noir";

    themeToggle.setAttribute("aria-pressed", String(isNoir));
    const lightLabel = isNoir ? "Acender a luz" : "Apagar a luz";
    themeToggle.setAttribute("aria-label", lightLabel);
    themeToggle.setAttribute("title", lightLabel);
  }

  storeTheme(nextTheme);
}

function setupThemeToggle() {
  if (!themeToggle) return;

  const storedTheme = getStoredTheme();
  applyTheme(storedTheme === "noir" ? "noir" : "default");

  themeToggle.addEventListener("click", () => {
    const isNoir = document.body.dataset.theme === "noir";
    applyTheme(isNoir ? "default" : "noir");
  });
}

if (usernameInput) {
  usernameInput.addEventListener("input", syncPreview);
}

if (usernameForm) {
  usernameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    syncPreview();
    usernameForm.classList.add("is-submitted");
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

if (passwordRecoveryForm) {
  passwordRecoveryForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

syncPreview();
setupAutoActivateBlocks();
setupTopbarVisibility();
setupThemeToggle();
