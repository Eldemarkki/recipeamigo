import styles from "./Button.module.css";
import React, { forwardRef, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "small" | "medium";

export type RequiredButtonProps = {
  variant: ButtonVariant;
  size: ButtonSize;
  rectangular?: boolean;
  icon?: ReactNode;
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
      children,
      ...props
    },
    ref,
  ) => (
    <button
      {...props}
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
      {children}
    </button>
  ),
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
