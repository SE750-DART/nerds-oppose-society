import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "./style.module.css";
import Dropdown from "../../components/Dropdown";
import PlayerList from "../../components/PlayerList";
// import ProgressBar from "../../components/ProgressBar";
import PunchlineCard from "../../components/PunchlineCard";
import Button from "../../components/Button";

const SelectPunchlinePage = () => {
  const memoryHistory = useHistory();

  const dummyPunchlines: {
    id: string;
    text: string;
    blurred: boolean;
  }[] = [
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
  const [punchlines, setPunchlines] = useState(dummyPunchlines);
  const [finishedReading, setFinishedReading] = useState(false);

  useEffect(() => {
    if (punchlines.every((value) => !value.blurred)) {
      setFinishedReading(true);
    }
  }, [punchlines]);

  const selectPunchline = (text: string) => {
    if (text === punchlineSelected) {
      setPunchlineSelected("");
    } else {
      setPunchlineSelected(text);
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
        <p style={{ fontStyle: `italic` }}>Tap to reveal each punchline!</p>

        <div className={styles.setup}>
          <h5>The Setup:</h5>
          <h2>Daddy, why is mommy crying?</h2>
        </div>

        {/* <div className={styles.progress}> */}
        {/*   <ProgressBar playersChosen={0} playersTotal={0} /> */}
        {/* </div> */}

        {punchlines.map((punchline, index) => (
          <PunchlineCard
            key={punchline.id}
            text={punchline.text}
            handleOnClick={() => {
              if (finishedReading) {
                selectPunchline(punchline.text);
              } else {
                const newPunchlines = [...punchlines];
                newPunchlines[index] = { ...punchlines[index], blurred: false };
                setPunchlines(newPunchlines);
              }
            }}
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
