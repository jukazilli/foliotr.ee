const usernameForm = document.querySelector("#username-form");
const usernameInput = document.querySelector("#username-input");
const previewUrl = document.querySelector("#preview-url");
const previewName = document.querySelector("#preview-name");

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
  const username = normalizeUsername(usernameInput.value) || "ana";
  usernameInput.value = username;
  previewUrl.textContent = `linkfolio.co/@${username}`;
  previewName.textContent = displayNameFromUsername(username);
}

usernameInput.addEventListener("input", syncPreview);

usernameForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncPreview();
  usernameForm.classList.add("is-submitted");
});

syncPreview();
