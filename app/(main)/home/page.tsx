"use client";

import React, { useState, useEffect } from "react";
import { GroupCard } from "@/components/GroupCard";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";
import { clsx } from "clsx";
import { normalizePhone } from "@/lib/utils";

import { Logo } from "@/components/Logo";

export default function HomePage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [joinError, setJoinError] = useState("");

    useEffect(() => {
        const loadGroups = () => {
            let storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
            let hasUpdates = false;

            // MAINTENANCE: Backfill missing invite codes for legacy groups
            storedGroups = storedGroups.map((g: any) => {
                if (!g.inviteCode) {
                    hasUpdates = true;
                    // Robust generation
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                    let code = "";
                    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
                    return { ...g, inviteCode: code };
                }
                return g;
            });

            if (hasUpdates) {
                localStorage.setItem("groups", JSON.stringify(storedGroups));
            }

            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const userPhone = storedUser.phone;
            const userName = storedUser.displayName;

            // FIX: Deduplicate stored groups by ID to prevent double-listing
            const uniqueGroupsMap = new Map();
            storedGroups.forEach((g: any) => uniqueGroupsMap.set(g.id, g));
            const uniqueStoredGroups = Array.from(uniqueGroupsMap.values());

            // 1. Filter Groups: Privacy Check
            const myGroups = uniqueStoredGroups.filter((g: any) => {
                const isCreator = g.creatorId && g.creatorId === storedUser.id;
                const isMemberByPhone = userPhone && g.members?.some((m: any) => normalizePhone(m.phone) === normalizePhone(userPhone));
                // Legacy support: match by name if phone matching fails
                const isMemberByName = userName && g.members?.some((m: any) => m.name === userName || m.name === "You");

                // If user is just a visitor/new user, they shouldn't see anything unless explicitly added
                return isCreator || isMemberByPhone || isMemberByName;
            });

            // 2. Enrich Data
            const enrichedGroups = myGroups.map((g: any) => {
                const members = g.members || [];
                const totalSaved = members.reduce((acc: number, m: any) => acc + m.amount, 0);
                const progress = Math.min((totalSaved / Number(g.goalAmount)) * 100, 100);

                // Find user contribution
                let myAmount = 0;
                if (userPhone) {
                    const me = members.find((m: any) => normalizePhone(m.phone) === normalizePhone(userPhone));
                    if (me) myAmount = me.amount;
                }
                // Fallback match by name
                if (myAmount === 0 && userName) {
                    const me = members.find((m: any) => m.name === userName || m.name === "You");
                    if (me) myAmount = me.amount;
                }

                return {
                    ...g,
                    progress,
                    membersCount: members.length,
                    userContribution: myAmount
                };
            });

            setGroups(enrichedGroups);
            setUser(storedUser);
            setIsLoading(false);
        };

        loadGroups();
        window.addEventListener("storage", loadGroups);
        return () => window.removeEventListener("storage", loadGroups);
        return () => window.removeEventListener("storage", loadGroups);
    }, []);

    const handleJoinGroup = () => {
        setJoinError("");
        const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");

        // CLEANUP: Remove spaces and ensure uppercase for matching
        const cleanCode = inviteCode.replace(/\s/g, "").toUpperCase();

        const targetGroupIndex = storedGroups.findIndex((g: any) => g.inviteCode === cleanCode);

        if (targetGroupIndex === -1) {
            setJoinError("Invalid group code. Please check and try again.");
            return;
        }

        const targetGroup = storedGroups[targetGroupIndex];
        const userPhone = user?.phone;

        // Check if already a member
        const isMember = targetGroup.members.some((m: any) => normalizePhone(m.phone) === normalizePhone(userPhone));

        if (isMember) {
            setJoinError("You are already a member of this group");
            return;
        }

        // Add member
        const newMember = {
            id: String(Date.now()),
            name: user?.displayName || "Member",
            phone: user?.phone,
            amount: 0,
            rank: targetGroup.members.length + 1,
            initials: (user?.displayName || "ME").slice(0, 2).toUpperCase(),
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
            role: "Member",
            streak: "0w",
            avgPaymentDay: 0
        };

        targetGroup.members.push(newMember);
        storedGroups[targetGroupIndex] = targetGroup;
        localStorage.setItem("groups", JSON.stringify(storedGroups));

        setShowJoinModal(false);
        setInviteCode("");
        // Reload groups (The storage event listener might not catch this in same window, so manual reload call)
        window.dispatchEvent(new Event("storage"));
    };

    if (isLoading) return <div style={{ padding: "var(--spacing-lg)", textAlign: "center", color: "var(--text-secondary)" }}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.logoRow}>
                    <Logo size={40} />
                    <h1 className={styles.title} style={{ fontSize: '1.5rem', margin: 0, color: '#008643' }}>SocialPay</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={styles.subtitle} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, display: 'none' }}>Your savings groups</span>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #008A4B',
                            color: '#008A4B',
                            borderRadius: 20,
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Join with Code
                    </button>
                </div>
            </div>

            {groups.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Plus size={40} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 className={styles.emptyTitle}>No groups yet</h3>
                        <p className={styles.emptyText}>Create a savings group with friends to get started on your financial journey.</p>
                    </div>
                    {user?.role === "Chairman" ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                            <Link href="/groups/create" style={{ width: '100%' }}>
                                <Button fullWidth>Create Group</Button>
                            </Link>
                            <Button fullWidth style={{ background: '#fff', color: '#008A4B', border: '1px solid #008A4B' }} onClick={() => setShowJoinModal(true)}>
                                Join Group
                            </Button>
                        </div>
                    ) : (
                        <Button fullWidth onClick={() => setShowJoinModal(true)}>
                            Join Group
                        </Button>
                    )}
                </div>
            ) : (
                <div className={styles.grid}>
                    {groups.map((group) => {
                        let formattedDate = "Due 15 Feb";
                        if (group.targetDate) {
                            const date = new Date(group.targetDate);
                            formattedDate = `Due ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
                        }

                        return (
                            <GroupCard
                                key={group.id}
                                id={group.id}
                                name={group.name}
                                goalAmount={group.goalAmount}
                                currency={group.currency}
                                progress={group.progress || 0}
                                membersCount={group.membersCount || 1}
                                members={group.members || []}
                                dueDate={formattedDate}
                                userContribution={group.userContribution}
                            />
                        );
                    })}
                </div>
            )}
            {showJoinModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 320,
                        display: 'flex', flexDirection: 'column', gap: 16
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1F2937' }}>Join Group</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#6B7280' }}>
                            Ask your Chairman for the 6-character Invite Code.
                        </p>

                        <div>
                            <input
                                style={{
                                    width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #D1D5DB',
                                    fontSize: '1rem', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase'
                                }}
                                placeholder="XA8B9C"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                                maxLength={6}
                            />
                            {joinError && (
                                <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: 4, textAlign: 'center' }}>
                                    {joinError}
                                </p>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button fullWidth style={{ background: '#E5E7EB', color: '#374151' }} onClick={() => setShowJoinModal(false)}>
                                Cancel
                            </Button>
                            <Button fullWidth onClick={handleJoinGroup} disabled={inviteCode.length < 3}>
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
}
