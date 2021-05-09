import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import styles from "./style.module.css";

interface PunchlineCardProps {
  text: string;
  handleOnClick?: () => void;
  status?: "available" | "selected" | "submitted";
  newCard?: boolean;
  selectedNum?: 1 | 2 | 3;
  blurred?: boolean;
}

const PunchlineCard = ({
  text,
  handleOnClick,
  status = "available",
  newCard = false,
  selectedNum,
  blurred = false,
}: PunchlineCardProps) => {
  // Max length of a punchline before it needs to be made smaller to fit
  const textBreakpoint: number = 69;

  let textStyle: string = "";
  if (text.length > textBreakpoint) {
    textStyle = styles.textSmall;
  }

  let cardStyle: string = styles.punchlineAvailable;
  if (status === "selected") {
    cardStyle = styles.punchlineSelected;
  } else if (status === "submitted") {
    cardStyle = styles.punchlineSubmitted;
  }

  return (
    <div
      className={`${styles.punchline} ${cardStyle}`}
      role="button"
      onClick={handleOnClick}
      onKeyDown={handleOnClick}
      tabIndex={0}
    >
      {newCard && (
        <div className={`${styles.indicator} ${styles.newIndicator}`}>
          <FontAwesomeIcon icon={faStar} />
        </div>
      )}
      {selectedNum && (
        <div className={`${styles.indicator} ${styles.numIndicator}`}>
          <h5>{selectedNum}</h5>
        </div>
      )}
      <p
        className={`${textStyle} ${blurred ? styles.textBlurred : undefined}`}
        style={{ transition: "0.3s" }}
      >
        {text}
      </p>
    </div>
  );
};

export default PunchlineCard;
