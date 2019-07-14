const produce = require('immer').default
const createStore = require('@myrtille/core')

module.exports = (...args) => {
  const store = createStore(...args)

  store.mutate = (callback) => {
    store.setState(produce(store.getState(), (draft) => { callback(draft) }))
  }

  return store
}
