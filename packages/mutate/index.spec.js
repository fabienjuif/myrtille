/* eslint-disable no-shadow,no-param-reassign */
/* eslint-env jest */
const createStore = require('./index')

it('should initialize a store', () => {
  const store = createStore({ todos: [] })
  expect(store.getState()).toEqual({ todos: [] })
})

it('should set state', () => {
  const store = createStore({ before: true })
  store.setState({ after: false })
  expect(store.getState()).toEqual({ after: false })
})

it('should mutate state', () => {
  const store = createStore({ before: true })
  store.mutate((state) => { state.before = false })
  expect(store.getState()).toEqual({ before: false })
})

it('should listen to dispatch', () => {
  const callback = jest.fn()

  const store = createStore({})
  store.addListener(callback)

  store.dispatch('FETCH_TODOS')
  store.dispatch({ type: 'ADD_TODO', payload: { id: 2, label: 'new' } })

  expect(callback).toHaveBeenCalledTimes(2)
  expect(callback.mock.calls[0]).toEqual([store, { type: 'FETCH_TODOS' }])
  expect(callback.mock.calls[1]).toEqual([store, { type: 'ADD_TODO', payload: { id: 2, label: 'new' } }])
})

it('should subscribe to all mutations', () => {
  const callback = jest.fn()

  const store = createStore({ name: undefined, todos: [] })
  store.subscribe(callback)

  store.mutate((state) => { state.name = 'Delphine' })
  store.setState({ name: 'Fabien', todos: [{ id: 1, label: 'Finish tests' }] })

  expect(callback).toHaveBeenCalledTimes(2)
  expect(callback.mock.calls[0]).toEqual([store, { name: undefined, todos: [] }, { type: '@@DIRECT_MUTATION' }])
  expect(callback.mock.calls[1]).toEqual([store, { name: 'Delphine', todos: [] }, { type: '@@DIRECT_MUTATION' }])
})

it('should subscribe to given state path only', () => {
  const callback = jest.fn()

  const store = createStore({ name: undefined, todos: [] })
  store.subscribe('name', callback)

  // mutate
  store.mutate((state) => { state.name = 'Delphine' })
  expect(callback).toHaveBeenCalledTimes(1)
  store.mutate(state => state.todos.push({ id: 2, label: 'new' }))
  expect(callback).toHaveBeenCalledTimes(1)

  // setState
  store.setState({ name: 'Fabien', todos: [] })
  expect(callback).toHaveBeenCalledTimes(2)
  store.setState({ name: 'Fabien', todos: [{ id: 2, label: 'new' }] })
  expect(callback).toHaveBeenCalledTimes(2)
})

it('should listen to specified actions only', () => {
  const callback = jest.fn()
  const store = createStore({ todos: [] })
  store.addListener('ADD_TODO', callback)
  store.addListener({ type: 'REMOVE_TODO' }, callback)

  store.dispatch('ADD_TODO')
  expect(callback).toHaveBeenCalledTimes(1)
  store.dispatch('SET_TODOS')
  expect(callback).toHaveBeenCalledTimes(1)
  store.dispatch('REMOVE_TODO')
  expect(callback).toHaveBeenCalledTimes(2)
})

it('should be possible to mutate store into a listener', () => {
  const store = createStore({ todos: [] })
  store.addListener('ADD_TODO', (store, action) => {
    store.mutate((state) => {
      state.todos.push(action.payload)
    })
  })
  store.dispatch({ type: 'ADD_TODO', payload: { id: 1, label: 'new' } })

  expect(store.getState()).toEqual({ todos: [{ id: 1, label: 'new' }] })
})

it('should be possible to dispatch an action into a listener', () => {
  const callback = jest.fn()
  const store = createStore({})
  store.addListener('FETCH_TODOS', (store) => {
    store.dispatch({ type: 'SET_TODOS', payload: [{ id: 303, label: 'imagine it is fetched' }] })
  })
  store.addListener('SET_TODOS', callback)

  store.dispatch('FETCH_TODOS')

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback.mock.calls[0]).toEqual([store, { type: 'SET_TODOS', payload: [{ id: 303, label: 'imagine it is fetched' }] }])
})

it('should be possible to mutate store into a subscriber', () => {
  const store = createStore({ name: undefined, todos: [] })
  store.subscribe('todos', (store, oldState, action) => {
    store.mutate((state) => {
      state.name = action.payload.user
    })
  })
  store.addListener('ADD_TODO', (store, action) => {
    store.mutate((state) => {
      state.todos.push(action.payload)
    })
  })
  store.dispatch({ type: 'ADD_TODO', payload: { id: 1, label: 'new', user: 'Delphine' } })

  expect(store.getState()).toEqual({ name: 'Delphine', todos: [{ id: 1, label: 'new', user: 'Delphine' }] })
})

it('should be possible to dispatch an action into a subscriber', () => {
  const callback = jest.fn()
  const store = createStore({ name: undefined, todos: [] })
  store.subscribe('name', (store) => {
    store.dispatch({ type: 'ADD_TODO', payload: { id: 1, label: 'Introduce yourself to #welcome' } })
  })
  store.addListener('ADD_TODO', callback)

  store.mutate((state) => { state.name = 'Delphine' })

  expect(callback).toHaveBeenCalledTimes(1)
  expect(callback.mock.calls[0]).toEqual([store, { type: 'ADD_TODO', payload: { id: 1, label: 'Introduce yourself to #welcome' } }])
})

it('should trigger subscribers when a dispatch does not mutate store', () => {
  const callback = jest.fn()
  const store = createStore({})
  store.subscribe(callback)

  store.dispatch('NO_MODIFICATION')

  expect(callback).toHaveBeenCalledTimes(1)
})

it('should NOT trigger subscribers when a dispatch does not mutate store', () => {
  const callback = jest.fn()
  const store = createStore({})
  store.subscribe('', callback)

  store.dispatch('NO_MODIFICATION')

  expect(callback).toHaveBeenCalledTimes(0)
})
