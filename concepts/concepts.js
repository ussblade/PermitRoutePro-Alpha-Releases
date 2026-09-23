const releaseFallback =
  "https://github.com/ussblade/PermitRoutePro-Alpha-Releases/releases";
const cacheKey = Date.now().toString();
const manifestSources = [
  `https://raw.githubusercontent.com/ussblade/PermitRoutePro-Alpha-Releases/main/latest.json?v=${cacheKey}`,
  `../latest.json?v=${cacheKey}`,
];
const changelogSources = [
  `https://raw.githubusercontent.com/ussblade/PermitRoutePro-Alpha-Releases/main/changelog.json?v=${cacheKey}`,
  `../changelog.json?v=${cacheKey}`,
];
const permitSubmissionUrl =
  "https://us-central1-permit-route-pro-7b671.cloudfunctions.net/stripeApp/permit-submissions";
const permitMaximumFiles = 3;
const permitMaximumFileBytes = 3 * 1024 * 1024;
const permitMaximumTotalBytes = 5 * 1024 * 1024;
const permittedFileExtensions = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function loadJson(sources) {
  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) continue;
      return await response.json();
    } catch (_) {
      // The next source is a local fallback for previews and direct uploads.
    }
  }
  return null;
}

function replaceList(target, notes) {
  target.replaceChildren();
  notes.forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    target.appendChild(item);
  });
}

function applyManifest(manifest) {
  const version = manifest?.latestVersionName || "latest alpha";
  const versionCode = manifest?.latestVersionCode
    ? ` (${manifest.latestVersionCode})`
    : "";
  const downloadUrl = PermitApkDownloads.selectDownload(manifest, null).url;

  document.querySelectorAll("[data-version]").forEach((element) => {
    element.textContent = `${version}${versionCode}`;
  });
  document.querySelectorAll("[data-published]").forEach((element) => {
    element.textContent = formatDate(manifest?.publishedAt);
  });
  document.querySelectorAll("[data-download]").forEach((link) => {
    link.href = downloadUrl;
  });

  // Enable the universal link immediately; device detection is bounded and
  // never delays release notes or leaves download buttons disabled.
  configureDownloads(manifest);

  const note = Array.isArray(manifest?.releaseNotes)
    ? manifest.releaseNotes[0]
    : null;
  document.querySelectorAll("[data-release-note]").forEach((element) => {
    element.textContent = note || "Open the release page for current build notes.";
  });

  const notes = Array.isArray(manifest?.releaseNotes) && manifest.releaseNotes.length
    ? manifest.releaseNotes
    : ["Open the release page for current build notes."];
  document.querySelectorAll("[data-release-list]").forEach((list) => {
    replaceList(list, notes);
  });
}

async function configureDownloads(manifest) {
  const picker = document.querySelector('[data-apk-choice]');
  const container = document.querySelector('[data-download-options]');
  const status = document.querySelector('[data-download-status]');
  const options = PermitApkDownloads.downloads(manifest);
  const universal = options.find((entry) => entry.abi === 'universal');
  document.querySelectorAll('[data-download-universal]').forEach((link) => {
    link.href = universal?.url || releaseFallback;
    const size = universal?.sizeBytes
      ? ` (${(universal.sizeBytes / 1024 / 1024).toFixed(1)} MB)` : '';
    link.textContent = universal
      ? `Download full universal APK${size}` : 'Open all APK releases';
  });
  let manuallySelected = false;

  function select(abi) {
    const selection = PermitApkDownloads.selectDownload(manifest, abi);
    document.querySelectorAll('[data-download]').forEach((link) => {
      link.href = selection.url;
    });
    if (picker) picker.value = selection.abi || '';
    if (status) {
      status.textContent = selection.abi === 'universal'
        ? options.length > 1
          ? 'Universal Android APK selected. Choose a smaller download below if you know your device’s architecture.'
          : 'Universal Android APK selected.'
        : selection.abi
          ? `${selection.label.split(' — ')[0]} Android APK selected.`
          : 'Open the public releases page for the current Android download.';
    }
  }

  if (picker) {
    picker.replaceChildren();
    options.forEach((entry) => {
      const option = document.createElement('option');
      option.value = entry.abi;
      const size = entry.sizeBytes ? ` (${(entry.sizeBytes / 1024 / 1024).toFixed(1)} MB)` : '';
      option.textContent = entry.label + size;
      picker.appendChild(option);
    });
    picker.onchange = () => {
      manuallySelected = true;
      select(picker.value);
    };
  }
  if (container) container.hidden = options.length < 2;
  select(null);
  const abi = await PermitApkDownloads.detectAbi();
  // A late hint must not replace an explicit user choice.
  if (!manuallySelected) select(abi);
}

