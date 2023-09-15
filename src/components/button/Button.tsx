import { Spinner } from "../spinner/Spinner";
import styles from "./Button.module.css";
import React, { forwardRef, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "small" | "medium";

export type RequiredButtonProps = {
  variant: ButtonVariant;
  size: ButtonSize;
  rectangular?: boolean;
  icon?: ReactNode;
  loading?: boolean;
};

export type ButtonProps = Partial<RequiredButtonProps>;

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & React.ComponentProps<"button">
>(
  (
    {
      variant = "primary",
      size = "medium",
      type = "button",
      rectangular = false,
      loading = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        {...props}
        disabled={props.disabled || loading}
        ref={ref}
        type={type}
        className={[
          props.className,
          styles.buttonComponent,
          styles[variant],
          styles["size-" + size],
          rectangular ? styles.rectangular : "",
        ].join(" ")}
      >
        {props.icon}
        {loading ? <Spinner /> : children}
      </button>
    );
  },
);

Button.displayName = "Button";

export const CircularButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & React.ComponentProps<"button">
>(({ variant = "primary", type = "button", ...props }, ref) => (
  <button
    {...props}
    type={type}
    ref={ref}
    className={[
      styles.buttonComponent,
      styles[variant],
      styles.circular,
      props.className,
    ].join(" ")}
  />
));

CircularButton.displayName = "CircularButton";
