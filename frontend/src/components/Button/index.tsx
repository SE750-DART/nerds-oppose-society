import React from "react";
import styles from "./style.module.css";

interface ButtonProps {
  variant: "primary" | "secondary";
  size?: "big" | "small";
  text: string;
  handleOnClick: React.MouseEventHandler;
  disabled?: boolean;
}

const Button = ({
  variant,
  size = "big",
  text,
  handleOnClick,
  disabled = false,
}: ButtonProps) => {
  let buttonTypeStyle: string = "";
  if (variant === "primary") {
    buttonTypeStyle = styles.button__primary;
  } else if (variant === "secondary") {
    buttonTypeStyle = styles.button__secondary;
  }

  let buttonSizeStyle: string = "";
  if (size === "big") {
    buttonSizeStyle = styles.button__big;
  } else if (size === "small") {
    buttonSizeStyle = styles.button__small;
  }

  let buttonDisabledStyle: string = "";
  if (disabled) {
    buttonDisabledStyle = styles.button__disabled;
  }

  return (
    <button
      className={`${styles.button} ${buttonTypeStyle} ${buttonSizeStyle} ${buttonDisabledStyle}`}
      type="button"
      onClick={handleOnClick}
    >
      {text}
    </button>
  );
};

export default Button;
