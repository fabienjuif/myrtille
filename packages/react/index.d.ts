import * as React from "react";
import { Action, Store } from "@myrtille/core";

export declare function provider<STATE, STORE extends Store = Store<STATE>>(
  store: STORE
): (
  Component: any
) => (props: any) => React.FunctionComponentElement<React.ProviderProps<any>>;

export declare const Provider: <STATE, STORE extends Store = Store<STATE>>({
  store,
  children,
}: {
  store: STORE;
  children: any;
}) => React.FunctionComponentElement<React.ProviderProps<any>>;

export declare function useStore<
  STATE,
  STORE extends Store = Store<STATE>
>(): STORE;

export declare function useDispatch(): (action: Action | string) => void;

export declare function useListeners(): (listeners: Reaction[]) => () => void;

export declare function useStateAt<STATE>(path?: string): STATE;
