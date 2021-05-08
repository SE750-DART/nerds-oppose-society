import React, { ReactNode, useState } from "react";
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

  const toggleDrop = () => {
    setShowDrop(!showDrop);
    setArrowFlipped(!arrowFlipped);
  };

  return (
    <>
      <div className={styles.main}>
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
      <div
        className={`${styles.drop} ${
          showDrop ? styles.dropShow : styles.dropHide
        }`}
      >
        <div>{belowDrop}</div>
      </div>
    </>
  );
};

export default Dropdown;
