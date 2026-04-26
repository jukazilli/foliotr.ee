const usernameForm = document.querySelector("#username-form");
const usernameInput = document.querySelector("#username-input");
const previewUrl = document.querySelector("#preview-url");
const previewName = document.querySelector("#preview-name");
const autoActivateBlocks = document.querySelectorAll("[data-auto-activate]");
const topbar = document.querySelector("[data-topbar]");
const themeToggle = document.querySelector("#theme-toggle");
const loginForm = document.querySelector(".login-form");
const passwordRecoveryForm = document.querySelector(".password-recovery-form");
const signupForm = document.querySelector("#signup-form");
const signupUsernameInput = document.querySelector("#signup-username");
const signupSteps = document.querySelectorAll("[data-signup-step]");
const signupStepDots = document.querySelectorAll("[data-step-dot]");
const signupBackButton = document.querySelector("[data-signup-back]");
const signupNextButton = document.querySelector("[data-signup-next]");
const signupSuccess = document.querySelector(".signup-success");
const vocationOpenButton = document.querySelector("[data-vocation-open]");
const vocationModal = document.querySelector("[data-vocation-modal]");
const vocationCloseButtons = document.querySelectorAll("[data-vocation-close]");
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

function getSafeRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return "";
  }

  return redirect;
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
    const username = normalizeUsername(usernameInput.value);
    const search = username ? `?username=${encodeURIComponent(username)}` : "";
    window.location.href = `/signup${search}`;
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const redirectTarget = getSafeRedirectTarget();
    if (redirectTarget) {
      // TODO React/TypeScript + backend:
      // substituir este redirecionamento visual por autenticação real,
      // criação de sessão segura e validação do redirect no servidor.
      window.location.href = redirectTarget;
    }
  });
}

if (passwordRecoveryForm) {
  passwordRecoveryForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

function setupSignupFlow() {
  if (!signupForm || signupSteps.length === 0) return;

  let currentStep = 1;
  const totalSteps = signupSteps.length;

  const params = new URLSearchParams(window.location.search);
  const usernameFromHome = normalizeUsername(params.get("username") || "");

  if (signupUsernameInput && usernameFromHome) {
    signupUsernameInput.value = usernameFromHome;
  }

  function getCurrentStepFields() {
    const activeStep = signupForm.querySelector(`[data-signup-step="${currentStep}"]`);
    if (!activeStep) return [];

    return Array.from(activeStep.querySelectorAll("input, select"));
  }

  function renderStep() {
    signupSteps.forEach((step) => {
      const isActive = Number(step.dataset.signupStep) === currentStep;
      step.classList.toggle("is-active", isActive);

      step.querySelectorAll("input, select").forEach((field) => {
        field.disabled = !isActive;
      });
    });

    signupStepDots.forEach((dot) => {
      const dotStep = Number(dot.dataset.stepDot);
      dot.classList.toggle("is-active", dotStep === currentStep);
      dot.classList.toggle("is-complete", dotStep < currentStep);
    });

    if (signupBackButton) {
      signupBackButton.disabled = currentStep === 1;
    }

    if (signupNextButton) {
      signupNextButton.textContent = currentStep === totalSteps ? "Finalizar" : "Avançar";
    }
  }

  function validateCurrentStep() {
    const fields = getCurrentStepFields();

    return fields.every((field) => {
      if (field === signupUsernameInput) {
        field.value = normalizeUsername(field.value);
      }

      return field.reportValidity();
    });
  }

  if (signupUsernameInput) {
    signupUsernameInput.addEventListener("input", () => {
      signupUsernameInput.value = normalizeUsername(signupUsernameInput.value);
    });
  }

  if (signupBackButton) {
    signupBackButton.addEventListener("click", () => {
      currentStep = Math.max(1, currentStep - 1);
      renderStep();
    });
  }

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateCurrentStep()) return;

    if (currentStep < totalSteps) {
      currentStep += 1;
      renderStep();
      return;
    }

    const redirectTarget = getSafeRedirectTarget();

    if (redirectTarget) {
      // TODO React/TypeScript + backend:
      // após criar a conta de verdade, autenticar o usuário e redirecionar
      // para a rota protegida do teste usando sessão/token válido.
      window.location.href = redirectTarget;
      return;
    }

    signupForm.classList.add("is-complete");
    signupSteps.forEach((step) => {
      step.classList.remove("is-active");
      step.setAttribute("hidden", "");
    });
    signupStepDots.forEach((dot) => dot.classList.add("is-complete"));

    if (signupBackButton) signupBackButton.hidden = true;
    if (signupNextButton) signupNextButton.hidden = true;
    const signupActions = signupForm.querySelector(".signup-actions");
    if (signupActions) signupActions.hidden = true;
    if (signupSuccess) signupSuccess.hidden = false;
  });

  renderStep();
}

function setupVocationModal() {
  if (!vocationOpenButton || !vocationModal) return;

  function openModal() {
    vocationModal.hidden = false;
    document.body.classList.add("has-open-modal");

    const firstAction = vocationModal.querySelector("a, button");
    if (firstAction) firstAction.focus();
  }

  function closeModal() {
    vocationModal.hidden = true;
    document.body.classList.remove("has-open-modal");
    vocationOpenButton.focus();
  }

  vocationOpenButton.addEventListener("click", openModal);

  vocationCloseButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || vocationModal.hidden) return;
    closeModal();
  });
}

syncPreview();
setupAutoActivateBlocks();
setupTopbarVisibility();
setupThemeToggle();
setupSignupFlow();
setupVocationModal();
