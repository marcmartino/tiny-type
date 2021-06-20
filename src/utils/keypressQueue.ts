import { KeyboardEventHandler } from "react";
import { DefinitionNode } from "./artseyMap";
import { artseyRight } from "./artseyRight.gen";
import { KeyCode, Letter } from "./keycodes";

export type StackItem = { code: number; key: string; timestamp: number };

type KeydownStackItem<T extends DefinitionNode<any>> = StackItem & {
  action: "keydown";
  keymapTree?: T[keyof T];
  timerId: number; //ReturnType<typeof setTimeout>;
};

type KeyupStackItem = StackItem & {
  action: "keyup";
};

type KeypressStackItem<T extends DefinitionNode<any>> =
  | KeydownStackItem<T>
  | KeyupStackItem;

type StackDefinition<T extends KeypressStackItem<DefinitionNode<any>>> =
  T extends KeypressStackItem<infer DN> ? DN : never;

let keypressStack: KeypressStackItem<typeof artseyRight>[] = [];

export const onKeyDown =
  <T extends DefinitionNode<any>, L extends Letter>(
    mapping: T,
    keyValidation: (l: string) => l is L
  ): KeyboardEventHandler<HTMLInputElement> =>
  (e) => {
    console.log("down ", e.keyCode, e.key);
    const key = e.key;
    if (keyValidation(key)) {
      const timestamp = new Date().getTime();
      const prevKeydown = getPrevKeydown(keypressStack);
      timestamp - (prevKeydown?.timestamp || 0) <= 100 &&
        clearTimeout(prevKeydown?.timerId);
      keypressStack.unshift({
        code: e.keyCode,
        key,
        timestamp,
        action: "keydown",
        keymapTree: getKeymapTree(
          mapping,
          keypressStack,
          // @ts-ignore it doesn't like that key isn't a string literal
          key
        ),
        timerId: setTimeout(
          (stack: KeypressStackItem<T>) =>
            console.log(
              "keydown timer up",
              // @ts-ignore
              getLastChordKey(stack)
            ),
          100,
          keypressStack
        ),
      });
    }
  };

const getPrevKeydown = <S extends KeypressStackItem<DefinitionNode<any>>>(
  stack: S[]
): undefined | KeydownStackItem<StackDefinition<S>> => {
  if (stack.length) {
    const stackHead = stack[0];
    if (stackHead?.action === "keydown") {
      // @ts-ignore
      return stackHead; // TODO: fix type error here
    }
    return getPrevKeydown(stack.slice(1));
  }
  return undefined;
};

const getLastChordKey = <S extends KeypressStackItem<DefinitionNode<any>>>(
  stack: S[]
): undefined | Letter => getPrevKeydown(stack)?.keymapTree?.end;

export const onKeyUp =
  <L extends Letter>(
    keyValidation: (l: string) => l is L
  ): KeyboardEventHandler<HTMLInputElement> =>
  (e) => {
    //   console.log("up", e.keyCode, e.key);
    const key = e.key;
    if (keyValidation(key)) {
      keypressStack.unshift({
        code: e.keyCode,
        key,
        timestamp: new Date().getTime(),
        action: "keyup",
      });

      if (allPressesResolved(keypressStack)) {
        keypressStack = [];
      }
      console.table(keypressStack);
    }
  };

const allPressesResolved = <S extends KeypressStackItem<any>>(
  stack: S[]
): boolean => {
  if (stack.length === 0) return true;

  const lastStackItem = stack[0];

  if (lastStackItem?.action === "keydown") {
    return false;
  } else if (lastStackItem?.code && lastStackItem.key) {
    const restStack = stack.slice(1);
    const matchingKeydownItem = stackWithoutKeydownItem(
      lastStackItem.code,
      lastStackItem.key,
      restStack
    );
    return (
      matchingKeydownItem !== -1 &&
      allPressesResolved(restStack.filter((_, i) => i !== matchingKeydownItem))
    );
  }
  return false;
};

const stackWithoutKeydownItem = <S extends KeypressStackItem<any>>(
  code: StackItem["code"],
  key: StackItem["key"],
  stack: S[]
): number =>
  stack.reduce(
    (matchingI, stackItem, i) =>
      matchingI === -1 && stackItem.key === key && stackItem.code === code
        ? i
        : matchingI,
    -1
  );

const getKeymapTree = <T extends DefinitionNode<any>>(
  baseMapping: T,
  stack: KeypressStackItem<T>[],
  key: NonNullable<keyof T>
): T[keyof T] | undefined => {
  if (stack.length === 0) {
    return baseMapping[key];
  }
  if (stack[0]?.action === "keydown") {
    if (stack[0]?.keymapTree?.then) {
      // @ts-ignore
      return stack[0].keymapTree?.then?.[key];
    }
    console.error("treemap error");
    return undefined;
  }
  return getKeymapTree(baseMapping, stack, key);
};
