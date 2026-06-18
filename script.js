const manifestSources = [
  "latest.json",
  "https://raw.githubusercontent.com/ussblade/PermitRoutePro-Alpha-Releases/main/latest.json",
];

const fallbackApkUrl =
  "https://github.com/ussblade/PermitRoutePro-Alpha-Releases/releases";

const elements = {
  heroDownload: document.querySelector("#hero-download"),
  downloadLink: document.querySelector("#download-link"),
  downloadTitle: document.querySelector("#download-title"),
  downloadStatus: document.querySelector("#download-status"),
  latestVersion: document.querySelector("#latest-version"),
  publishedAt: document.querySelector("#published-at"),
  releaseNotes: document.querySelector("#release-notes"),
};

function formatDate(value) {
  if (!value) return "Not published";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function enableDownload(url) {
  elements.downloadLink.href = url;
  elements.downloadLink.classList.remove("disabled");
  elements.downloadLink.removeAttribute("aria-disabled");
  elements.heroDownload.href = url;
}

function renderManifest(manifest) {
  const versionName = manifest.latestVersionName || "Unknown";
  const versionCode = manifest.latestVersionCode
    ? `+${manifest.latestVersionCode}`
    : "";

  elements.latestVersion.textContent = `${versionName}${versionCode}`;
  elements.publishedAt.textContent = formatDate(manifest.publishedAt);
  elements.downloadTitle.textContent = `Permit Route Pro ${versionName}`;
  elements.downloadStatus.textContent =
    "Use this APK for the current alpha release.";

  if (manifest.apkUrl) {
    enableDownload(manifest.apkUrl);
  }

  elements.releaseNotes.replaceChildren();
  for (const note of manifest.releaseNotes || []) {
    const item = document.createElement("li");
    item.textContent = note;
    elements.releaseNotes.appendChild(item);
  }
}

async function fetchLatestManifest() {
  let lastError;
  for (const source of manifestSources) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Manifest request failed: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

fetchLatestManifest()
  .then(renderManifest)
  .catch(() => {
    elements.latestVersion.textContent = "Unavailable";
    elements.publishedAt.textContent = "Unavailable";
    elements.downloadStatus.textContent =
      "The latest manifest could not be loaded. Open the public releases page instead.";
    enableDownload(fallbackApkUrl);
    elements.downloadLink.textContent = "Open releases";
  });
