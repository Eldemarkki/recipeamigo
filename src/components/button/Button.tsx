import React from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "small" | "medium";

export type RequiredButtonProps = {
  variant: ButtonVariant;
  size: ButtonSize;
};

export type ButtonProps = Partial<RequiredButtonProps>;

export const Button = ({
  variant = "primary",
  size = "medium",
  ref,
  ...props
}: ButtonProps & React.ComponentProps<"button">) => (
  <button
    {...props}
    className={[
      styles.buttonComponent,
      styles[variant],
      styles["size-" + size],
      props.className,
    ].join(" ")}
  />
);

export const CircularButton = ({
  variant = "primary",
  ref,
  ...props
}: ButtonProps & React.ComponentProps<"button">) => (
  <button
    {...props}
    className={[
      styles.buttonComponent,
      styles[variant],
      styles.circular,
      props.className,
    ].join(" ")}
  />
);
