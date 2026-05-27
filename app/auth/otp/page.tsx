"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function OtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get("phone") || "+256 700 000000";

    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState(59);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleResend = async () => {
        setTimeLeft(59);
        setError("");

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('temp_otp', generatedOtp);

        try {
            await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: phone,
                    message: `SocialPay Resend: Your verification code is: ${generatedOtp}`
                })
            });
            alert("New code sent to your phone! (Or use 000000 to bypass if you don't receive it)");
        } catch (err) {
            console.error("Resend error:", err);
            setError("Failed to resend code.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const expectedOtp = localStorage.getItem('temp_otp');

        // Allow bypassing if no OTP was set, or use developer bypass '000000'
        if (expectedOtp && otp !== expectedOtp && otp !== "000000") {
            setError("Invalid verification code. Please check your SMS.");
            return;
        }

        setIsLoading(true);

        // Save phone for profile setup
        localStorage.setItem("temp_phone", phone);
        localStorage.removeItem("temp_otp");

        // Go to profile setup
        router.push("/auth/profile");
    };

    return (
        <div className={styles.container}>
            <div className={styles.nav}>
                <Link href="/auth" className={styles.backLink}>
                    <ArrowLeft size={24} />
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={styles.content}
            >
                <div className={styles.header}>
                    <h1>Confirm it's you</h1>
                    <p>We sent a code to <span className={styles.phoneNumber}>{phone}</span></p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                        className={styles.otpInput}
                        maxLength={6}
                        autoFocus
                        style={{ textAlign: "center", letterSpacing: "8px", fontSize: "1.5rem" }}
                        error={error}
                    />

                    <Button type="submit" fullWidth isLoading={isLoading} disabled={otp.length !== 6}>
                        Verify
                    </Button>

                    <div className={styles.resend}>
                        {timeLeft > 0 ? (
                            <p>Resend code in 0:{timeLeft.toString().padStart(2, "0")}</p>
                        ) : (
                            <button type="button" className={styles.resendLink} onClick={handleResend}>
                                Resend Code
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function OtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OtpContent />
        </Suspense>
    );
}
