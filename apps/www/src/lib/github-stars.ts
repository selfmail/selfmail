const CACHE_TTL_MS = 60 * 60 * 1000;
const RETRY_DELAY_MS = 5 * 60 * 1000;

let stars: number | null = null;
let refreshAfter = 0;
let pending: Promise<number | null> | undefined;

async function refreshStars(): Promise<number | null> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/selfmail/selfmail",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "selfmail-www",
        },
        signal: AbortSignal.timeout(2000),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub returned ${response.status}`);
    }

    const data: unknown = await response.json();
    if (
      typeof data !== "object" ||
      data === null ||
      !("stargazers_count" in data) ||
      typeof data.stargazers_count !== "number" ||
      !Number.isSafeInteger(data.stargazers_count) ||
      data.stargazers_count < 0
    ) {
      throw new Error("Invalid GitHub star count");
    }

    stars = data.stargazers_count;
    refreshAfter = Date.now() + CACHE_TTL_MS;
  } catch {
    // Retain the last count and back off even when the first request fails.
    refreshAfter = Date.now() + RETRY_DELAY_MS;
  } finally {
    pending = undefined;
  }

  return stars;
}

export function getGitHubStars(): Promise<number | null> {
  if (Date.now() < refreshAfter) {
    return Promise.resolve(stars);
  }

  pending ??= refreshStars();
  return pending;
}
