"use client"
import { MotionConfig, motion } from "framer-motion"

export default function RegisterImage() {
    return (
        <MotionConfig reducedMotion="always" transition={{duration: 0.3, type: "spring"}}>
            <div className="bg-[#fd9d9a] hidden lg:flex lg:w-[50%] m-2 rounded-xl justify-end items-end">
                <motion.h2 initial={{opacity: 0}} animate={{opacity: 1}} className="text-5xl p-3 font-semibold">The better inbox - <i>selfmail</i></motion.h2>
            </div>
        </MotionConfig>
    )
}