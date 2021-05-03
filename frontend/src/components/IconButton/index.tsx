import React from "react";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./style.module.css";

interface IconButtonProps {
  icon: IconDefinition;
  handleOnClick: React.MouseEventHandler;
}

const IconButton = ({ icon, handleOnClick }: IconButtonProps) => (
  <button className={styles.button} type="button" onClick={handleOnClick}>
    <FontAwesomeIcon icon={icon} size="2x" />
  </button>
);

export default IconButton;
