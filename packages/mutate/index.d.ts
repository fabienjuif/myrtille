import { State, Action, AddListener, Subcriber } from "@myrtille/core";

export type Store<S> = {
  setState: (state: S) => void;
  getState: () => S;
  dispatch: (action: Action | string) => void;
  addListener: typeof AddListener<Store<S>>;
  subscribe: (
    path: string | Subcriber<S, Store<S>>,
    callback?: Subcriber<S, Store<S>>
  ) => () => void;
  mutate: (callback: (draft: S) => void) => void;
};

export default function createStore<
  STATE extends State = State,
  STORE extends Store<STATE> = Store<STATE>
>(init: STATE): STORE;
