"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./page.module.css";
import { ArrowLeft, Clock, Settings, UserPlus, CheckCircle, XCircle, ArrowUpRight, Flame, Zap, Star, Check, Plus, Camera, Image as ImageIcon, X, Receipt, Crown, Briefcase, Copy } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { AvatarInitials } from "@/components/ui/AvatarInitials";
import { Button } from "@/components/ui/Button";

export default function GroupDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [activeTab, setActiveTab] = useState("Overview");
    const [leaderboardFilter, setLeaderboardFilter] = useState("Amount");
    const [receiptsFilter, setReceiptsFilter] = useState("All");

    // Green Theme Brand Colors
    const brandColor = "#00A854";
    const brandLight = "#ECFDF5";

    const [group, setGroup] = useState<any>(null);
    const [groupMembers, setGroupMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Local State for Adding Members & Log Payment
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isLogPaymentOpen, setIsLogPaymentOpen] = useState(false);

    // Add Member Form
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberPhone, setNewMemberPhone] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("Member");
    const [newMemberAmount, setNewMemberAmount] = useState("");

    const [activities, setActivities] = useState<any[]>([]);
    const [receipts, setReceipts] = useState<any[]>([]);

    // Log Payment Form
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentNote, setPaymentNote] = useState("");
    const [paymentMemberId, setPaymentMemberId] = useState("1");
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [inviteCopied, setInviteCopied] = useState(false);

    const handleCopyInvite = () => {
        if (group?.inviteCode) {
            navigator.clipboard.writeText(group.inviteCode);
            setInviteCopied(true);
            setTimeout(() => setInviteCopied(false), 2000);
        }
    };

    useEffect(() => {
        const loadData = () => {
            const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const foundGroup = storedGroups.find((g: any) => g.id === id);

            let activeGroup = foundGroup;
            let activeMembers = [];

            if (!activeGroup) {
                // Return to mock if not found (legacy support)
                activeGroup = {
                    name: "Kampala Teachers Fund",
                    goalAmount: 5000000,
                    currency: "UGX",
                    nextDue: "15 Feb",
                    members: [
                        {
                            id: "1",
                            name: "You",
                            amount: 0,
                            rank: 1,
                            initials: "YO",
                            color: brandColor,
                            role: "Chairman",
                            streak: "0w",
                            avgPaymentDay: 0
                        }
                    ]
                };
                activeMembers = activeGroup.members;
            } else {
                // Dynamic Group Handling
                activeMembers = foundGroup.members || [];

                // If newly created group (no members), add the creator
                if (activeMembers.length === 0) {
                    const creatorMember = {
                        id: "creator",
                        name: storedUser.displayName || "You",
                        phone: storedUser.phone || "",
                        amount: 0,
                        rank: 1,
                        initials: (storedUser.displayName || "YO").slice(0, 2).toUpperCase(),
                        color: brandColor,
                        role: storedUser.role || "Chairman",
                        streak: "0w",
                        avgPaymentDay: 0
                    };
                    activeMembers = [creatorMember];

                    // Persist this fix immediately to avoid data loss on refresh
                    if (foundGroup) {
                        foundGroup.members = activeMembers;
                        localStorage.setItem("groups", JSON.stringify(storedGroups));
                    }
                }

                // Format Target Date
                if (activeGroup.targetDate) {
                    const d = new Date(activeGroup.targetDate);
                    activeGroup.nextDue = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                } else {
                    activeGroup.nextDue = "TBD";
                }
            }

            setGroup(activeGroup);
            setGroupMembers(activeMembers);

            // Load Activities & Receipts
            const storedActivities = JSON.parse(localStorage.getItem(`activities_${id}`) || "[]");
            const storedReceipts = JSON.parse(localStorage.getItem(`receipts_${id}`) || "[]");

            // Check external payments
            const externalPayments = JSON.parse(localStorage.getItem("payments") || "[]").filter((p: any) => p.groupId === id);
            const newReceiptsFromExternal = externalPayments.filter((ep: any) => !storedReceipts.some((r: any) => r.id === ep.id));

            if (newReceiptsFromExternal.length > 0) {
                const mappedReceipts = newReceiptsFromExternal.map((p: any) => ({
                    id: p.id,
                    user: p.memberName,
                    date: new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                    amount: p.amount,
                    status: p.status === "PENDING" ? "Pending" : p.status,
                    description: p.note || "Contribution",
                    initials: p.memberName.slice(0, 2).toUpperCase(),
                    color: brandLight,
                    textColor: brandColor,
                    receiptImage: p.receipt
                }));

                const updatedReceipts = [...mappedReceipts, ...storedReceipts];
                setReceipts(updatedReceipts);
                localStorage.setItem(`receipts_${id}`, JSON.stringify(updatedReceipts));

                const newActivities = mappedReceipts.map((r: any) => ({
                    id: `act_${r.id}`,
                    type: "payment",
                    user: r.user,
                    text: "logged a payment",
                    amount: r.amount,
                    time: "Just now",
                    initials: r.initials,
                    color: brandLight,
                    textColor: brandColor
                }));
                const updatedActivities = [...newActivities, ...storedActivities];
                setActivities(updatedActivities);
                localStorage.setItem(`activities_${id}`, JSON.stringify(updatedActivities));
            } else {
                setActivities(storedActivities);
                setReceipts(storedReceipts);
            }

            setIsLoading(false);
        };

        loadData();
    }, [id]);

    if (isLoading || !group) return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;

    // Recalculate savedAmount based on members
    const totalSaved = groupMembers.reduce((acc, m) => acc + m.amount, 0);
    const progressPercent = Math.round((totalSaved / Number(group.goalAmount)) * 100);
    const remainingCheck = Math.max(0, group.goalAmount - totalSaved);
    const surplusAmount = Math.max(0, totalSaved - group.goalAmount);

    // Get current user role
    // Get current user role
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    // Match by phone first (secure), fallback to name (legacy)
    const currentUser = groupMembers.find(m => (m.phone && m.phone === storedUser.phone)) ||
        groupMembers.find(m => m.name === "You" || m.name === storedUser.displayName);

    // Strict Role Check: Must be explicitly defined in the group member list
    const isPrivileged = currentUser?.role === "Chairman" || currentUser?.role === "Treasurer";

    const updateActivities = (newActivities: any[]) => {
        setActivities(newActivities);
        localStorage.setItem(`activities_${id}`, JSON.stringify(newActivities));
    };

    const updateReceipts = (newReceipts: any[]) => {
        setReceipts(newReceipts);
        localStorage.setItem(`receipts_${id}`, JSON.stringify(newReceipts));
    };



    // Helper to save group members to storage
    const saveGroupMembers = (updatedMembers: any[]) => {
        setGroupMembers(updatedMembers);
        const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
        const groupIndex = storedGroups.findIndex((g: any) => g.id === id);
        if (groupIndex !== -1) {
            storedGroups[groupIndex].members = updatedMembers;
            localStorage.setItem("groups", JSON.stringify(storedGroups));
        }
    };

    const handleAddMember = async () => {
        if (!isPrivileged) return; // Guard: Only Chairman/Treasurer can add members
        if (!newMemberName.trim()) return;

        const amount = parseInt(newMemberAmount.replace(/,/g, '')) || 0;

        const newMember = {
            id: String(Date.now()),
            name: newMemberName,
            phone: newMemberPhone,
            amount: amount,
            rank: groupMembers.length + 1,
            initials: newMemberName.slice(0, 2).toUpperCase(),
            color: brandColor,
            role: newMemberRole,
            streak: "0w",
            avgPaymentDay: 15 // Default to mid-month
        };

        const updatedMembers = [...groupMembers, newMember];
        saveGroupMembers(updatedMembers);

        // If amount > 0, log a system activity
        let updatedActivities = [...activities];
        const systemActivity = {
            id: `sys${Date.now()}`,
            type: "join",
            user: newMemberName,
            text: amount > 0 ? `added with balance ${group.currency} ${amount.toLocaleString()}` : "joined the group",
            time: "Just now",
            initials: newMember.initials,
            color: brandLight,
            textColor: brandColor
        };
        updatedActivities = [systemActivity, ...activities];
        updateActivities(updatedActivities);

        // Notify Chairman to share the code
        const code = group.inviteCode || "N/A";

        // Simple alert to show the code immediately
        alert(`Member '${newMemberName}' added successfully!\n\nShare this Invite Code with them so they can join on their own device:\n\n👉 ${code}`);

        // Send SMS via Africa's Talking
        if (newMemberPhone.trim()) {
            try {
                // Ensure international format (assuming Uganda +256)
                let formattedPhone = newMemberPhone.trim();
                if (formattedPhone.startsWith('0')) {
                    formattedPhone = '+256' + formattedPhone.substring(1);
                } else if (!formattedPhone.startsWith('+')) {
                    formattedPhone = '+256' + formattedPhone;
                }

                const smsMessage = `Welcome to ${group.name} on SocialPay! Get the app and join using your Invite Code: ${code}`;

                // Fire and forget
                fetch('/api/sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ to: formattedPhone, message: smsMessage })
                }).catch(err => console.error("Failed to send SMS:", err));

            } catch (error) {
                console.error("SMS initialization error:", error);
            }
        }

        // Reset Form
        setNewMemberName("");
        setNewMemberPhone("");
        setNewMemberRole("Member");
        setNewMemberAmount("");
        setIsAddMemberOpen(false);
    };

    const handleExitGroup = () => {
        if (!confirm("Are you sure you want to leave this group?")) return;

        // Filter out current user
        const updatedMembers = groupMembers.filter(m => {
            // Match by phone or ID
            if (currentUser.phone) return m.phone !== currentUser.phone;
            return m.id !== currentUser.id;
        });

        // Save locally
        setGroupMembers(updatedMembers);

        // Update localStorage
        const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
        const groupIndex = storedGroups.findIndex((g: any) => g.id === id);

        if (groupIndex !== -1) {
            storedGroups[groupIndex].members = updatedMembers;
            localStorage.setItem("groups", JSON.stringify(storedGroups));
        }

        // Redirect home
        router.push("/home");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setReceiptImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleLogPayment = () => {
        if (!paymentAmount) return;

        const amount = parseInt(paymentAmount.replace(/,/g, '')) || 0;
        // Force logging for self if not privileged
        const targetMemberId = isPrivileged ? paymentMemberId : (currentUser?.id || "1");

        // Find the member for whom we are logging
        const member = groupMembers.find(m => m.id === targetMemberId);
        const userName = member ? member.name : (currentUser?.name || "You");

        const newReceipt = {
            id: `rcpt${Date.now()}`,
            user: userName,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            amount: amount,
            status: "Pending",
            description: paymentNote || "Contribution",
            initials: userName.slice(0, 2).toUpperCase(),
            color: brandLight,
            textColor: brandColor,
            receiptImage: receiptImage
        };

        const updatedReceipts = [newReceipt, ...receipts];
        updateReceipts(updatedReceipts);

        // Log Activity
        const newActivity = {
            id: `act_${newReceipt.id}`,
            type: "payment",
            user: userName,
            text: "logged a payment",
            amount: amount,
            time: "Just now",
            initials: newReceipt.initials,
            color: brandLight,
            textColor: brandColor
        };
        updateActivities([newActivity, ...activities]);

        setPaymentAmount("");
        setPaymentNote("");
        setReceiptImage(null);
        setIsLogPaymentOpen(false);
    };

    // ...

    const handleApproveReceipt = (receiptId: string) => {
        if (!isPrivileged) return; // Guard

        const receipt = receipts.find(r => r.id === receiptId);
        if (!receipt) return;

        // 1. Update Receipt Status
        const updatedReceipts = receipts.map(r =>
            r.id === receiptId ? { ...r, status: "Approved" } : r
        );
        updateReceipts(updatedReceipts);

        // 2. Update Member's Saved Amount
        // Find member by name since we store name in receipt
        const memberIndex = groupMembers.findIndex(m => m.name === receipt.user);
        if (memberIndex !== -1) {
            const updatedMembers = [...groupMembers];
            updatedMembers[memberIndex] = {
                ...updatedMembers[memberIndex],
                amount: updatedMembers[memberIndex].amount + receipt.amount
            };
            saveGroupMembers(updatedMembers);
        }

        // 3. Log Activity
        const approvalActivity = {
            id: `app${Date.now()}`,
            type: "approval",
            user: "You",
            text: `approved receipt from ${receipt.user}`,
            time: "Just now",
            initials: "YO",
            color: brandLight,
            textColor: brandColor
        };
        updateActivities([approvalActivity, ...activities]);
    };

    const handleRejectReceipt = (receiptId: string) => {
        if (!isPrivileged) return; // Guard
        const updatedReceipts = receipts.map(r =>
            r.id === receiptId ? { ...r, status: "Rejected" } : r
        );
        updateReceipts(updatedReceipts);
    };

    // Helper to render badges
    const renderBadge = (badge: string) => {
        let style = {};
        let icon = null;

        if (badge === "Early bird") {
            style = { background: '#FEF3C7', color: '#D97706' }; // Yellow
            icon = <Zap size={10} fill="#D97706" style={{ marginRight: 4 }} />;
        } else if (badge === "Consistent") {
            style = { background: '#ECFDF5', color: '#059669' }; // Green
            icon = <Flame size={10} fill="#059669" style={{ marginRight: 4 }} />;
        } else if (badge === "Top saver") {
            style = { background: '#ECFDF5', color: '#16A34A' }; // Green
            icon = <Star size={10} fill="#16A34A" style={{ marginRight: 4 }} />;
        }

        return (
            <span key={badge} className={styles.memberBadge} style={style}>
                {icon} {badge}
            </span>
        );
    };


    const deriveBadges = (member: typeof group.members[0]) => {
        const badges: string[] = [];
        const sortedMembers = [...groupMembers].sort((a, b) => b.amount - a.amount);
        const isTopSaver = sortedMembers.slice(0, 2).some(m => m.id === member.id);
        const streakWeeks = parseInt(member.streak.replace('w', '')) || 0;

        if (member.avgPaymentDay > 0 && member.avgPaymentDay <= 5) badges.push("Early bird");
        if (streakWeeks >= 4) badges.push("Consistent");
        if (isTopSaver && member.amount > 0) badges.push("Top saver");

        return badges;
    };

    const filteredReceipts = receiptsFilter === "All"
        ? receipts
        : receipts.filter(r => r.status.toLowerCase() === "pending");

    return (
        <div className={styles.container}>
            {/* Add Member Modal */}
            {isAddMemberOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 style={{ marginBottom: 16 }}>Add New Member</h3>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Member Name"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                className={styles.inputField}
                                autoFocus
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="tel"
                                placeholder="Phone Number (e.g. 0770000000)"
                                value={newMemberPhone}
                                onChange={(e) => setNewMemberPhone(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <select
                                value={newMemberRole}
                                onChange={(e) => setNewMemberRole(e.target.value)}
                                className={styles.inputField}
                            >
                                <option value="Member">Member</option>
                                <option value="Chairman">Chairman</option>
                                <option value="Treasurer">Treasurer</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder={`Initial Paid Amount (${group.currency})`}
                                value={newMemberAmount}
                                onChange={(e) => setNewMemberAmount(e.target.value)}
                                className={styles.inputField}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button fullWidth variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                            <Button fullWidth onClick={handleAddMember}>Add</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Payment Modal */}
            {isLogPaymentOpen && (
                <div className={styles.modalOverlay} style={{ alignItems: 'flex-end', padding: 0 }}>
                    <div className={styles.bottomSheet}>
                        <div className={styles.sheetHeader}>
                            <div className={styles.dragHandle} />
                            <div className={styles.sheetTitleRow}>
                                <h3>Log payment</h3>
                                <button onClick={() => setIsLogPaymentOpen(false)} className={styles.closeButton}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.sheetContent}>
                            {/* Member Selection (since we are likely default admin/chairman) */}
                            {isPrivileged && (
                                <div className={styles.inputGroup}>
                                    <label>For Member</label>
                                    <select
                                        value={paymentMemberId}
                                        onChange={(e) => setPaymentMemberId(e.target.value)}
                                        className={styles.inputField}
                                        style={{ background: '#fff' }}
                                    >
                                        {groupMembers.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className={styles.uploadArea}>
                                {receiptImage ? (
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <img src={receiptImage} alt="Receipt" style={{ maxHeight: 150, width: '100%', objectFit: 'contain', marginBottom: 12, borderRadius: 8 }} />
                                        <button onClick={() => setReceiptImage(null)} style={{ color: '#EF4444', background: 'none', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Remove image</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.uploadIcon}>
                                            <Receipt size={24} strokeWidth={1.5} />
                                        </div>
                                        <span className={styles.uploadText}>Upload receipt</span>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleFileSelect}
                                            accept="image/*"
                                        />

                                        <div className={styles.uploadButtons}>
                                            <button className={styles.uploadBtn} onClick={triggerFileInput}>
                                                <Camera size={18} strokeWidth={1.5} /> Camera
                                            </button>
                                            <button className={styles.uploadBtn} onClick={triggerFileInput}>
                                                <ImageIcon size={18} strokeWidth={1.5} /> Gallery
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Amount Input */}
                            <div className={styles.inputGroup}>
                                <label>Amount ({group.currency})</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 150,000"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className={styles.inputField}
                                />
                            </div>

                            {/* Note Input */}
                            <div className={styles.inputGroup}>
                                <label>Note (optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. February contribution"
                                    value={paymentNote}
                                    onChange={(e) => setPaymentNote(e.target.value)}
                                    className={styles.inputField}
                                />
                            </div>

                            <button className={styles.submitButton} onClick={handleLogPayment}>
                                Submit payment
                            </button>
                            <div style={{ height: 24 }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Back Header */}
            <div className={styles.header} style={{ justifyContent: 'flex-start', gap: 16 }}>
                <Link href="/home">
                    <ArrowLeft size={24} color="#111" />
                </Link>
                <div>
                    <h2 className={styles.pageTitle} style={{ marginBottom: 2 }}>{group.name}</h2>
                    {group.inviteCode && (
                        <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>Invite Code:</span>
                            <button
                                onClick={handleCopyInvite}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'none', border: 'none', padding: 0, cursor: 'pointer'
                                }}
                                title="Click to copy"
                            >
                                <span style={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    background: inviteCopied ? '#DCFCE7' : '#F3F4F6',
                                    padding: '2px 6px',
                                    borderRadius: 6,
                                    border: inviteCopied ? '1px solid #86EFAC' : '1px solid #E5E7EB',
                                    color: inviteCopied ? '#166534' : '#374151',
                                    transition: 'all 0.2s',
                                    userSelect: 'all'
                                }}>
                                    {group.inviteCode}
                                </span>
                                {inviteCopied ? <Check size={14} color="#166534" /> : <Copy size={14} color="#6B7280" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs Header */}
            <div className={styles.tabsHeader}>
                {["Overview", "Members", "Receipts"].map(tab => (
                    <button
                        key={tab}
                        className={clsx(styles.tab, activeTab === tab && styles.activeTab)}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {activeTab === "Overview" && (
                    <>
                        {/* Progress Card */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3>Group progress</h3>
                                <span className={styles.percentText}>{progressPercent}%</span>
                            </div>
                            <div className={styles.progressBarBg}>
                                <div className={styles.progressBarFill} style={{ width: `${Math.min(100, progressPercent)}%` }}></div>
                            </div>
                            <div className={styles.progressStats}>
                                <span>{group.currency} {totalSaved.toLocaleString()} saved</span>
                                <span className={styles.remaining}>
                                    {remainingCheck > 0
                                        ? `${group.currency} ${remainingCheck.toLocaleString()} to go`
                                        : `${group.currency} ${surplusAmount.toLocaleString()} surplus`}
                                </span>
                            </div>
                            <div className={styles.dueDate}>
                                <Clock size={16} /> Next contribution due {group.nextDue}
                            </div>
                        </div>

                        {/* Log Payment Trigger Button */}
                        <button
                            className={styles.fab}
                            onClick={() => setIsLogPaymentOpen(true)}
                            style={{ position: 'fixed', bottom: 84, right: 24, zIndex: 50 }}
                        >
                            <Plus size={24} color="#fff" />
                        </button>

                        {/* Leaderboard Section */}
                        <div className={styles.sectionHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h3>Leaderboard</h3>
                                {isPrivileged && (
                                    <button
                                        onClick={() => setIsAddMemberOpen(true)}
                                        className={styles.iconButton}
                                    >
                                        <UserPlus size={14} color="#000" />
                                    </button>
                                )}
                            </div>
                            <div className={styles.toggles}>
                                <button
                                    className={clsx(styles.toggle, leaderboardFilter === "Amount" && styles.activeToggle)}
                                    onClick={() => setLeaderboardFilter("Amount")}
                                >
                                    By Amount
                                </button>
                                <button
                                    className={clsx(styles.toggle, leaderboardFilter === "Consistency" && styles.activeToggle)}
                                    onClick={() => setLeaderboardFilter("Consistency")}
                                >
                                    By Consistency
                                </button>
                            </div>
                        </div>

                        <div className={styles.list}>
                            {[...groupMembers]
                                .sort((a, b) => {
                                    if (leaderboardFilter === "Amount") return b.amount - a.amount;
                                    if (leaderboardFilter === "Consistency") {
                                        return (parseInt(b.streak.replace('w', '')) || 0) - (parseInt(a.streak.replace('w', '')) || 0);
                                    }
                                    return 0;
                                })
                                .map((m, index) => (
                                    <div key={m.id} className={styles.listItem}>
                                        <div className={clsx(styles.rankBadge, styles[`rank${index + 1}`])}>
                                            {index + 1}
                                        </div>
                                        <AvatarInitials name={m.name} color={m.color} />
                                        <span className={styles.memberName}>{m.name}</span>
                                        <span className={styles.memberAmount}>{group.currency} {m.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                        </div>

                        {/* Recent Activity Section */}
                        <div style={{ marginTop: 24 }}>
                            {activities.length > 0 && (
                                <>
                                    <h3 className={styles.sectionLabel}>TODAY</h3>
                                    <div className={styles.activityList}>
                                        {activities.slice(0, 2).map((a) => {
                                            const isPayment = a.type === "payment";
                                            const isJoin = a.type === "join";
                                            const isApproval = a.type === "approval";

                                            let icon = <Clock size={20} strokeWidth={2} />;
                                            let title = "Activity";
                                            let desc = a.text;

                                            if (isPayment) {
                                                icon = <ArrowUpRight size={20} strokeWidth={2} />;
                                                title = "Payment logged";
                                                desc = `${a.user} logged ${group.currency} ${a.amount?.toLocaleString() || 0}`;
                                            } else if (isJoin) {
                                                icon = <UserPlus size={20} strokeWidth={2} />;
                                                title = "New member joined";
                                                desc = `${a.user} joined the group`;
                                            } else if (isApproval) {
                                                icon = <CheckCircle size={20} strokeWidth={2} />;
                                                title = "Receipt approved";
                                                desc = a.user === "You" ? `You approved receipt for ${a.text.replace("approved receipt from ", "")}` : a.text;
                                            }

                                            return (
                                                <div key={a.id} className={clsx(styles.activityCard, styles.activityCardFeatured)}>
                                                    <div className={clsx(styles.activityIconBox, styles.iconFeatured)}>
                                                        {icon}
                                                    </div>
                                                    <div className={styles.activityContent}>
                                                        <span className={styles.activityTitle}>{title}</span>
                                                        <span className={styles.activityDesc}>{desc}</span>
                                                        <span className={styles.activityTime}>{a.time}</span>
                                                    </div>
                                                    <div className={styles.unreadDot} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {activities.length > 2 && (
                                <>
                                    <h3 className={styles.sectionLabel}>THIS WEEK</h3>
                                    <div className={styles.activityList}>
                                        {activities.slice(2).map((a) => {
                                            const isPayment = a.type === "payment";
                                            const isJoin = a.type === "join";
                                            const isApproval = a.type === "approval";

                                            let icon = <Clock size={20} strokeWidth={2} />;
                                            let title = "Activity";
                                            let desc = a.text;

                                            if (isPayment) {
                                                icon = <ArrowUpRight size={20} strokeWidth={2} />;
                                                title = "Payment logged";
                                                desc = `${a.user} logged ${group.currency} ${a.amount?.toLocaleString() || 0}`;
                                            } else if (isJoin) {
                                                icon = <UserPlus size={20} strokeWidth={2} />;
                                                title = "New member joined";
                                                desc = `${a.user} joined the group`;
                                            } else if (isApproval) {
                                                icon = <CheckCircle size={20} strokeWidth={2} />;
                                                title = "Receipt approved";
                                                desc = a.user === "You" ? `You approved receipt for ${a.text.replace("approved receipt from ", "")}` : a.text;
                                            }

                                            return (
                                                <div key={a.id} className={styles.activityCard}>
                                                    <div className={clsx(styles.activityIconBox, styles.iconStandard)}>
                                                        {icon}
                                                    </div>
                                                    <div className={styles.activityContent}>
                                                        <span className={styles.activityTitle}>{title}</span>
                                                        <span className={styles.activityDesc}>{desc}</span>
                                                        <span className={styles.activityTime}>{a.time}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}

                {activeTab === "Members" && (
                    <div className={styles.membersList}>
                        {groupMembers.map((m) => (
                            <div key={m.id} className={styles.memberCard}>
                                <div className={styles.memberHeader}>
                                    <AvatarInitials name={m.name} color={m.color} />
                                    <div className={styles.memberInfo}>
                                        <div className={styles.nameRow}>
                                            <span className={styles.name}>{m.name}</span>
                                            {m.role === "Chairman" && (
                                                <span className={styles.adminBadge} style={{ background: '#F3E8FF', color: '#7E22CE' }}>
                                                    <Crown size={10} style={{ marginRight: 2 }} /> Chairman
                                                </span>
                                            )}
                                            {m.role === "Treasurer" && (
                                                <span className={styles.adminBadge} style={{ background: '#DBEAFE', color: '#2563EB' }}>
                                                    <Briefcase size={10} style={{ marginRight: 2 }} /> Treasurer
                                                </span>
                                            )}
                                            {m.role === "Admin" && <span className={styles.adminBadge}>Admin</span>}
                                            {m.role === "Member" && <span className={styles.roleBadge}>{m.role}</span>}
                                        </div>
                                        <div className={styles.streakRow}>
                                            <Flame size={14} color="#F97316" fill="#F97316" />
                                            <span className={styles.streakText}>{m.streak} streak</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.badgesRow}>
                                    {deriveBadges(m).map(badge => renderBadge(badge))}
                                </div>
                            </div>
                        ))}
                        {isPrivileged ? (
                            <Button fullWidth variant="outline" onClick={() => setIsAddMemberOpen(true)} style={{ marginTop: 24, borderStyle: 'dashed' }}>
                                <UserPlus size={18} style={{ marginRight: 8 }} /> Add Member
                            </Button>
                        ) : (
                            <Button fullWidth variant="outline" onClick={handleExitGroup} style={{ marginTop: 24, borderColor: '#EF4444', color: '#EF4444' }}>
                                <XCircle size={18} style={{ marginRight: 8 }} /> Exit Group
                            </Button>
                        )}
                    </div>
                )}

                {activeTab === "Receipts" && (
                    <>
                        <div className={styles.segmentedControl}>
                            <button
                                className={clsx(styles.segment, receiptsFilter === "Pending" && styles.activeSegment)}
                                onClick={() => setReceiptsFilter("Pending")}
                            >
                                Pending
                            </button>
                            <button
                                className={clsx(styles.segment, receiptsFilter === "All" && styles.activeSegment)}
                                onClick={() => setReceiptsFilter("All")}
                            >
                                All
                            </button>
                        </div>

                        {filteredReceipts.length === 0 ? (
                            <div className={styles.emptyReceipts}>
                                <div className={styles.emptyIcon}>
                                    <div className={styles.receiptIconInner}>
                                        <span>$</span>
                                    </div>
                                </div>
                                <span className={styles.emptyText}>No pending receipts</span>
                            </div>
                        ) : (
                            <div className={styles.receiptsList}>
                                {filteredReceipts.map(r => (
                                    <div key={r.id} className={styles.receiptCard} style={{ flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%' }}>
                                            <div style={{ flexShrink: 0 }}>
                                                <AvatarInitials name={r.user} color={r.textColor} />
                                            </div>
                                            <div className={styles.receiptInfo}>
                                                <div className={styles.receiptRow}>
                                                    <span className={styles.receiptUser}>{r.user}</span>
                                                    <span className={styles.receiptAmount}>{group.currency} {r.amount.toLocaleString()}</span>
                                                </div>
                                                <div className={styles.receiptRow}>
                                                    <span className={styles.receiptDesc}>{r.description}</span>
                                                    <span className={styles.receiptDate}>{r.date}</span>
                                                </div>
                                                <div className={styles.statusBadge}>
                                                    {r.status === "Approved" ? <Check size={12} strokeWidth={3} /> : <Clock size={12} strokeWidth={3} />}
                                                    {r.status}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Approve Action for Privileged Users */}
                                        {isPrivileged && r.status === "Pending" && (
                                            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleRejectReceipt(r.id)}>Reject</Button>
                                                <Button size="sm" onClick={() => handleApproveReceipt(r.id)}>Approve</Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <div style={{ height: 80 }}></div>
        </div>
    );
}
