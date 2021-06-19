import { KeyCode, Letter } from "./keycodes";
import * as NEA from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import { flow, pipe } from "fp-ts/lib/function";

export type BaseKeysMapping = Record<Letter, Letter>;
export type KeyCodeMapping = Readonly<Record<KeyCode, KeyCode>>;

type DoublePress<C extends Letter> = `${C}${C}`;
type TriplePress<C extends Letter> = `${C}${C}${C}`;
type QuadruplePress<C extends Letter> = `${C}${C}${C}${C}`;

type DoublePressR = DoublePress<keyof typeof baseKeysR>;
type TriplePressR = TriplePress<keyof typeof baseKeysR>;
type QuadPressR = QuadruplePress<keyof typeof baseKeysR>;

export type BaseKeyRLetter = keyof typeof baseKeysR;

type PressKey<B extends Letter> =
  | DoublePress<B>
  | TriplePress<B>
  | QuadruplePress<B>;

export const baseKeysR = {
  j: "a",
  k: "r",
  l: "t",
  ";": "s",
  m: "e",
  ",": "y",
  ".": "i",
  "/": "o",
};

const singlePressKeysR: [[BaseKeyRLetter], Letter][] = (
  Object.entries(baseKeysR) as [BaseKeyRLetter, Letter][]
).map(([x, y]) => [[x], y]);

export const doublePressKeysR: [[BaseKeyRLetter, BaseKeyRLetter], Letter][] = [
  [["m", "/"], "b"],
  [["m", ","], "c"],
  [[".", "/"], "n"],
  [["j", "k"], "f"],
  [["k", "l"], "g"],
  [[",", "."], "u"],
  [["m", "."], "h"],
  [["k", ";"], "v"],
  [["l", ";"], "j"],
  [["j", ";"], "w"],
  [[",", "/"], "k"],
  [["j", ","], "."],
  [["j", "."], ","],
  [["j", "/"], "/"],
  [["l", "."], "!"],
  [["k", "."], "Del"],
  // "m;": "Ctrl",
  // ",;": "GUI",
  // "k,": "Shift",
  // "mk": "Backspace",
  // ".;": "Alt",
];

export const triplePressKeysR: [
  [BaseKeyRLetter, BaseKeyRLetter, BaseKeyRLetter],
  Letter
][] = [
  [[",", ".", "/"], "m"],
  [["j", "k", "l"], "d"],
  [["m", ".", "/"], "p"],
  [["j", "l", ";"], "q"],
  [["k", "l", ";"], "x"],
  [["m", ",", "."], "l"],
  [["j", ",", "."], ","],
  // "jk/": "Esc",
];

export const quadPressKeysR: [
  [BaseKeyRLetter, BaseKeyRLetter, BaseKeyRLetter, BaseKeyRLetter],
  Letter
][] = [
  [["j", "k", "l", ";"], "z"],
  [["m", ",", ".", "/"], " "],
  // "jkl/": "Tab",
  // "mkl;": "Shift",
  // "j,./": "Caps",
];

export const baseKeysL = {
  a: "s",
  s: "t",
  d: "r",
  f: "a",
  z: "o",
  x: "i",
  c: "y",
  v: "e",
} as const;

export type DefinitionNode<C extends Letter> = Partial<
  Record<
    C,
    { end?: Letter; then: DefinitionNode<C> } | { end: Letter; then: undefined }
  >
>;

const permute = <M>(xs: M[]): M[][] => {
  let result = [] as M[][];
  if (xs.length === 0) return [];
  if (xs.length === 1) return [xs];

  for (let i = 0; i < xs.length; i++) {
    const currentNum = xs[i] as M;
    const remainingNums = xs.slice(0, i).concat(xs.slice(i + 1));
    const remainingNumsPermuted = permute(remainingNums);
    for (let j = 0; j < remainingNumsPermuted.length; j++) {
      const permutedArray = [currentNum].concat(
        remainingNumsPermuted[j] as M[]
      );
      result.push(permutedArray);
    }
  }
  return result;
};

const cloneDefNode = <M extends Letter>(
  defNode: DefinitionNode<M>
): DefinitionNode<M> => {
  const clone = {} as DefinitionNode<M>;
  for (const l in defNode) {
    if (Object.prototype.hasOwnProperty.call(defNode, l)) {
      const nodeVals = defNode[l];

      clone[l] = {
        end: nodeVals?.end,
        then: nodeVals?.then ? cloneDefNode(nodeVals.then) : undefined,
      } as DefinitionNode<M>[M];
    }
  }
  return clone;
};

const genKeyTranslationTree = <C extends Letter>(
  simulDefs: [C[], Letter][],
  node: DefinitionNode<C> = {}
): DefinitionNode<C> =>
  pipe(
    simulDefs,
    NEA.fromArray,
    O.map(
      //   flow(
      //     (defs) => [NEA.head(defs), NEA.tail(defs)] as const,
      //     ([[simulKey, endVal], tail]) =>
      //       simulKey.reduce(
      //         (defNode, keyLetter) => lettersToTree([keyLetter], defNode),
      //         {} as DefinitionNode<C>
      //       )
      //   )
      NEA.reduce({} as DefinitionNode<C>, lettersToTree)
    ),
    O.match(
      () => node,
      (defNode) => defNode
    )
  );

const lettersToTree = <C extends Letter>(
  prev: DefinitionNode<C>,
  [keys, end]: [C[], Letter]
): DefinitionNode<C> => {
  const defNode = cloneDefNode(prev);
  //   permute(keys).forEach((ls) => {
  //     let prevRef = defNode;
  //     for (let i = 0; i < ls.length; i++) {
  //       const element = ls[i] as C;
  //       let elementObj = prevRef[element];
  //       if (elementObj === undefined) {
  //         prevRef[element] = { then: {} as DefinitionNode<C> };
  //       }

  //       if (i === ls.length - 1 && typeof prevRef[element] === "object") {
  //         prevRef[element]?.end && console.error("overwriting end prop", prevRef);
  //         prevRef[element].end = end;
  //         // prevRef[element].then ??= {} as DefinitionNode<C>;
  //       }

  //       if (prevRef[element]?.then) {
  //         prevRef = prevRef[element].then;
  //       }
  //     }
  //   });
  //   return defNode;
  return permute(keys).reduce(addLettersGroupToNode(end), defNode);
};

const addLettersGroupToNode =
  (end: Letter) =>
  <C extends Letter>(node: DefinitionNode<C>, xs: C[]): DefinitionNode<C> => {
    return xs[0]
      ? {
          ...node,
          [xs[0]]: {
            ...(node[xs[0]] || {}),
            ...(xs.length === 1 ? { end } : {}),
            then: addLettersGroupToNode(end)(
              { ...(node[xs[0]]?.then || {}) },
              xs.slice(1)
            ),
          },
        }
      : node;
  };

export const artseyRTree = genKeyTranslationTree([
  ...singlePressKeysR,
  ...doublePressKeysR,
  ...triplePressKeysR,
  ...quadPressKeysR,
]);
