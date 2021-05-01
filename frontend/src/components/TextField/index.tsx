import React from "react";
import styles from "./style.module.css";

interface TextFieldProps {
  label: string;
  textValue: string;
  size?: "big" | "small";
  // eslint-disable-next-line no-unused-vars
  onChangeHandler: (arg0: string) => void;
}

const TextField = ({
  label,
  textValue,
  size = "big",
  onChangeHandler,
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
    />
  );
};

export default TextField;
