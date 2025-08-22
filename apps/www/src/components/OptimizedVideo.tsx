import { useEffect, useRef, useState } from "react";

interface OptimizedVideoProps {
	webmSrc: string;
	mp4Src: string;
	className?: string;
	poster?: string;
}

export default function OptimizedVideo({
	webmSrc,
	mp4Src,
	className = "",
	poster,
}: OptimizedVideoProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [hasLoaded, setHasLoaded] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry?.isIntersecting) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.1 },
		);

		if (videoRef.current) {
			observer.observe(videoRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const handleCanPlay = () => {
		setHasLoaded(true);
	};

	return (
		<div className="relative">
			<video
				ref={videoRef}
				autoPlay={isVisible}
				muted
				loop
				controls={false}
				playsInline
				className={`h-auto w-full ${className}`}
				preload={isVisible ? "metadata" : "none"}
				poster={poster}
				onCanPlay={handleCanPlay}
			>
				{isVisible && (
					<>
						<source src={webmSrc} type="video/webm" />
						<source src={mp4Src} type="video/mp4" />
					</>
				)}
				<p>Your browser doesn't support HTML5 video.</p>
			</video>

			{!hasLoaded && isVisible && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
					<div className="text-gray-500">Loading video...</div>
				</div>
			)}
		</div>
	);
}
