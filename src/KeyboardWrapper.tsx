import React, { FunctionComponent, useState, MutableRefObject } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

interface Props {
  onChange: (input: string) => void;
  keyboardRef: any; //MutableRefObject<typeof Keyboard>;
}

export const KeyboardWrapper: FunctionComponent<Props> = ({
  onChange,
  keyboardRef,
}) => {
  const [layoutName, setLayoutName] = useState("default");

  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayoutName(layoutName === "default" ? "shift" : "default");
    }
  };

  return (
    <Keyboard
      keyboardRef={(r) => (keyboardRef.current = r)}
      layoutName={layoutName}
      onChange={onChange}
      onKeyPress={onKeyPress}
      onRender={() => console.log("Rendered")}
      //   theme="gh-theme-default myTheme1"
    />
  );
};
