const produce = require('immer').default
const { getFromPath } = require('./util')
const connectToDevtools = require('./devtools')

const matchListener = (matcher, callback) => (store, action, ...args) => {
  if (typeof matcher === 'string' && matcher === action.type) callback(store, action, ...args)
  else if (typeof matcher === 'object' && matcher.type === action.type) callback(store, action, ...args)
  // TODO: regexp
  // TODO: function
}

const matchSubscriber = (path, callback) => (store, oldState, ...args) => {
  if (getFromPath(oldState, path) !== getFromPath(store.getState(), path)) {
    callback(store, oldState, ...args)
  }
}

const createStore = (init) => {
  let store
  let state = init
  let subscribers = []
  let reactions = []
  let dispatching = false
  const nextDispatchs = []

  const runAndNotify = (implementation, action = { type: '@@DIRECT_MUTATION' }) => {
    const oldState = store.getState()

    implementation()

    if (dispatching) return

    if (oldState !== store.getState()) {
      for (let i = 0; i < subscribers.length; i += 1) {
        subscribers[i](store, oldState, action)
      }
    }
  }

  const dispatch = (action) => {
    if (dispatching) {
      nextDispatchs.push(action)
      return
    }

    let innerAction = action
    if (typeof action === 'string') innerAction = { type: action }

    runAndNotify(() => {
      dispatching = true

      for (let i = 0; i < reactions.length; i += 1) {
        reactions[i](store, innerAction)
      }

      dispatching = false
    }, action)

    if (nextDispatchs.length) {
      const nextAction = nextDispatchs.pop()
      dispatch(nextAction)
    }
  }

  const removeListener = (callback) => {
    reactions = reactions.filter(reaction => reaction !== callback)
  }

  const removeSubscriber = (callback) =>  {
    subscribers = subscribers.filter(subscriber => subscriber !== callback)
  }

  const mutate = (callback) => {
    runAndNotify(() => {
      state = produce(state, draft => { callback(draft) })
    })
  }

  const setState = (newState) => {
    runAndNotify(() => {
      state = newState
    })
  }

  store = {
    contexts: {},
    setState,
    getState: () => state,
    mutate,
    dispatch,
    addListener: (event, callback) => {
      let newReaction
      if (callback === undefined) {
        newReaction = event
      } else {
        newReaction = matchListener(event, callback)
      }

      reactions = reactions.concat(newReaction)

      return () => removeListener(newReaction)
    },
    subscribe: (path, callback) => {
      let newSubscriber
      if (callback === undefined) {
        newSubscriber = path
      } else {
        newSubscriber = matchSubscriber(path, callback)
      }

      subscribers = subscribers.concat(newSubscriber)

      return () => removeSubscriber(newSubscriber)
    }
  }

  connectToDevtools(store)
  return store
}

module.exports = createStore
