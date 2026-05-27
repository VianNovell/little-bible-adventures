import React from "react";
import { motion } from "framer-motion";

interface ProgressRingProps {
    radius?: number;
    stroke?: number;
    progress: number;
    color?: string;
    children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    radius = 120,
    stroke = 16,
    progress,
    color = "#6C3BF5",
    children,
}) => {
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ position: "relative", width: radius * 2, height: radius * 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <svg
                height={radius * 2}
                width={radius * 2}
                style={{ transform: "rotate(-90deg)", position: "absolute", top: 0, left: 0 }}
            >
                <circle
                    stroke="#F3F4F6"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                />
                <motion.circle
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + " " + circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} // Premium easing curve
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            {children}
        </div>
    );
};
