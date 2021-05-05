import React from "react";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./style.module.css";

interface IconButtonProps {
  icon: IconDefinition;
  handleOnClick: React.MouseEventHandler;
  rotated?: boolean;
}

const IconButton = ({
  icon,
  handleOnClick,
  rotated = false,
}: IconButtonProps) => (
  <button className={styles.button} type="button" onClick={handleOnClick}>
    <FontAwesomeIcon
      icon={icon}
      size="2x"
      rotation={rotated ? 180 : undefined}
    />
  </button>
);

export default IconButton;
