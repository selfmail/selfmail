import { useViewportSize } from "@mantine/hooks";
import { motion } from "motion/react";

export default function EmailViewer({ open }: { open: boolean }) {
	const { width } = useViewportSize();
	return (
		<motion.div
			initial={{
				opacity: 0,
				scale: 0.95,
				x: width,
			}}
			animate={{
				opacity: open ? 1 : 0,
				scale: open ? 1 : 0.95,
				x: open ? 0 : width,
			}}

			className="flex fixed inset-0 w-[50%] flex-col rounded-lg bg-neutral-50 p-4 shadow-md"
		>
			<h2>View Email</h2>
		</motion.div>
	);
}
