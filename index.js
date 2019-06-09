const produce = require('immer').default
const { getFromPath } = require('./util')

const matchRegister = (matcher, callback) => (state, action, store) => {
  if (typeof matcher === 'string' && matcher === action.type) callback(state, action, store)
  else if (typeof matcher === 'object' && matcher.type === action.type) callback(state, action, store)
  // TODO: regexp
  // TODO: function
}

const matchSubscriber = (path, callback) => (store, oldState, action) => {
  if (getFromPath(oldState, path) !== getFromPath(store.getState(), path)) {
    callback(store, oldState, action)
  }
}

const createStore = (init) => {
  let store
  let state = init
  let subscribers = []
  let reactions = []
  let dispatching = false
  const nextDispatchs = []

  const tryNotify = store => {
    const oldState = store.getState()

    return (action = { type: '@@DIRECT_MUTATION' }) => {
      if (oldState !== store.getState()) {
        for (let i = 0; i < subscribers.length; i += 1) {
          subscribers[i](store, oldState, action)
        }
      }
    }
  }

  const dispatch = (action) => {
    if (dispatching) {
      nextDispatchs.push(action)
      return
    }

    dispatching = true

    let innerAction = action
    if (typeof action === 'string') innerAction = { type: action }

    const notify = tryNotify(store)
    for (let i = 0; i < reactions.length; i += 1) {
      reactions[i](store, innerAction)
    }
    notify()

    dispatching = false

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
    const notify = tryNotify(store)

    state = produce(state, draft => { callback(draft) })

    notify()
  }

  store = {
    contexts: {},
    getState: () => state,
    mutate,
    dispatch,
    addListener: (event, callback) => {
      let newReaction
      if (callback === undefined) {
        newReaction = event
      } else {
        newReaction = matchRegister(event, callback)
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

  return store
}

module.exports = createStore
