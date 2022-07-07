import React from "react";
import styles from "./style.module.css";

interface InputFieldProps {
  label?: string;
  textValue: string;
  size?: "big" | "small";
  type?: "text" | "number";
  inputMode?: "text" | "decimal";
  onChange: (arg0: string) => void;
  disabled?: boolean;
}

const InputField = ({
  label = "",
  textValue,
  size = "big",
  type = "text",
  inputMode,
  onChange,
  disabled = false,
}: InputFieldProps) => {
  let sizeStyle = "";
  if (size === "big") {
    sizeStyle = styles.inputField__big;
  } else if (size === "small") {
    sizeStyle = styles.inputField__small;
  }

  return (
    <input
      className={`${styles.inputField} ${sizeStyle}`}
      placeholder={label}
      value={textValue}
      type={type}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
};

export default InputField;
