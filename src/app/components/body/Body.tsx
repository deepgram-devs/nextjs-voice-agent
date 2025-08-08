"use client";

import { ListenModel, SpeechModel, ThinkModel } from "@/app/lib/Models"
import { Mic } from "../mic/Mic";
import Styles from "./Body.module.css";
import { useState } from "react";

export const Body = () => {
    const [micState, setMicState] = useState<"open" | "loading" | "closed">("closed");

    const connect = () => {
        setMicState("loading");

        fetch("/api/connect", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                listenModel: ListenModel.General,
                thinkModel: ThinkModel.Claude,
                speechModel: SpeechModel.Thalia
            })
        }).then(response => {
            if (response.ok) {
                setMicState("open");
            } else {
                setMicState("closed");
            }
        }).catch(() => {
            setMicState("closed");
        })
    }
  return (
    <main className={Styles.body}>
        <Mic state={micState} />
        <form>
            <h2 className={Styles.heading}>Configuration</h2>
            <label>
                Listen Model:
                <select name="listen">
                    <option value={ListenModel.General}>General Purpose</option>
                    <option value={ListenModel.Medical}>Medical</option>
                </select>
            </label>
            <label>
                Think Model:
                <select name="think">
                    <option value={ThinkModel.Claude}>Claude</option>
                    <option value={ThinkModel.GPT}>GPT</option>
                </select>
            </label>
            <label>
                Speech Model:
                <select name="speech">
                    <option value={SpeechModel.Thalia}>Thalia</option>
                    <option value={SpeechModel.Andromeda}>Andromeda</option>
                    <option value={SpeechModel.Helena}>Helena</option>
                    <option value={SpeechModel.Apollo}>Apollo</option>
                    <option value={SpeechModel.Arcas}>Arcas</option>
                    <option value={SpeechModel.Aries}>Aries</option>
                </select>
            </label>
            <button type="button" onClick={connect}>Connect</button>
        </form>
    </main>
  );
}