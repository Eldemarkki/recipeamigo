import React from "react";
import styled from "styled-components";

export type ButtonVariant = "primary" | "secondary";

export type RequiredButtonProps = {
  variant: ButtonVariant;
}

export type ButtonProps = Partial<RequiredButtonProps>;

export const BackgroundColorTable: Record<ButtonVariant, React.CSSProperties["backgroundColor"]> = {
  primary: "#f2c61d",
  secondary: "transparent"
};

export const BorderColorTable: Record<ButtonVariant, React.CSSProperties["borderColor"]> = {
  primary: "#d9b526",
  secondary: "#f5d34b"
};

export const HoverBackgroundColorTable: Record<ButtonVariant, React.CSSProperties["backgroundColor"]> = {
  primary: "#e5bb1b",
  secondary: "transparent"
};

export const HoverBorderColorTable: Record<ButtonVariant, React.CSSProperties["borderColor"]> = {
  primary: "#d9b526",
  secondary: "#e1bd2b"
};

export const ButtonComponent = styled.button<RequiredButtonProps>(props => ({
  backgroundColor: BackgroundColorTable[props.variant],
  borderWidth: 3,
  borderStyle: "solid",
  borderColor: BorderColorTable[props.variant],
  color: "inherit",
  display: "flex",
  justifyContent: "center",
  borderRadius: "1rem",
  alignItems: "center",
  "&:hover": {
    backgroundColor: HoverBackgroundColorTable[props.variant],
    borderColor: HoverBorderColorTable[props.variant],
    cursor: "pointer",
  },
}));


export const Button = ({
  variant = "primary",
  ref,
  ...props
}: ButtonProps & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) =>
  <ButtonComponent
    variant={variant}
    {...props}
  />;

export const CircularButton = styled(Button)({
  borderRadius: "50%",
  aspectRatio: "1",
  display: "flex",
});
