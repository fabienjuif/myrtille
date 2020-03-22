const { getFromPath } = require('@myrtille/util')
const connectToDevtools = require('./devtools')

const matchListener = (matcher, callback) => (store, action, ...args) => {
  if (
    // string matcher
    (typeof matcher === 'string' && matcher === action.type) ||
    // function matcher
    (typeof matcher === 'function' && matcher(action, store)) ||
    // object matcher (regexp or object)
    ((typeof matcher === 'object') && (
      // object
      matcher.type === action.type ||
      // regexp
      (typeof matcher.test === 'function' && matcher.test(action.type))
    ))
  ) callback(store, action, ...args)
}

const matchSubscriber = (path, callback) => (store, oldState, ...args) => {
  const call = () => callback(store, oldState, ...args)

  if (path === undefined || path.trim() === '') {
    if (oldState !== store.getState()) call()
  } else if (getFromPath(oldState, path) !== getFromPath(store.getState(), path)) {
    call()
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

    for (let i = 0; i < subscribers.length; i += 1) {
      subscribers[i](store, oldState, action)
    }
  }

  const dispatch = (action) => {
    let innerAction = action
    if (typeof action === 'string') innerAction = { type: action }

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
      const nextAction = nextDispatchs.pop()
      dispatch(nextAction)
    }
  }

  const removeListener = (callback) => {
    reactions = reactions.filter(reaction => reaction !== callback)
  }

  const removeSubscriber = (callback) => {
    subscribers = subscribers.filter(subscriber => subscriber !== callback)
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
    },
  }

  connectToDevtools(store)
  return store
}

module.exports = createStore
