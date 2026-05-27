import React from "react";
import styles from "./Leaderboard.module.css";
import { User, Flame } from "lucide-react";

interface Member {
    id: string;
    name: string;
    avatar?: string;
    amount: number;
    streak: number;
}

interface LeaderboardProps {
    members: Member[];
    currency: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ members, currency }) => {
    const sortedMembers = [...members].sort((a, b) => b.amount - a.amount);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Leaderboard</h3>
                <span className={styles.filter}>By Amount</span>
            </div>
            <div className={styles.list}>
                {sortedMembers.map((member, index) => (
                    <div key={member.id} className={styles.row}>
                        <span className={styles.rank}>{index + 1}</span>
                        <div className={styles.avatar}>
                            {member.avatar ? (
                                <img src={member.avatar} alt={member.name} />
                            ) : (
                                <User size={20} color="#666" />
                            )}
                        </div>
                        <div className={styles.info}>
                            <span className={styles.name}>
                                {member.name}
                                {member.streak > 0 && <span className={styles.streak}><Flame size={12} fill="#FF9500" stroke="none" /> {member.streak}</span>}
                            </span>
                            <span className={styles.amount}>
                                {currency} {member.amount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
                {members.length === 0 && (
                    <p className={styles.empty}>No members yet.</p>
                )}
            </div>
        </div>
    );
};
