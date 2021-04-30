import React from "react";
import styles from "./style.module.css";

interface ButtonProps {
  buttonType: "primary" | "secondary";
  buttonSize?: "big" | "small";
  text: string;
  handleOnClick: React.MouseEventHandler;
  disabled?: boolean;
}

const Button = ({
  buttonType,
  buttonSize = "big",
  text,
  handleOnClick,
  disabled = false,
}: ButtonProps) => {
  let buttonTypeStyle: string = "";
  if (buttonType === "primary") {
    buttonTypeStyle = styles.button__primary;
  } else if (buttonType === "secondary") {
    buttonTypeStyle = styles.button__secondary;
  }

  let buttonSizeStyle: string = "";
  if (buttonSize === "big") {
    buttonSizeStyle = styles.button__big;
  } else if (buttonSize === "small") {
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
