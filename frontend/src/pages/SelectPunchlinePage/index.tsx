import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "./style.module.css";
import Dropdown from "../../components/Dropdown";
import PlayerList from "../../components/PlayerList";
import ProgressBar from "../../components/ProgressBar";
import PunchlineCard from "../../components/PunchlineCard";
import Button from "../../components/Button";

interface Punchline {
  id: string;
  text: string;
  blurred: boolean;
}

const SelectPunchlinePage = () => {
  const memoryHistory = useHistory();

  const dummyPunchlines: Punchline[] = [
    {
      id: "1",
      text: "Me time.",
      blurred: false,
    },
    {
      id: "2",
      text:
        "Looking in the mirror, applying lipstick, and whispering “tonight, you will have sex with Tom Cruise.”",
      blurred: true,
    },
    {
      id: "3",
      text: "The violation of our most basic human rights.",
      blurred: true,
    },
    {
      id: "4",
      text:
        "Getting married, having a few kids, buying some stuff, retiring to Florida, and dying..",
      blurred: true,
    },
    {
      id: "5",
      text: "Dark and mysterious forces beyond our control.",
      blurred: true,
    },
    {
      id: "6",
      text: "Not vaccinating my children because I am stupid.",
      blurred: true,
    },
    {
      id: "7",
      text: "Rap music.",
      blurred: true,
    },
    {
      id: "8",
      text: "Listening to her problems without trying to solve them.",
      blurred: true,
    },
    {
      id: "9",
      text: "Preteens.",
      blurred: true,
    },
    {
      id: "10",
      text: "Alcoholism.",
      blurred: true,
    },
  ];

  const [punchlineSelected, setPunchlineSelected] = useState("");
  const [punchlines, setPunchlines] = useState<Punchline[]>([]);
  const [waiting, setWaiting] = useState(true);
  const [finishedReading, setFinishedReading] = useState(false);

  // This is only to demonstrate the full user flow without the backend connected.
  // This can be a little buggy sometimes (usually when you edit something and hot reload),
  // and it always seems to run one more time than it needs to.
  // But I figure it won't matter because it's about to be deleted.
  // TODO: Load in the real punchlines via setPunchlines from the backend and delete this hook
  useEffect(() => {
    const loadPunchlines = setTimeout(
      () => setPunchlines(dummyPunchlines),
      3000
    );
    return () => clearTimeout(loadPunchlines);
  }, [waiting]);

  useEffect(() => {
    if (punchlines.length !== 0) {
      setWaiting(false);

      if (punchlines.every((value) => !value.blurred)) {
        setFinishedReading(true);
      }
    }
  }, [punchlines]);

  let promptMessage: string = "";
  if (waiting) {
    promptMessage = "Waiting on players to choose punchlines...";
  } else if (!finishedReading) {
    promptMessage = "Tap to reveal each punchline!";
  } else {
    promptMessage = "Choose the best punchline!";
  }

  const selectPunchline = (text: string, index: number) => {
    if (finishedReading) {
      if (text === punchlineSelected) {
        setPunchlineSelected("");
      } else {
        setPunchlineSelected(text);
      }
    } else {
      const newPunchlines = [...punchlines];
      newPunchlines[index] = {
        ...punchlines[index],
        blurred: false,
      };
      setPunchlines(newPunchlines);
    }
  };

  return (
    <>
      <Dropdown
        aboveDrop={<h4 style={{ textAlign: `center` }}>Round X of X</h4>}
        belowDrop={<PlayerList gameState="midround" />}
        header="Scoreboard"
      />

      <div className={styles.container}>
        <p className={styles.theManText}>You are The Man™.</p>
        <p style={{ fontStyle: `italic` }}>{promptMessage}</p>

        <div
          className={`${styles.setup} ${
            waiting ? styles.setupNoGradient : undefined
          }`}
        >
          <h5>The Setup:</h5>
          <h2>Daddy, why is mommy crying?</h2>
        </div>

        {waiting && <ProgressBar playersChosen={0} playersTotal={0} />}

        {punchlines &&
          punchlines.map((punchline, index) => (
            <PunchlineCard
              key={punchline.id}
              text={punchline.text}
              handleOnClick={() => selectPunchline(punchline.text, index)}
              status={
                finishedReading && punchline.text === punchlineSelected
                  ? "selected"
                  : "available"
              }
              blurred={punchline.blurred}
            />
          ))}
      </div>

      {punchlineSelected && (
        <div className={styles.bottomBtns}>
          <div className={styles.btnNah}>
            <Button
              text="Nah"
              handleOnClick={() => setPunchlineSelected("")}
              variant="secondary"
            />
          </div>
          <div className={styles.btnSend}>
            <Button
              text="Send it"
              handleOnClick={() => {
                setPunchlineSelected("");
                memoryHistory.push("/postRound");
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SelectPunchlinePage;
