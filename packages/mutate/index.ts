import coreCreateStore, { BaseAction, Store } from '@myrtille/core'
import produce, { Draft } from 'immer'

interface MutateStore<State extends object, Action extends BaseAction>
  extends Store<State, Action> {
  mutate: (callback: (draftState: Draft<State>) => void) => void
}

export default function createStore<
  State extends object,
  Action extends BaseAction
>(intitialState: State): MutateStore<State, Action> {
  let store = coreCreateStore<State, Action>(intitialState)

  return {
    ...store,
    mutate: (callback) => {
      store.setState(produce(store.getState(), callback))
    },
  }
}
