/**
store
 - ne doit pas muter pour le provider
 - subscribe a des mutation (avec path)
  * subscribe('screens.first', (state) => {})
    - if (state.screens.first !== oldState.screen.first) callback(state)
 - dispatch(string | object)
 - register a des evenements
  * register('type')(reaction)
  * pouvoir demonter des register
  * une reaction peut être une promesse
 - pouvoir ajouter un sous state à la volé


useReaction('ADD_TODO', state => {
  state.data.todos.push('a')
})

const todos = connect('state.data.todos')
const addTodo = action('ADD_TODO')

addTodo({ name: 'oui' })
 */

const produce = require('immer').default

const getFromPath = (data, path) => path.split('.').reduce(
  (curr, sub) => curr && curr[sub],
  data,
)

const matchRegister = (matcher, callback) => (state, action, store) => {
  if (typeof matcher === 'string' && matcher === action.type) callback(state, action, store)
  else if (typeof matcher === 'object' && matcher.type === action.type) callback(state, action, store)
  // TODO: regexp
  // TODO: function
}

const matchSubscriber = (path, callback) => (store, oldState) => {
  if (getFromPath(oldState, path) !== getFromPath(store.getState(), path)) {
    callback(store, oldState)
  }
}

const createStore = (init) => {
  let state = init
  let subscribers = []
  let reactions = []
  let dispatching = false
  const nextDispatchs = []

  const dispatch = (action) => {
    if (dispatching) {
      nextDispatchs.push(action)
      return
    }

    dispatching = true

    let innerAction = action
    if (typeof action === 'string') innerAction = { type: action }

    const oldState = state

    for (let i = 0; i < reactions.length; i += 1) {
      state = produce(
        state,
        (draft) => {
          reactions[i](draft, innerAction, store)
        },
      )
    }

    if (oldState !== state) {
      for (let i = 0; i < subscribers.length; i += 1) {
        subscribers[i](store, oldState)
      }
    }

    dispatching = false

    if (nextDispatchs.length) {
      const nextAction = nextDispatchs.pop()
      dispatch(nextAction)
    }
  }

  return {
    getState: () => state,
    dispatch,
    register: (event, callback) => {
      let newReaction
      if (callback === undefined) {
        newReaction = event
      } else {
        newReaction = matchRegister(event, callback)
      }

      reactions = reactions.concat(newReaction)

      return () => {
        reactions = reactions.filter(reaction => reaction !== newReaction)
      }
    },
    subscribe: (path, callback) => {
      let newSubscriber
      if (callback === undefined) {
        newSubscriber = path
      } else {
        newSubscriber = matchSubscriber(path, callback)
      }

      subscribers = subscribers.concat(newSubscriber)

      return () => {
        subscribers = subscribers.filter(subscriber => subscriber !== newSubscriber)
      }
    }
  }
}

const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout))

const store = createStore({
  count: 0,
  user: {
    name: 'Delphine!',
  },
})

const unsubscribe = store.subscribe((store) => {
  console.log(store.getState())
})

store.subscribe('user.name', (store) => {
  console.log('user name changed!', store.getState())
})

store.register((state, action, store) => {
  if(action.type === 'INCREMENT') {
    state.count += 1
  }
})

const unregister = store.register('INCREMENT', (state, action, store) => {
  store.dispatch('DECREMENT')
})

store.register('START_DECREMENT', async (state, action, store) => {
  await wait(1000)
  store.dispatch('DECREMENT')
})

store.register('DECREMENT', state => state.count -= 1)

store.register('SET_NAME', (state, { payload }) => state.user.name = payload)

store.dispatch('INCREMENT')
unregister()
// unsubscribe()
store.dispatch('INCREMENT')
store.dispatch({ type: 'START_DECREMENT' })
store.dispatch({ type: 'SET_NAME', payload: 'Delphibette' })
