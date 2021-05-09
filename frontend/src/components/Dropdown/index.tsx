import React, { ReactNode, useEffect, useState } from "react";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./style.module.css";
import IconButton from "../IconButton";

interface DropdownProps {
  aboveDrop: ReactNode;
  belowDrop: ReactNode;
  header: string;
}

const Dropdown = ({ aboveDrop, belowDrop, header }: DropdownProps) => {
  const [showDrop, setShowDrop] = useState(false);
  const [arrowFlipped, setArrowFlipped] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);

  useEffect(() => {
    const dropdownElement = document.getElementById("dropdown");
    const height = dropdownElement?.clientHeight;
    if (height) {
      setDropdownHeight(height);
    }
  });

  const toggleDrop = () => {
    setShowDrop(!showDrop);
    setArrowFlipped(!arrowFlipped);
  };

  return (
    <>
      <div className={styles.main} id="dropdown">
        {aboveDrop}
        <div className={styles.heading}>
          <p>{header}</p>
          <IconButton
            icon={faAngleDown}
            handleOnClick={toggleDrop}
            rotated={arrowFlipped}
          />
        </div>
      </div>
      {showDrop && (
        <div className={styles.drop} style={{ top: `${dropdownHeight}px` }}>
          <div>{belowDrop}</div>
        </div>
      )}
    </>
  );
};

export default Dropdown;
