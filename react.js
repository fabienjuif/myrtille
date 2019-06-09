import React, { createContext, useContext, useRef, useEffect, useState } from 'react'
import createStore from './index'
import { getFromPath } from './util'

export { createStore }

export const Context = createContext()

export const provider = store => Component => props => {
  useEffect(() => {
    store.dispatch('@@react/MOUNT')
    return () => {
      store.dispatch('@@react/UNMOUNT')
    }
  }, [])

  return React.createElement(
    Context.Provider,
    { value: store },
    React.createElement(Component, props),
  )
}

export const useActions = (actions = []) => {
  const mappedActions = useRef()
  const store = useContext(Context)

  if (mappedActions.current) return mappedActions.current

  mappedActions.current = actions.map(action => {
    if (typeof action === 'string') return () => store.dispatch(action)
    if (typeof action === 'function') return (...args) => store.dispatch(action(...args))

    const error = new Error('Unknown action type')
    error.action = action
    throw error
  })

  return mappedActions.current
}

export const useListeners = (listeners = []) => {
  const store = useContext(Context)

  useEffect(() => {
    const unregisters = listeners.map(([matcher, mutator]) => {
      return store.register(matcher, mutator)
    })

    return () => {
      unregisters.forEach(unregister => unregister())
    }
  }, [store])
}

export const useStoreState = (path) => {
  const store = useContext(Context)
  const [state, setState] = useState(getFromPath(store.getState(), path))

  useEffect(() => {
    return store.subscribe(path, () => setState(getFromPath(store.getState(), path)))
  }, [])

  return state
}
