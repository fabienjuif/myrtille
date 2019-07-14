import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react' // eslint-disable-line import/no-unresolved
import createStore from './index'
import { getFromPath } from './util'

export { createStore }

export const Context = createContext()

export const provider = store => Component => (props) => {
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

export const Provider = ({ store, children }) => React.createElement(
  Context.Provider,
  { value: store },
  React.cloneElement(children),
)

export const useStore = () => useContext(Context)

export const useDispatch = () => {
  const store = useContext(Context)

  return store.dispatch
}

export const useListeners = (listeners = []) => {
  const store = useContext(Context)

  useEffect(() => {
    const unregisters = listeners.map(([matcher, mutator]) => store.addListener(matcher, mutator))

    return () => {
      unregisters.forEach(unregister => unregister())
    }
  }, [store])
}

export const useStateAt = (path) => {
  const store = useContext(Context)
  const [state, setState] = useState(getFromPath(store.getState(), path))

  useEffect(
    () => store.subscribe(path, () => setState(getFromPath(store.getState(), path))),
    [],
  )

  return state
}
