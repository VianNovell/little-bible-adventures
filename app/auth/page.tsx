"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import styles from "./page.module.css";
import { Logo } from "@/components/Logo";
import { normalizePhone } from "@/lib/utils";

export default function PhoneEntryPage() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        let cleanPhone = normalizePhone(phoneNumber);

        if (cleanPhone.length < 9) {
            setError("Please enter a valid phone number");
            setIsLoading(false);
            return;
        }

        // Format to international +256
        let formattedPhone = cleanPhone;
        if (!formattedPhone.startsWith('+')) {
            // normalizePhone returns exactly 9 digits (e.g. 7XXXXXXXX)
            formattedPhone = '+256' + formattedPhone;
        }

        // Generate a 6-digit OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            // Save it locally for verification on the next page
            localStorage.setItem('temp_otp', generatedOtp);
            localStorage.setItem('temp_phone', formattedPhone);

            // Send via Africa's Talking API
            const response = await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: formattedPhone,
                    message: `SocialPay OTP: ${generatedOtp}`
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("SMS Error API Response:", errText);
                throw new Error("Failed by API");
            }

            // Temporary popup to assist tests
            alert("Security Code Sent via Africa's Talking!\n\nNote: If MTN or Airtel filters the SMS because we don't have an approved Sender ID yet, you can type 000000 to bypass and login.");

            // Navigate to OTP page
            router.push(`/auth/otp?phone=${encodeURIComponent(formattedPhone)}`);
        } catch (err) {
            console.error("Failed to send OTP", err);
            setError("Could not send SMS. Please check your internet connection.");
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={styles.content}
            >
                <div className={styles.header}>
                    <Logo size={80} />
                    <h1>Welcome to SocialPay</h1>
                    <p>Enter your phone number to get started.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <select className={styles.countrySelect} disabled>
                            <option value="+256">🇺🇬 +256</option>
                            {/* Add more countries later */}
                        </select>
                        <Input
                            type="tel"
                            placeholder="772 123 456"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={styles.phoneInput}
                            error={error}
                            autoFocus
                        />
                    </div>

                    <Button type="submit" fullWidth isLoading={isLoading}>
                        Continue
                    </Button>

                    <p className={styles.disclaimer}>
                        By continuing, you agree to our Terms and Privacy Policy.
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
