"use client";

import React, { useEffect, useState } from "react";
import styles from "./page.module.css"; // We might need to create this or use inline
import { AvatarInitials } from "@/components/ui/AvatarInitials";

export default function NotificationsPage() {
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        // 1. Get all groups
        const groups = JSON.parse(localStorage.getItem("groups") || "[]");

        // 2. Aggregate all activities
        let allActivities: any[] = [];
        groups.forEach((g: any) => {
            const groupActivities = JSON.parse(localStorage.getItem(`activities_${g.id}`) || "[]");
            // Add group context if needed, though text usually describes user
            allActivities = [...allActivities, ...groupActivities];
        });

        // 3. Sort by 'id' descending (timestamps are in the ID: a170...)
        // IDs are "a123..." or "sys123..." or "app123..."
        // We can extract numbers.
        allActivities.sort((a, b) => {
            const timeA = parseInt(a.id.replace(/\D/g, ''));
            const timeB = parseInt(b.id.replace(/\D/g, ''));
            return timeB - timeA;
        });

        setActivities(allActivities);
    }, []);

    return (
        <div style={{ padding: "var(--spacing-md)", paddingBottom: 100 }}>
            <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--spacing-lg)", fontSize: '1.5rem' }}>Activity</h1>

            {activities.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 40 }}>
                    <p>No recent activity.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                    {activities.map((activity) => (
                        <div key={activity.id} style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: 16,
                            background: "var(--surface)",
                            borderRadius: 16,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                            border: "1px solid var(--border)"
                        }}>
                            <AvatarInitials
                                name={activity.user || "User"}
                                color={activity.color || "#ECFDF5"}
                                textColor={activity.textColor || "#059669"}
                                size={40}
                            />
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.4, color: "var(--text-primary)" }}>
                                    <strong style={{ fontWeight: 600 }}>{activity.user}</strong> {activity.text.replace(activity.user, '')}
                                    {activity.amount && (
                                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}> UGX {Number(activity.amount).toLocaleString()}</span>
                                    )}
                                </p>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4, display: "block" }}>
                                    {activity.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
