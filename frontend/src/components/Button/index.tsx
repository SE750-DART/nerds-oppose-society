import React from "react";
import styles from "./style.module.css";

interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "big" | "small";
  type?: "button" | "submit" | "reset";
  text: string;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
}

const Button = ({
  variant = "primary",
  size = "big",
  type = "button",
  text,
  onClick,
  disabled = false,
}: ButtonProps) => {
  let buttonTypeStyle = "";
  if (variant === "primary") {
    buttonTypeStyle = styles.button__primary;
  } else if (variant === "secondary") {
    buttonTypeStyle = styles.button__secondary;
  }

  let buttonSizeStyle = "";
  if (size === "big") {
    buttonSizeStyle = styles.button__big;
  } else if (size === "small") {
    buttonSizeStyle = styles.button__small;
  }

  let buttonDisabledStyle = "";
  if (disabled) {
    buttonDisabledStyle = styles.button__disabled;
  }

  return (
    <button
      className={`${styles.button} ${buttonTypeStyle} ${buttonSizeStyle} ${buttonDisabledStyle}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
