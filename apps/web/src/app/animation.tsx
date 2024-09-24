"use client"

import { useMotionValueEvent, useScroll } from "framer-motion";
import { Inbox, ToyBrick, Users } from "lucide-react";
import type React from "react";
import { useState } from "react";

type AnimationWithSign = {
    x: {
        sign: string,
        value: number
    },
    y: {
        sign: string,
        value: number
    },
    scale: number,
    rotate: {
        sign: string,
        value: number
    }
}

type Animation = {
    x: number,
    y: number,
    scale: number,
    rotate: number
}

const Motion: React.FC<{
    children: React.ReactNode,
    initial: AnimationWithSign,
    animate: Animation,
    height: number

} & React.HTMLAttributes<HTMLDivElement>> = ({ children, initial, animate, height, ...props }) => {
    const [position, setPosition] = useState({ x: `${initial.x.sign}${initial.x.value}px`, y: `${initial.y.sign}${initial.y.value}px`, scale: initial.scale, rotate: `${initial.rotate.sign}${initial.rotate.value}deg` });
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, "change", (latest) => {
        const progress = Math.min(latest / height, 1);

        const x = initial.x.value + (animate.x - initial.x.value) * progress;
        const y = initial.x.value + (animate.x - initial.x.value) * progress;
        const scale = initial.scale + (animate.scale - initial.scale) * progress;
        const rotate = initial.rotate.value + (animate.rotate - initial.rotate.value) * progress;
        console.log({ x: `${initial.x.sign}${x}px`, y: `${initial.y.sign}${y}px`, scale, rotate: `${initial.rotate.sign}${rotate}deg` })
        setPosition({ x: `${initial.x.sign}${x}px`, y: `${initial.y.sign}${y}px`, scale, rotate: `${initial.rotate.sign}${rotate}deg` });
    })
    return (
        <div style={{
            transform: `translate(${position.x}, ${position.y}) scale(${position.scale}) rotate(${position.rotate})`
        }} {...props}>
            {children}
        </div>
    )
}

export default function ScrollAnimation() {
    return (
        <div id="svg-container" className="space-x-2 hidden md:flex">
            <Motion
                height={300}
                initial={{
                    x: {
                        value: 300,
                        sign: "-"
                    },
                    y: {
                        value: 300,
                        sign: "-"
                    },
                    scale: 3,
                    rotate: {
                        value: 40,
                        sign: "-"
                    }
                }}
                animate={{
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 360
                }}
            >
                <Inbox className="text-[#666666] h-5 w-5" />
            </Motion>
            <Motion
                height={300}
                initial={{
                    x: {
                        value: 500,
                        sign: ""
                    },
                    y: {
                        value: 500,
                        sign: "-"
                    },
                    scale: 3,
                    rotate: {
                        value: 40,
                        sign: ""
                    }
                }}
                animate={{
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 360
                }}
            >
                <Users className="text-[#666666] h-5 w-5" />
            </Motion>
            <Motion
                height={300}
                initial={{
                    x: {
                        value: 200,
                        sign: "-"
                    },
                    y: {
                        value: 200,
                        sign: ""
                    },
                    scale: 3,
                    rotate: {
                        value: 40,
                        sign: ""
                    }
                }}
                animate={{
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 360
                }}
            >
                <ToyBrick className="text-[#666666] h-5 w-5" />
            </Motion>

        </div >
    )
}