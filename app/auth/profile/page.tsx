"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import { Camera, User, Check } from "lucide-react";
import Image from "next/image";
import { normalizePhone } from "@/lib/utils";

export default function ProfileSetupPage() {
    const router = useRouter();
    const [displayName, setDisplayName] = useState("");
    const [role, setRole] = useState("Member");
    const [password, setPassword] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [invitedGroups, setInvitedGroups] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const phone = localStorage.getItem("temp_phone");
        if (phone) {
            const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");

            // Check if this phone number exists in any group
            const foundGroups = storedGroups.filter((g: any) =>
                g.members?.some((m: any) => normalizePhone(m.phone) === normalizePhone(phone))
            );

            if (foundGroups.length > 0) {
                setInvitedGroups(foundGroups);
                const existingMember = foundGroups[0].members.find((m: any) => normalizePhone(m.phone) === normalizePhone(phone));

                if (existingMember) {
                    setDisplayName(existingMember.name);
                    // We default to their group role regarding preference, but they can still change it
                    if (existingMember.role === "Chairman") setRole("Chairman");
                    else if (existingMember.role === "Treasurer") setRole("Treasurer");
                    else setRole("Member");
                }
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Save user data to local storage or context (mock)
        const phone = localStorage.getItem("temp_phone") || "+256 700 000000";
        localStorage.setItem("user", JSON.stringify({ displayName, avatar: avatarPreview, phone, role }));
        localStorage.setItem("mock_password", password); // Insecure but for demo parity
        router.push("/home");
    };

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.content}
            >
                <div className={styles.header}>
                    <h1>Setup Profile</h1>
                    <p>Let's get to know you better</p>
                </div>

                {invitedGroups.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: '#ECFDF5',
                            border: '1px solid #6EE7B7',
                            borderRadius: 12,
                            padding: '12px 16px',
                            marginBottom: 24,
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center'
                        }}
                    >
                        <div style={{
                            background: '#10B981',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Check size={16} color="#fff" strokeWidth={3} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#064E3B', fontWeight: 700, margin: 0 }}>You've been invited!</p>
                            <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0 }}>
                                You'll join <b>{invitedGroups[0].name}</b> {invitedGroups.length > 1 ? `and ${invitedGroups.length - 1} others` : ""} automatically.
                            </p>
                        </div>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.avatarUpload}>
                        <div className={styles.avatarPreview}>
                            {avatarPreview ? (
                                <Image
                                    src={avatarPreview}
                                    alt="Avatar"
                                    width={100}
                                    height={100}
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <User size={40} color="#ccc" />
                                </div>
                            )}
                            <label htmlFor="avatar-input" className={styles.cameraButton}>
                                <Camera size={20} color="#fff" />
                            </label>
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className={styles.hiddenInput}
                            />
                        </div>
                        <p className={styles.uploadText}>Upload Photo</p>
                    </div>

                    <Input
                        label="Display Name"
                        placeholder="e.g. John Doe"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        autoFocus
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Role</label>
                        <div className={styles.selectWrapper}>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className={styles.selectField}
                            >
                                <option value="Member">Member</option>
                                <option value="Chairman">Chairman</option>
                                <option value="Treasurer">Treasurer</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Create Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" fullWidth isLoading={isLoading} disabled={!displayName.trim() || !password.trim()}>
                        Get Started
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}
