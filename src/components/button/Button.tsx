import React from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";

export type RequiredButtonProps = {
  variant: ButtonVariant;
}

export type ButtonProps = Partial<RequiredButtonProps>;

export const Button = ({
  variant = "primary",
  ref,
  ...props
}: ButtonProps & React.ComponentProps<"button">) =>
  <button {...props} className={[styles.buttonComponent, styles[variant]].join(" ")} />;

export const CircularButton = ({
  variant = "primary",
  ref,
  ...props
}: ButtonProps & React.ComponentProps<"button">) =>
  <button {...props} className={[styles.buttonComponent, styles[variant], styles.circular].join(" ")} />;
