const cacheBust = Date.now().toString();
const manifestSources = [
  `latest.json?v=${cacheBust}`,
  `https://raw.githubusercontent.com/ussblade/PermitRoutePro-Alpha-Releases/main/latest.json?v=${cacheBust}`,
];
const changelogSources = [
  `changelog.json?v=${cacheBust}`,
  `https://raw.githubusercontent.com/ussblade/PermitRoutePro-Alpha-Releases/main/changelog.json?v=${cacheBust}`,
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
  changesTitle: document.querySelector("#changes-title"),
  changesSummary: document.querySelector("#changes-summary"),
  changesList: document.querySelector("#changes-list"),
  changelogHistory: document.querySelector("#changelog-history"),
  navMenu: document.querySelector("#nav-menu"),
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

function renderChangelogHistory(payload) {
  const releases = Array.isArray(payload.releases) ? payload.releases : [];
  if (releases.length === 0) {
    throw new Error("The changelog contains no releases.");
  }

  elements.changelogHistory.replaceChildren();
  releases.forEach((release, index) => {
    const details = document.createElement("details");
    details.className = "changelog-version";
    details.open = index === 0;

    const summary = document.createElement("summary");
    const version = document.createElement("span");
    version.className = "changelog-version-name";
    version.textContent = release.version || "Unknown version";
    summary.appendChild(version);

    if (release.date) {
      const date = document.createElement("span");
      date.className = "changelog-version-date";
      date.textContent = release.date;
      summary.appendChild(date);
    }
    details.appendChild(summary);

    const notes = Array.isArray(release.notes) ? release.notes : [];
    const list = document.createElement("ul");
    list.className = "changelog-version-notes";
    for (const note of notes) {
      const item = document.createElement("li");
      item.textContent = note;
      list.appendChild(item);
    }
    details.appendChild(list);
    elements.changelogHistory.appendChild(details);
  });
}

function enableDownload(url) {
  elements.downloadLink.href = url;
  elements.downloadLink.classList.remove("disabled");
  elements.downloadLink.removeAttribute("aria-disabled");
  elements.heroDownload.href = url;
}

function renderReleaseNotes(target, notes) {
  target.replaceChildren();
  for (const note of notes) {
    const item = document.createElement("li");
    item.textContent = note;
    target.appendChild(item);
  }
}

for (const link of elements.navMenu.querySelectorAll("a")) {
  link.addEventListener("click", () => {
    elements.navMenu.removeAttribute("open");
  });
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
  elements.changesTitle.textContent = `What's new in ${versionName}`;
  elements.changesSummary.textContent =
    "These notes are updated automatically whenever a new public build is published.";

  if (manifest.apkUrl) {
    enableDownload(manifest.apkUrl);
  }

  const notes =
    Array.isArray(manifest.releaseNotes) && manifest.releaseNotes.length > 0
      ? manifest.releaseNotes
      : ["Release notes are not available for this build."];
  renderReleaseNotes(elements.releaseNotes, notes);
  renderReleaseNotes(elements.changesList, notes);
}

async function fetchFromSources(sources) {
  let lastError;
  for (const source of sources) {
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

const fetchLatestManifest = () => fetchFromSources(manifestSources);
const fetchChangelog = () => fetchFromSources(changelogSources);

fetchLatestManifest()
  .then(renderManifest)
  .catch(() => {
    elements.latestVersion.textContent = "Unavailable";
    elements.publishedAt.textContent = "Unavailable";
    elements.downloadStatus.textContent =
      "The latest manifest could not be loaded. Open the public releases page instead.";
    enableDownload(fallbackApkUrl);
    elements.downloadLink.textContent = "Open releases";
    elements.changesTitle.textContent = "Latest release notes unavailable";
    elements.changesSummary.textContent =
      "Open the public releases page for the newest build and its changelog.";
    renderReleaseNotes(elements.changesList, [
      "The release manifest could not be loaded.",
    ]);
  });

fetchChangelog()
  .then(renderChangelogHistory)
  .catch(() => {
    const message = document.createElement("p");
    message.className = "changelog-loading";
    message.textContent =
      "The full changelog could not be loaded. Open the public release repository for release history.";
    elements.changelogHistory.replaceChildren(message);
  });
