# @myrtille/react
> React bindings for [@myrtille/core](https://github.com/fabienjuif/myrtille) or [@myrtille/mutate](https://github.com/fabienjuif/myrtille)

![npm](https://img.shields.io/npm/v/@myrtille/react.svg) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/@myrtille/react.svg) ![CircleCI](https://img.shields.io/circleci/build/github/fabienjuif/myrtille.svg) ![Coveralls github](https://img.shields.io/coveralls/github/fabienjuif/myrtille.svg)

# Features
- 🔄 One-way state manager: your store is the single source of truth
- 💎 Immutable but feels mutable
- ⛏️ Hackable
- 💡 Based on events (actions)
- 📖 Compatible with redux-devtools

### API
- `createStore(initialState: Object) -> Store`
  * Please look at [@myrtille/core API](https://github.com/fabienjuif/myrtille#api).
  * Or at [@myrtille/mutate API](https://github.com/fabienjuif/myrtille#api)
- `provider(store: Store) -> Function(React.Component) -> React.Component`
- `Provider({ store: Store, children }) -> React.Element`
- `useDispatch() -> Function`
- `useListeners(listeners: [][(String | Action), Function]) -> void`
- `useStateAt(path: String | void) -> Any`
- `useStore -> Store`
- `Context: React.Context`
