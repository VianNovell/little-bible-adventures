import React from "react";
import Link from "next/link";
import styles from "./GroupCard.module.css";
import { Clock } from "lucide-react";
import { ProgressRing } from "./ProgressRing";
import { AvatarInitials } from "./ui/AvatarInitials";

interface GroupCardProps {
    id: string;
    name: string;
    goalAmount: number;
    currency: string;
    progress: number;
    membersCount: number;
    members?: { id: string, name: string, initials?: string, color?: string }[];
    dueDate?: string;
    userContribution?: number;
}

export const GroupCard: React.FC<GroupCardProps> = ({
    id,
    name,
    goalAmount,
    currency,
    progress,
    membersCount,
    members = [],
    dueDate = "Due 15 Feb",
    userContribution
}) => {
    // Only show actual members
    const displayMembers = members.slice(0, 3);

    const savedAmount = (goalAmount * (progress / 100));

    return (
        <Link href={`/groups/${id}`} className={styles.card}>
            {/* Left: Progress Ring */}
            <div className={styles.ringContainer}>
                <ProgressRing
                    radius={36}
                    stroke={6}
                    progress={progress}
                    color="#00A854"
                />
            </div>

            {/* Middle: Info */}
            <div className={styles.content}>
                <div className={styles.headerRow}>
                    <h3 className={styles.groupName}>{name}</h3>
                    <span className={styles.percentText}>{Math.round(progress)}%</span>
                </div>

                <div className={styles.amountRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <span className={styles.amountText}>
                        {currency} {savedAmount.toLocaleString()} <span className={styles.separator}>/</span> {currency} {goalAmount.toLocaleString()}
                    </span>
                    {userContribution !== undefined && (
                        <div style={{ fontSize: '0.75rem', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                            My Savings: {currency} {userContribution.toLocaleString()}
                        </div>
                    )}
                </div>

                <div className={styles.footerRow}>
                    <div className={styles.avatarPile}>
                        {displayMembers.map((m, i) => (
                            <div
                                key={m.id}
                                className={styles.avatarBubble}
                                style={{
                                    zIndex: 10 - i,
                                    transform: `translateX(-${i * 10}px)`,
                                    backgroundColor: m.color || 'var(--primary)'
                                }}
                            >
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff' }}>{m.initials || "U"}</span>
                            </div>
                        ))}
                        {membersCount > 3 && (
                            <div className={styles.moreBubble} style={{ zIndex: 5, transform: `translateX(-30px)` }}>
                                +{membersCount - 3}
                            </div>
                        )}
                    </div>

                    {/* Due Date */}
                    <div className={styles.dueDate}>
                        <Clock size={14} className={styles.clockIcon} /> {dueDate}
                    </div>
                </div>
            </div>
        </Link>
    );
};
