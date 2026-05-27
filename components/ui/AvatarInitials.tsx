import React from "react";

export const AvatarInitials = ({ name, size = 40, color = "#2F65F6", textColor = "#fff" }: { name: string, size?: number, color?: string, textColor?: string }) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: color,
                color: textColor,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 600,
                fontSize: size * 0.4,
                fontFamily: "var(--font-heading)",
                flexShrink: 0
            }}
        >
            {initials}
        </div>
    );
};
