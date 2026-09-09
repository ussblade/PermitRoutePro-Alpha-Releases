// Shared manifest contract with mobile/lib/models/update_manifest.dart.
// Keep apkUrl universal so old apps and browsers retain a usable download.
(function (root) {
  const releaseFallback =
    'https://github.com/ussblade/PermitRoutePro-Alpha-Releases/releases';
  const labels = {
    'arm64-v8a': 'ARM64 — most modern Android phones',
    'armeabi-v7a': 'ARM32 — older 32-bit Android devices',
    'x86_64': 'x86_64 — compatible Intel/AMD Android devices',
  };

  function trustedApkUrl(value) {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'github.com' &&
        !url.username && !url.password && !url.port &&
        url.pathname.startsWith('/ussblade/PermitRoutePro-Alpha-Releases/releases/download/') &&
        url.pathname.endsWith('.apk') ? url.href : null;
    } catch (_) {
      return null;
    }
  }

  function downloads(manifest) {
    const result = [];
    const universalUrl = trustedApkUrl(manifest?.apkUrl);
    if (universalUrl) {
      const size = Number(manifest?.apkSizeBytes);
      result.push({ abi: 'universal', label: 'Universal — all supported Android architectures', url: universalUrl,
        ...(Number.isSafeInteger(size) && size > 0 ? { sizeBytes: size } : {}) });
    }
    for (const [abi, label] of Object.entries(labels)) {
      const entry = manifest?.apks?.[abi];
      const url = trustedApkUrl(entry?.apkUrl);
      if (!url || typeof entry?.apkSha256 !== 'string' ||
          !/^[a-f0-9]{64}$/i.test(entry.apkSha256.trim()) ||
          !Number.isSafeInteger(Number(entry.apkSizeBytes)) || Number(entry.apkSizeBytes) <= 0) continue;
      result.push({ abi, label, url, sizeBytes: Number(entry.apkSizeBytes) });
    }
    return result;
  }

  function abiFromHints(hints) {
    // A desktop may be downloading for a different device. Never select an
    // Android APK using a desktop's CPU or guess from phone model/Android age.
    if (hints?.platform !== 'Android') return null;
    if (hints.architecture === 'arm' && hints.bitness === '64') return 'arm64-v8a';
    if (hints.architecture === 'arm' && hints.bitness === '32') return 'armeabi-v7a';
    if (hints.architecture === 'x86' && hints.bitness === '64') return 'x86_64';
    return null;
  }

  async function detectAbi(navigatorObject = root.navigator, timeoutMs = 1000) {
    let timer;
    try {
      const data = navigatorObject?.userAgentData;
      if (data?.platform !== 'Android' || typeof data.getHighEntropyValues !== 'function') return null;
      const hints = await Promise.race([
        data.getHighEntropyValues(['architecture', 'bitness', 'platform']),
        new Promise((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs); }),
      ]);
      return abiFromHints(hints);
    } catch (_) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  function selectDownload(manifest, abi) {
    const options = downloads(manifest);
    return options.find((entry) => entry.abi === abi) ||
      options.find((entry) => entry.abi === 'universal') ||
      { abi: null, label: 'Public releases', url: releaseFallback };
  }

  root.PermitApkDownloads = { downloads, detectAbi, selectDownload };
})(globalThis);
