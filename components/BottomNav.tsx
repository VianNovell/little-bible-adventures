"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";
import { Home, Compass, Bell, User, Plus } from "lucide-react";
import { clsx } from "clsx";

export const BottomNav = () => {
    const pathname = usePathname();
    const [userRole, setUserRole] = React.useState("Member");
    const [firstGroupId, setFirstGroupId] = React.useState("");

    React.useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserRole(user.role || "Member");
        const groups = JSON.parse(localStorage.getItem("groups") || "[]");
        if (groups.length > 0) setFirstGroupId(groups[0].id);
    }, [pathname]);

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + "/");
    const isGroupPage = pathname?.startsWith("/groups/") && !pathname?.includes("/create");
    const groupId = isGroupPage ? pathname?.split("/")[2] : null;

    return (
        <nav className={styles.nav}>
            <Link href="/home" className={clsx(styles.navItem, isActive("/home") && styles.active)}>
                <Home size={24} strokeWidth={isActive("/home") ? 2.5 : 2} />
                <span className={styles.label}>Home</span>
            </Link>

            <Link href="/explore" className={clsx(styles.navItem, isActive("/explore") && styles.active)}>
                <Compass size={24} strokeWidth={isActive("/explore") ? 2.5 : 2} />
                <span className={styles.label}>Explore</span>
            </Link>

            <div className={styles.fabContainer}>
                {isGroupPage ? (
                    <Link href={`/groups/${groupId}/pay`} className={styles.fab}>
                        <Plus size={32} color="#fff" />
                    </Link>
                ) : (
                    userRole === 'Chairman' ? (
                        <Link href="/groups/create" className={styles.fab}>
                            <Plus size={32} color="#fff" />
                        </Link>
                    ) : (
                        firstGroupId ? (
                            <Link href={`/groups/${firstGroupId}/pay`} className={styles.fab}>
                                <Plus size={32} color="#fff" />
                            </Link>
                        ) : (
                            <div className={styles.fab} style={{ background: '#ccc', pointerEvents: 'none' }}>
                                <Plus size={32} color="#fff" />
                            </div>
                        )
                    )
                )}
            </div>

            <Link href="/notifications" className={clsx(styles.navItem, isActive("/notifications") && styles.active)} style={{ position: 'relative' }}>
                <Bell size={24} strokeWidth={isActive("/notifications") ? 2.5 : 2} />
                <span className={styles.label}>Activity</span>
            </Link>

            <Link href="/profile" className={clsx(styles.navItem, isActive("/profile") && styles.active)}>
                <User size={24} strokeWidth={isActive("/profile") ? 2.5 : 2} />
                <span className={styles.label}>Profile</span>
            </Link>
        </nav>
    );
};
