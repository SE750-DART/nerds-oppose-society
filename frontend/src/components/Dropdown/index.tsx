import React, { ReactNode } from "react";
import styles from "./style.module.css";

interface DropdownProps {
  aboveDrop: ReactNode;
  belowDrop: ReactNode;
  header: string;
}

const Dropdown = ({ aboveDrop, belowDrop, header }: DropdownProps) => (
  <div className={styles.main}>
    {aboveDrop}
    <h4>{header}</h4>
    <div className={styles.drop}>{belowDrop}</div>
  </div>
);

export default Dropdown;
