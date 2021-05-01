import React from "react";
import styles from "./style.module.css";

interface TextFieldProps {
  label: string;
  textValue: string;
  // eslint-disable-next-line no-unused-vars
  onChangeHandler: (arg0: string) => void;
}

const TextField = ({ label, textValue, onChangeHandler }: TextFieldProps) => (
  <input
    className={styles.textfield}
    placeholder={label}
    value={textValue}
    type="text"
    onChange={(e) => onChangeHandler(e.target.value)}
  />
);

export default TextField;
