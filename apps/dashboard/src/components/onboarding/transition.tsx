import type { CSSProperties, ReactNode } from "react";
import type { OnboardingPage } from "./types";

interface TransitionStyle
	extends CSSProperties,
		Record<`--${string}`, string> {}

interface OnboardingPageSlideProps {
	children: ReactNode;
	currentPage: OnboardingPage;
	page: OnboardingPage;
}

export function OnboardingPageSlide({
	children,
	currentPage,
	page,
}: OnboardingPageSlideProps) {
	const isActive = currentPage === page;

	return (
		<section
			aria-hidden={!isActive}
			className="t-page"
			data-active={isActive}
			data-page-id={page}
			style={getPageStyle(page, currentPage)}
		>
			{children}
		</section>
	);
}

const getPageStyle = (
	page: OnboardingPage,
	currentPage: OnboardingPage,
): TransitionStyle => ({
	"--t-page-from-x":
		page < currentPage
			? "calc(var(--page-slide-distance) * -1)"
			: "var(--page-slide-distance)",
});
