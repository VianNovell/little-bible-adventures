"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./page.module.css";
import { ArrowLeft, Camera, UploadCloud } from "lucide-react";
import Link from "next/link";

export default function LogPaymentPage() {
    const router = useRouter();
    const params = useParams();
    const groupId = params?.id as string;

    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [group, setGroup] = useState<any>(null);

    useEffect(() => {
        const groups = JSON.parse(localStorage.getItem("groups") || "[]");
        const foundGroup = groups.find((g: any) => g.id === groupId);
        if (foundGroup) {
            setGroup(foundGroup);
        }
    }, [groupId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const newPayment = {
                id: crypto.randomUUID(),
                groupId,
                memberId: "me",
                memberName: user.displayName || "Me",
                memberAvatar: user.avatar,
                amount: Number(amount),
                currency: group?.currency || "UGX",
                note,
                receipt: receiptPreview,
                status: "Pending",
                date: new Date().toISOString()
            };

            const payments = JSON.parse(localStorage.getItem("payments") || "[]");
            payments.push(newPayment);
            localStorage.setItem("payments", JSON.stringify(payments));

            router.push(`/groups/${groupId}`);
        }, 1500);
    };

    if (!group) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href={`/groups/${groupId}`} className={styles.iconButton}>
                    <ArrowLeft size={24} />
                </Link>
                <h1 className={styles.title}>Log Payment</h1>
                <div style={{ width: 40 }}></div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.amountSection}>
                    <label className={styles.label}>Amount</label>
                    <div className={styles.amountInputWrapper}>
                        <span className={styles.currency}>{group.currency}</span>
                        <input
                            type="number"
                            className={styles.amountInput}
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                </div>

                <div className={styles.receiptSection}>
                    <label className={styles.label}>Receipt Proof</label>
                    <div className={styles.uploadArea}>
                        {receiptPreview ? (
                            <div className={styles.previewContainer}>
                                <img src={receiptPreview} alt="Receipt" className={styles.previewImage} />
                                <button type="button" className={styles.removeButton} onClick={() => setReceiptPreview(null)}>Change</button>
                            </div>
                        ) : (
                            <label className={styles.uploadLabel}>
                                <div className={styles.uploadIcon}>
                                    <UploadCloud size={32} color="var(--primary)" />
                                </div>
                                <span>Tap to upload receipt</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} className={styles.hiddenInput} />
                            </label>
                        )}
                    </div>
                </div>

                <Input
                    label="Note (Optional)"
                    placeholder="e.g. Bank Transfer #123"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                <Button type="submit" fullWidth isLoading={isLoading} disabled={!amount || !receiptPreview}>
                    Submit for Review
                </Button>
            </form>
        </div>
    );
}