function renderChangelog(payload) {
  const releases = Array.isArray(payload?.releases) ? payload.releases : [];
  document.querySelectorAll("[data-changelog]").forEach((history) => {
    history.replaceChildren();
    if (!releases.length) {
      const message = document.createElement("p");
      message.textContent = "Release history is temporarily unavailable.";
      history.appendChild(message);
      return;
    }

    releases.forEach((release, index) => {
      const details = document.createElement("details");
      details.className = "history-release";
      details.open = index === 0;

      const summary = document.createElement("summary");
      const version = document.createElement("span");
      version.textContent = release.version || "Unknown version";
      summary.appendChild(version);

      if (release.date) {
        const date = document.createElement("span");
        date.className = "history-release-date";
        date.textContent = release.date;
        summary.appendChild(date);
      }

      const notes = document.createElement("ul");
      notes.className = "history-release-notes";
      const releaseNotes = Array.isArray(release.notes) && release.notes.length
        ? release.notes
        : ["No release notes were provided."];
      releaseNotes.forEach((note) => {
        const item = document.createElement("li");
        item.textContent = note;
        notes.appendChild(item);
      });

      details.append(summary, notes);
      history.appendChild(details);
    });
  });
}

loadJson(manifestSources).then(applyManifest);
loadJson(changelogSources).then(renderChangelog);

document.querySelectorAll("[data-menu-button]").forEach((button) => {
  const menu = document.getElementById(button.getAttribute("aria-controls"));
  if (!menu) return;
  const closeMenu = () => {
    button.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  };
  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    menu.hidden = isOpen;
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
      button.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!menu.hidden && !button.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });
});

function validatePermitFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) throw new Error("Choose at least one permit file.");
  if (files.length > permitMaximumFiles) {
    throw new Error(`Choose no more than ${permitMaximumFiles} files.`);
  }
  let totalBytes = 0;
  files.forEach((file) => {
    const extension = file.name.includes(".")
      ? file.name.split(".").pop().toLowerCase()
      : "";
    if (!permittedFileExtensions.has(extension)) {
      throw new Error(`${file.name} must be a PDF, JPG, PNG, or WebP file.`);
    }
    if (!file.size) throw new Error(`${file.name} is empty.`);
    if (file.size > permitMaximumFileBytes) {
      throw new Error(`${file.name} is larger than 3 MB.`);
    }
    totalBytes += file.size;
  });
  if (totalBytes > permitMaximumTotalBytes) {
    throw new Error("The selected files are larger than 5 MB combined.");
  }
  return files;
}

async function fileToBase64(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  }
  return btoa(binary);
}

function setPermitStatus(status, message, state = "") {
  status.textContent = message;
  if (state) status.dataset.state = state;
  else delete status.dataset.state;
}

document.querySelectorAll("[data-permit-form]").forEach((form) => {
  const fileInput = form.querySelector("[data-permit-files]");
  const summary = form.querySelector("[data-permit-file-summary]");
  const status = form.querySelector("[data-permit-status]");
  const submitButton = form.querySelector("button[type='submit']");

  fileInput.addEventListener("change", () => {
    try {
      const files = validatePermitFiles(fileInput.files);
      const totalMegabytes = files.reduce((total, file) => total + file.size, 0) /
        (1024 * 1024);
      summary.textContent = `${files.length} file${files.length === 1 ? "" : "s"} selected · ${totalMegabytes.toFixed(1)} MB total`;
      setPermitStatus(status, "");
    } catch (error) {
      summary.textContent = "No valid files selected.";
      setPermitStatus(status, error.message, "error");
      fileInput.value = "";
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    let files;
    try {
      files = validatePermitFiles(fileInput.files);
    } catch (error) {
      setPermitStatus(status, error.message, "error");
      return;
    }

    submitButton.disabled = true;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Sending permit…";
    setPermitStatus(status, "Preparing your files securely…");

    try {
      const attachments = await Promise.all(files.map(async (file) => ({
        filename: file.name,
        contentBase64: await fileToBase64(file),
      })));
      setPermitStatus(status, "Sending your permit…");
      const response = await fetch(permitSubmissionUrl, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.elements.name.value,
          email: form.elements.email.value,
          state: form.elements.state.value,
          notes: form.elements.notes.value,
          permissionConfirmed: form.elements.permissionConfirmed.checked,
          attachments,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "We could not send your permit right now. Please try again.");
      }
      if (result.ok !== true || typeof result.message !== "string" || !result.message.trim()) {
        throw new Error("We could not confirm your permit was sent. Your files are still selected. Please try again or email permitroutepro@gmail.com directly.");
      }
      form.reset();
      summary.textContent = "No files selected.";
      setPermitStatus(
        status,
        result.message,
        "success",
      );
    } catch (error) {
      setPermitStatus(status, error.message, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
