import { flow, pipe } from "fp-ts/lib/function";
import { Dispatch, FC, KeyboardEventHandler, useRef, useState } from "react";
import { isValidKeycode, KeyCode, keycodes, Letter } from "./utils/keycodes";
// import { baseRemap, updateText } from "./utils/keymappings";
import { map as oMap } from "fp-ts/Option";

import { artseyRight } from "./utils/artseyRight.gen";
import { DefinitionNode, isBaseKeyRLetter } from "./utils/artseyMap";
import { onKeyDown, onKeyUp } from "./utils/keypressQueue";
import { updateText } from "./utils/keymappings";

export const RedirectedInput: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState("");

  // const onKeyPress: KeyboardEventHandler<HTMLInputElement> = (e) => {
  //   console.log(e);

  //   const charCode = e.charCode;
  //   if (isValidKeycode(charCode) && inputRef.current) {
  //     //   pipe(charCode, baseRemap, oMap(updateText), oMap(setInputText));
  //   } else {
  //     console.log(e, e instanceof KeyboardEvent);
  //   }
  // };

  return (
    <input
      value={inputText}
      ref={inputRef}
      className="text-black"
      onKeyDown={onKeyDown(
        flow(
          (l) => updateText(l),
          (newText) => setInputText(newText)
        ),
        artseyRight,
        isBaseKeyRLetter
      )}
      onKeyUp={onKeyUp(isBaseKeyRLetter)}
    />
  );
};
