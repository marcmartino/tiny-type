import { KeyCode, keycodes, Letter, lettersByCode } from "./keycodes";
import { Option, fromNullable } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { KeyCodeMapping } from "./artseyMap";

// const baseKeys: BaseKeysMapping = {
//   ...baseKeysL,
//   ...baseKeysR,
// };

// export const letterToKeycode = (keys: BaseKeysMapping): KeyCodeMapping =>
//   (Object.entries(keys) as [Letter, Letter][]).reduce(
//     (keyCodes, [keyLetter, valLetter]) => ({
//       ...keyCodes,
//       [keycodes[keyLetter]]: keycodes[valLetter],
//     }),
//     {} as KeyCodeMapping
//   );

// const remapKeycode = (mappings: KeyCodeMapping) => {
//   let prev: { code: KeyCode; timestamp: number };
//   return (code: KeyCode): Option<KeyCode> => fromNullable(mappings[code]);
// };

// export const baseRemap = remapKeycode(letterToKeycode(baseKeys));

// // this should eventually take into account a cursor position
// // so that delete and backspaceand enter can function properly
// export const updateText =
//   (newCode: KeyCode) =>
//   (prevText: string): string => {
//     const newChar = lettersByCode[newCode];

//     switch (newChar) {
//       case "Del":
//         return prevText.slice(0, prevText.length - 2);

//       default:
//         return prevText + newChar;
//     }
//   };
