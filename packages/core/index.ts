const { getFromPath } = require('@myrtille/util')
const connectToDevtools = require('./devtools')

const matchListener = (matcher, reaction) => (store, action, ...args) => {
  if (
    // string matcher
    (typeof matcher === 'string' && matcher === action.type) ||
    // function matcher
    (typeof matcher === 'function' && matcher(action, store)) ||
    // object matcher (regexp or object)
    (typeof matcher === 'object' &&
      // object
      (matcher.type === action.type ||
        // regexp
        (typeof matcher.test === 'function' && matcher.test(action.type))))
  )
    reaction(store, action, ...args)
}

const matchSubscriber = (path, callback) => (store, oldState, ...args) => {
  const call = () => callback(store, oldState, ...args)

  if (path === undefined || path.trim() === '') {
    if (oldState !== store.getState()) call()
  } else if (
    getFromPath(oldState, path) !== getFromPath(store.getState(), path)
  ) {
    call()
  }
}

export type BaseAction = { type: string; [key: string]: any }

export type Reaction<State, Action extends BaseAction> = (
  store: Store<State, Action>,
  action: Action,
) => void

export type Subscriber<State, Action extends BaseAction> = (
  store: Store<State, Action>,
  oldState: State,
  action: Action,
) => void

interface AddListener<State, Action extends BaseAction> {
  (reaction: Reaction<State, Action>): () => void
  (action: Action, reaction: Reaction<State, Action>): () => void
  (actionType: string, reaction: Reaction<State, Action>): () => void
  (actionTypeRegexp: RegExp, reaction: Reaction<State, Action>): () => void
  (
    matchWith: (action: Action) => boolean,
    reaction: Reaction<State, Action>,
  ): () => void
}

interface Subscribe<State, Action extends BaseAction> {
  (subscriber: Subscriber<State, Action>): () => void
  (path: string, subscriber: Subscriber<State, Action>): () => void
}

interface Dispatch<Action extends BaseAction> {
  (action: Action): void
  (actionType: string): void
}

export interface Store<State, Action extends BaseAction> {
  getState: () => State
  setState: (state: State) => void
  dispatch: Dispatch<Action>
  addListener: AddListener<State, Action>
  subscribe: Subscribe<State, Action>
}

const createStore = <
  State extends object,
  Action extends BaseAction = BaseAction
>(
  initialState: State = {} as State,
): Store<State, Action> => {
  let store: Store<State, Action>
  let state = initialState
  let subscribers: Subscriber<State, Action>[] = []
  let reactions: Reaction<State, Action>[] = []
  let dispatching = false
  const nextDispatchs: Action[] = []

  const runAndNotify = (
    implementation,
    action: Action = { type: '@@DIRECT_MUTATION' } as Action,
  ) => {
    const oldState = store.getState()

    implementation()

    if (dispatching) return

    for (let i = 0; i < subscribers.length; i += 1) {
      subscribers[i](store, oldState, action)
    }
  }

  const dispatch = (action) => {
    let innerAction = action
    if (typeof action === 'string') {
      innerAction = { type: action as string } as Action
    }

    if (dispatching) {
      nextDispatchs.push(innerAction)
      return
    }

    runAndNotify(() => {
      dispatching = true

      for (let i = 0; i < reactions.length; i += 1) {
        reactions[i](store, innerAction)
      }

      dispatching = false
    }, innerAction)

    if (nextDispatchs.length) {
      const nextAction = nextDispatchs.shift()
      dispatch(nextAction)
    }
  }

  const removeListener = (callback) => {
    reactions = reactions.filter((reaction) => reaction !== callback)
  }

  const removeSubscriber = (callback) => {
    subscribers = subscribers.filter((subscriber) => subscriber !== callback)
  }

  const getState = () => state

  const setState = (newState) => {
    runAndNotify(() => {
      state = newState
    })
  }

  store = {
    contexts: {},
    setState,
    getState,
    dispatch,
    addListener: (action, reaction?) => {
      let newReaction
      if (reaction === undefined) {
        newReaction = action
      } else {
        newReaction = matchListener(action, reaction)
      }

      reactions = reactions.concat(newReaction)

      return () => removeListener(newReaction)
    },
    subscribe: (path, callback?) => {
      let newSubscriber
      if (callback === undefined) {
        newSubscriber = path
      } else {
        newSubscriber = matchSubscriber(path, callback)
      }

      subscribers = subscribers.concat(newSubscriber)

      return () => removeSubscriber(newSubscriber)
    },
  } as Store<State, Action>

  connectToDevtools(store)
  return store
}

export default createStore
