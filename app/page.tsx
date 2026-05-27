"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/home");
    }
  }, [router]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.logoContainer}>
            <Image
              src="/icon.svg"
              alt="SocialPay Logo"
              width={80}
              height={80}
              priority
              className={styles.logo}
            />
          </div>
          <h1 className={styles.title}>SocialPay</h1>
          <p className={styles.subtitle}>
            Save together, grow together.<br />
            Gamified social savings for everyone.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/auth" style={{ width: '100%' }}>
            <Button fullWidth size="lg">
              Get Started <ArrowRight size={20} style={{ marginLeft: 8 }} />
            </Button>
          </Link>
          <p className={styles.footerText}>
            Trusted by 10,000+ savers in Uganda
          </p>
        </div>
      </main>
    </div>
  );
}
