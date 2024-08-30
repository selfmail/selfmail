"use client"
import { motion, MotionProps } from "framer-motion";

const FadeIn: React.FC<MotionProps & React.HTMLAttributes<HTMLDivElement> & { variant?: number }> = ({ children, variant = 1, ...props }) => {
    return (
        <motion.div initial={{ opacity: 0, filter: "blur(2px)" }} animate={{
            opacity: 1, filter: "blur(0px)"
        }} transition={{
            delay: variant * 0.2,
            duration: 0.1,
        }} exit={{ opacity: 0 }} {...props}>
            {children}
        </motion.div>
    )
}

export default FadeIn;