const browsers = [
	[/Edg(?:e|A|iOS)?\//, "Microsoft Edge"],
	[/OPR\/|Opera\//, "Opera"],
	[/SamsungBrowser\//, "Samsung Internet"],
	[/Firefox\/|FxiOS\//, "Firefox"],
	[/Chrome\/|CriOS\//, "Chrome"],
	[/Version\/.*Safari\//, "Safari"],
] as const;

const platforms = [
	[/iPad/, "iPad"],
	[/iPhone|iPod/, "iPhone"],
	[/Android/, "Android"],
	[/Windows/, "Windows"],
	[/CrOS/, "ChromeOS"],
	[/Macintosh|Mac OS X/, "macOS"],
	[/Linux/, "Linux"],
] as const;

export function getSessionDevice(userAgent: string | null) {
	if (!userAgent) {
		return null;
	}

	const browser = browsers.find(([pattern]) => pattern.test(userAgent))?.[1];
	const platform = platforms.find(([pattern]) => pattern.test(userAgent))?.[1];

	return browser ? [browser, platform].filter(Boolean).join(" · ") : userAgent;
}
