"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CreateGroupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        goalAmount: "",
        currency: "UGX",
        frequency: "WEEKLY", // 'WEEKLY', 'MONTHLY'
        targetDate: "",
    });

    // Restrict access to Chairman only
    React.useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role !== "Chairman") {
            // alert("Only a Chairman can create a group."); // Keep it silent or show toast
            router.push("/home");
        }
    }, [router]);

    const updateForm = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        // Save to local storage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        // Ensure we have a persistent ID and phone for the creator
        const creatorId = user.id || "creator_" + Date.now();
        const creatorPhone = user.phone || "";

        // Generate a robust 6-char alphanumeric invite code
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let inviteCode = "";
        for (let i = 0; i < 6; i++) {
            inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const newGroup = {
            id: crypto.randomUUID(),
            inviteCode: inviteCode,
            creatorId: creatorId, // Explicit creator reference
            ...formData,
            members: [{
                id: creatorId,
                name: user?.displayName || "You",
                phone: creatorPhone, // Critical for matching
                amount: 0,
                rank: 1,
                initials: (user?.displayName || "YO").slice(0, 2).toUpperCase(),
                color: "#00A854",
                role: user?.role || "Chairman",
                streak: "0w",
                avgPaymentDay: 0
            }],
            progress: 0,
            createdAt: new Date().toISOString(),
        };

        const groups = JSON.parse(localStorage.getItem("groups") || "[]");
        groups.push(newGroup);
        localStorage.setItem("groups", JSON.stringify(groups));

        router.push(`/home`); // Or to the group detail page
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.nav}>
                    {step === 1 ? (
                        <Link href="/home" className={styles.backButton}>
                            <ArrowLeft size={24} />
                        </Link>
                    ) : (
                        <button onClick={prevStep} className={styles.backButton}>
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h1 className={styles.title}>Create Group</h1>
                    <div style={{ width: 24 }}></div> {/* Spacer */}
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>
            </div>

            <div className={styles.content}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.stepContainer}
                        >
                            <h2>What's the goal?</h2>
                            <p className={styles.subtitle}>Give your savings group a name and purpose.</p>

                            <Input
                                label="Group Name"
                                placeholder="e.g. Summer Vacation, Emergency Fund"
                                value={formData.name}
                                onChange={(e) => updateForm("name", e.target.value)}
                                autoFocus
                            />

                            <Input
                                label="Description (Optional)"
                                placeholder="What are we saving for?"
                                value={formData.description}
                                onChange={(e) => updateForm("description", e.target.value)}
                            />

                            <Button fullWidth onClick={nextStep} disabled={!formData.name}>
                                Next <ChevronRight size={20} />
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.stepContainer}
                        >
                            <h2>How much do we need?</h2>
                            <p className={styles.subtitle}>Set the total target amount for the group.</p>

                            <div className={styles.amountInputWrapper}>
                                <span className={styles.currencyLabel}>{formData.currency}</span>
                                <input
                                    type="number"
                                    className={styles.amountInput}
                                    placeholder="0"
                                    value={formData.goalAmount}
                                    onChange={(e) => updateForm("goalAmount", e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className={styles.optionsGrid}>
                                <button
                                    className={`${styles.optionCard} ${formData.frequency === "WEEKLY" ? styles.selected : ""}`}
                                    onClick={() => updateForm("frequency", "WEEKLY")}
                                >
                                    Weekly
                                </button>
                                <button
                                    className={`${styles.optionCard} ${formData.frequency === "MONTHLY" ? styles.selected : ""}`}
                                    onClick={() => updateForm("frequency", "MONTHLY")}
                                >
                                    Monthly
                                </button>
                                <button
                                    className={`${styles.optionCard} ${formData.frequency === "ANNUALLY" ? styles.selected : ""}`}
                                    onClick={() => updateForm("frequency", "ANNUALLY")}
                                >
                                    Annually
                                </button>
                            </div>

                            <Button fullWidth onClick={nextStep} disabled={!formData.goalAmount}>
                                Next <ChevronRight size={20} />
                            </Button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.stepContainer}
                        >
                            <h2>When is the deadline?</h2>
                            <p className={styles.subtitle}>Pick a target date to reach your goal.</p>

                            <Input
                                type="date"
                                label="Target Date"
                                value={formData.targetDate}
                                onChange={(e) => updateForm("targetDate", e.target.value)}
                                placeholder="Select date"
                            />

                            <div className={styles.summaryCard}>
                                <h3>Summary</h3>
                                <div className={styles.summaryRow}>
                                    <span>Name</span>
                                    <span>{formData.name}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Goal</span>
                                    <span>{formData.currency} {Number(formData.goalAmount).toLocaleString()}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Frequency</span>
                                    <span>{formData.frequency}</span>
                                </div>
                            </div>

                            <Button fullWidth onClick={handleSubmit} disabled={!formData.targetDate}>
                                Create Group <Check size={20} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
