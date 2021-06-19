import { pipe } from "fp-ts/lib/function";
import { Dispatch, FC, KeyboardEventHandler, useRef, useState } from "react";
import { isValidKeycode, KeyCode, keycodes, Letter } from "./utils/keycodes";
// import { baseRemap, updateText } from "./utils/keymappings";
import { map as oMap } from "fp-ts/Option";
import { artseyRTree } from "./utils/artseyMap";

interface Props {}
console.log(artseyRTree);

export const RedirectedInput: FC<Props> = ({}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState("");

  const onKeyPress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    console.log(e);

    const charCode = e.charCode;
    if (isValidKeycode(charCode) && inputRef.current) {
      //   pipe(charCode, baseRemap, oMap(updateText), oMap(setInputText));
    } else {
      console.log(e, e instanceof KeyboardEvent);
    }
  };

  return (
    <input
      value={inputText}
      ref={inputRef}
      className="text-black"
      onKeyPress={onKeyPress}
    />
  );
};
