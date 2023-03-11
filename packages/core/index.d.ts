export type Action = { type: string; [key: string]: any };
export type State = Record<string, unknown>;

export type Subcriber<STATE, STORE> = (
  store: STORE,
  state: STATE,
  action: Action
) => void;

export type Reaction<STORE> = (store: STORE, action: Action) => void;

export declare function AddListener<STORE>(
  matcher: Matcher<STORE>,
  reaction: Reaction<STORE>
): () => void;

export declare function AddListener<STORE>(
  reaction: Reaction<STORE>
): () => void;

export type Store<STATE> = {
  setState: (state: STATE) => void;
  getState: () => STATE;
  dispatch: (action: Action | string) => void;
  addListener: typeof AddListener<Store<STATE>>;
  subscribe: (
    path: string | Subcriber<STATE, Store<STATE>>,
    callback?: Subcriber<STATE, Store<STATE>>
  ) => () => void;
};

export type Matcher<STORE> =
  | string
  | ((action: Action, store: STORE) => boolean)
  | { type: string }
  | RegExp;

export default function createStore<STATE, STORE extends Store<STATE>>(
  init: STATE
): STORE;
