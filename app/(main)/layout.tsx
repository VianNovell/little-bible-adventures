import React from "react";
import { BottomNav } from "@/components/BottomNav";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <main style={{ flex: 1, paddingBottom: "100px", overflowY: "auto" }}>
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
