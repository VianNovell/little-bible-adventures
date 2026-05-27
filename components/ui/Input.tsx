import React from "react";
import styles from "./Input.module.css";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = true,
    className,
    id,
    ...props
}) => {
    const inputId = id || props.name;

    return (
        <div className={clsx(styles.container, fullWidth && styles.fullWidth, className)}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={clsx(styles.input, error && styles.hasError)}
                {...props}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};
