# @fabienjuif/myrtille
> An immutable (but feeling mutable) one-way state manager without reducers

![npm](https://img.shields.io/npm/v/@fabienjuif/myrtille.svg) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@fabienjuif/myrtille.svg)

# Features
- 🔄 One-way state manager: your store is the source of truth
- 💎 Immutable but feels mutable
- ⛏️ Hackable
- 💡 Based on events (actions)
- 📖 Compatible with redux-devtools

# Inspirations
 - https://github.com/rakunteam/k-ramel
 - https://github.com/jamiebuilds/bey

# The goal
The goal is to have a simple state manager, but keeping our of any UI library.
The Redux pattern, having a one-way state management is a good pattern but Redux suffer from boilerplate, and once you add middleware you don't have clear separation of concerns.
Myrtille tries to fix this drawbacks by using [immer](https://github.com/immerjs/immer) under the hood and by merging "reducers" and "reactions" in one place: listeners.

We also want to make sure your UI component tree is optimized and only refreshes when needed, that's why you can give a `path` to subscribers, you can make sure your component tree will be refreshed only when this path updates.

One of the last goal that Myrtille aims at is to let the developper doing whatever he wants with this library, that's why the store is always given and usable inside your callbacks, hack-it!

# API
- `createStore(initialState: Object) -> Store`
  * create a store with the given initial state
  * eg: `const store = createStore({ todos: [] })`
- `Store.setState(newState: Object) -> void`
  * set state to the given one and triggers listeners
- `Store.getState() -> State`
  * get the current state.
- `Store.mutate((state: State) -> void): void`
  * register a mutation, the `currentState` given in callback HAVE TO be muted, this is [myrtille](https://github.com/fabienjuif/myrtille) (via [immer](https://github.com/immerjs/immer)) that make sure this is done in an immutable way!
  * eg: `store.mutate(state => { state.todos.push({ id: 2, label: 'new' }) })`
- `Store.dispatch(action: String | Object) -> void`
  * dispatch an action that listeners can register on, if the action is a string, the `action` is created by [myrtille](https://github.com/fabienjuif/myrtille) to follow the standard rule: `{ type: $yourString }`
  * eg: `store.dispatch('FETCH_TODOS')`
  * eg: `store.dispatch({ type: 'ADD_TODO', payload: { id: 2, label: 'new' }})`
- `Store.addListener(action: String | Action | Function, callback: Function((store: Store, action: Action) -> void) | void) -> Function`
  * add a listener to the store, a listener **listen** to an action, when this `action` is dispatched, the registered `callback` is called.
  * you can set your `callback` at first argument, in which it will be called for every actions dispatched.
  * you can play with the store in the given callback (dispatch new action, register mutations, etc)
  * calling the returned function will remove your callback
  * eg: [take a look at listeners examples](#listeners-examples)
- `Store.subscribe(path: String | Function, callback: Function(store: Store, oldState: State, action: Action) | void) -> Function`
  * subcribe to state mutations at given `path`. The registered `callback` is called whenever the store as muted at given `path`.
  * you can set your `callback` at first argument, in which it will be called for every mutations
  * you can play with the store in the given callback (dispatch new action, register mutations, etc) but prefer using listeners and dispatching actions.
  * caling the returned function will unsubscribe your callback
- `Store.contexts: Object`
  * used to retrieves some informations from your callbacks given in `addListener` and `subscribe`
  * eg: `store.contexts.firebase = require('firebase/app')`

# Listeners examples
**Async and mutation**
- Listen to an action that look like `{ type: 'FETCH_TODOS' }`
- Fetch todos
- Set todos in store
```js
const store = createStore({ todos: [] })
store.subscribe((store) => { console.log('new state!', store.getState()) })

// the listener to focus on
store.addListener('FETCH_TODOS', async (store) => {
  const todos = await (await fetch('https://my-api/todos')).json()
  store.mutate(state => {
    state.todos = todos
  })
})

// dispatch the listened action
store.dispatch('FETCH_TODOS')
```

**retrieve action informations**
- Listen to `ADD_TODO` action that can be dispatched by a click from the UI)
- Add a new todo with information given in the action's payload
```js
const store = createStore({ todos: [] })
store.subscribe((store) => { console.log('new state!', store.getState()) })

// the listener to focus on
store.addListener('ADD_TODO', (store, action) => {
  store.mutate(state => {
    state.todos.push(action.payload)
  })
})

// dispatch the listened action
store.dispatch({ type: 'ADD_TODO', payload: { id: 2, label: 'new' } })
```

**dispatch in a listener**
- Listen to `@@ui/CLEAR_TODOS` (that can be dispatched by a click from the UI)
- React by calling `CLEAR_TODOS` if todos are not already empty
```js
const store = createStore({ todos: [{ id: 1, label: 'finish the documentation' }] })
store.addListener((store, oldState, action) => { console.log('new action is dispatched!', action) })
store.addListener('CLEAR_TODOS', store => { store.mutate(state => { state.todos = [] }) })

// the listener to focus on
store.addListener({ type: '@@ui/CLEAR_TODOS' }, store => {
  if (store.getState().todos && store.getState().todos.length > 0) {
    store.dispatch('CLEAR_TODOS')
  }
})

// dispatch the listened action
store.dispatch('@@ui/CLEAR_TODOS')
```

# Bindings
## React <img width=30 src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/640px-React-icon.svg.png" />

### API
- `createStore(initialState: Object) -> Store`: Please look at [API](#api).
- `Context: React.Context`:
- `provider(store: Store) -> Function(React.Component) -> React.Component`
- `useActions(actions: [](String | Function)) -> Function[]`
- `useListeners(listeners: [][(String | Action), Function]) -> void`
- `useStoreState(path: String | void) -> Any`
