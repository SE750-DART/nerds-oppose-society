import React, { CSSProperties } from "react";
import styles from "./style.module.css";

interface SetupProps {
  setupText: string;
}

const Setup = ({ setupText }: SetupProps) => {
  let setupSize: CSSProperties = {};
  if (setupText.length > 75) {
    setupSize = { fontSize: "24px" };
  } else if (setupText.length > 45) {
    setupSize = { fontSize: "32px" };
  }

  return (
    <div className={`${styles.setup}`}>
      <h5>The Setup:</h5>
      <h2 style={setupSize}>{setupText}</h2>
    </div>
  );
};

export default Setup;
