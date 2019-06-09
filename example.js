const createStore = require('./index')

const wait = timeout => new Promise(resolve => setTimeout(resolve, timeout))

const store = createStore({
  count: 0,
  user: {
    name: 'Delphine!',
  },
})

const unsubscribe = store.subscribe((store, oldState, action) => {
  console.log(store.getState(), action)
})

store.subscribe('user.name', (store) => {
  console.log('user name changed!', store.getState())
})

store.addListener((store, action) => {
  if(action.type === 'INCREMENT') {
    store.mutate(state => state.count += 1)
  }
})

const removeListener = store.addListener('INCREMENT', (store) => {
  store.dispatch('DECREMENT')
})

store.addListener('DECREMENT', async store => {
  console.log('ici')
  await wait(1000)
  store.mutate(state => {
    console.log(state.count)
    state.count -= 1
  })
})

store.addListener('SET_NAME', (store, { payload }) => {
  store.mutate(state => state.user.name = payload)
})

store.dispatch('INCREMENT')
// removeListener()
// unsubscribe()
store.dispatch('INCREMENT')
store.dispatch({ type: 'START_DECREMENT' })
store.dispatch({ type: 'SET_NAME', payload: 'Delphibette' })

