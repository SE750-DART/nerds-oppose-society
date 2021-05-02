import React from "react";
import styles from "./style.module.css";

interface TextFieldProps {
  label: string;
  textValue: string;
  size?: "big" | "small";
  onChangeHandler: (arg0: string) => void;
  disabled?: boolean;
}

const TextField = ({
  label,
  textValue,
  size = "big",
  onChangeHandler,
  disabled = false,
}: TextFieldProps) => {
  let sizeStyle: string = "";
  if (size === "big") {
    sizeStyle = styles.textfield__big;
  } else if (size === "small") {
    sizeStyle = styles.textfield__small;
  }

  return (
    <input
      className={`${styles.textfield} ${sizeStyle}`}
      placeholder={label}
      value={textValue}
      type="text"
      onChange={(e) => onChangeHandler(e.target.value)}
      disabled={disabled}
    />
  );
};

export default TextField;
