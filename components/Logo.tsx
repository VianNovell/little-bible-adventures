import React from "react";
import Image from "next/image";

interface LogoProps {
    size?: number;
    className?: string;
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 44, className, showText = false }) => {
    return (
        <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: size, height: size, position: "relative", borderRadius: '20%', overflow: 'hidden' }}>
                <Image
                    src="/Socialpay.jpg"
                    alt="SocialPay Logo"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    unoptimized
                />
            </div>
            {showText && (
                <span style={{
                    fontSize: Math.max(14, size * 0.3),
                    fontWeight: 900,
                    color: '#008A4B',
                    fontFamily: '"Inter", sans-serif',
                    marginTop: 8,
                    textTransform: "uppercase",
                    letterSpacing: "-0.05em"
                }}>
                    SOCIAL PAY
                </span>
            )}
        </div>
    );
};
