"use client";

import React, { useState, useEffect } from "react";
import { Settings, Award, Shield, Zap, Target } from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";

const BADGES = [
    { id: "first_step", name: "First Step", description: "Made your first contribution", icon: <Shield size={24} /> },
    { id: "goal_getter", name: "Goal Getter", description: "Joined your first savings group", icon: <Target size={24} /> },
    { id: "streak_master", name: "Streak Master", description: "Reached a 4-week streak", icon: <Zap size={24} /> },
    { id: "saver_hero", name: "Super Saver", description: "Saved over 1M UGX", icon: <Award size={24} /> },
];

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ totalSaved: 0, groupsCount: 0, badges: [] as string[] });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        const groups = JSON.parse(localStorage.getItem("groups") || "[]");

        if (storedUser) setUser(storedUser);

        let totalSaved = 0;
        let earnedBadges: string[] = [];

        // Calculate stats
        groups.forEach((g: any) => {
            const myMember = g.members?.find((m: any) => m.name === (storedUser?.displayName || "Me")); // Should use ID in real app
            if (myMember) {
                totalSaved += myMember.amount;
                if (myMember.amount > 0) earnedBadges.push("first_step");
                if (myMember.streak >= 4) earnedBadges.push("streak_master");
            }
        });

        if (groups.length > 0) earnedBadges.push("goal_getter");
        if (totalSaved > 1000000) earnedBadges.push("saver_hero");

        setStats({
            totalSaved,
            groupsCount: groups.length,
            badges: [...new Set(earnedBadges)] // Unique
        });

    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Profile</h1>
                <button className={styles.iconButton}>
                    <Settings size={24} />
                </button>
            </div>

            <div className={styles.profileCard}>
                <div className={styles.avatar}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" />
                    ) : (
                        <div style={{ width: "100%", height: "100%", background: "#ccc" }} />
                    )}
                </div>
                <h2 className={styles.name}>{user?.displayName || "Guest User"}</h2>
                {user?.role && (
                    <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 20,
                        background: user.role === 'Chairman' ? '#F3E8FF' : user.role === 'Treasurer' ? '#DBEAFE' : '#ECFDF5',
                        color: user.role === 'Chairman' ? '#7E22CE' : user.role === 'Treasurer' ? '#2563EB' : '#047857',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: 8,
                        marginTop: -4
                    }}>
                        {user.role}
                    </span>
                )}
                <p className={styles.phone}>{user?.phone || "+256 700 000000"}</p>

                <div className={styles.statsRow}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{stats.groupsCount}</span>
                        <span className={styles.statLabel}>Groups</span>
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{(stats.totalSaved / 1000).toFixed(0)}k</span>
                        <span className={styles.statLabel}>Saved</span>
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{stats.badges.length}</span>
                        <span className={styles.statLabel}>Badges</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3>Badges</h3>
                <div className={styles.badgesGrid}>
                    {BADGES.map((badge) => {
                        const isUnlocked = stats.badges.includes(badge.id);
                        return (
                            <div key={badge.id} className={`${styles.badgeCard} ${isUnlocked ? styles.unlocked : styles.locked}`}>
                                <div className={styles.badgeIcon}>
                                    {badge.icon}
                                </div>
                                <div className={styles.badgeInfo}>
                                    <h4>{badge.name}</h4>
                                    <p>{badge.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ padding: 'var(--spacing-md)' }}>
                <Link href="/auth" onClick={() => localStorage.clear()} style={{ color: 'red', textDecoration: 'underline' }}>
                    Logout (Reset Demo)
                </Link>
            </div>
        </div>
    );
}
