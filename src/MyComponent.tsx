import React, { FunctionComponent, useState, useRef, ChangeEvent } from "react";
import Keyboard from "react-simple-keyboard";
import { KeyboardWrapper } from "./KeyboardWrapper";

const MyComponent = () => {
  const [input, setInput] = useState("");
  const keyboard = useRef<typeof Keyboard>(null);

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>): void => {
    const input = event.target.value;
    setInput(input);

    // @ts-ignore
    keyboard.current.setInput(input);
  };

  return (
    <div>
      <input
        className=" text-black"
        value={input}
        placeholder={"Tap on the virtual keyboard to start"}
        onChange={(e) => onChangeInput(e)}
      />
      <KeyboardWrapper keyboardRef={keyboard} onChange={setInput} />
    </div>
  );
};

export default MyComponent;
