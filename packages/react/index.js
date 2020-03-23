import React, {
  createContext,
  useContext,
  // we use layout effect so we are sure that per default there is no clipping
  // and action like "mount" are sent right away
  // if you want to delay a state update, you can wrap our custom hook into yours 
  // and use an useEffect
  useLayoutEffect,
  useState,
} from 'react' // eslint-disable-line import/no-unresolved
import { getFromPath } from '@myrtille/util'

export const Context = createContext()

export const provider = (store) => (Component) => (props) => {
  useLayoutEffect(() => {
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

  useLayoutEffect(() => {
    const unregisters = listeners.map(([matcher, mutator]) => store.addListener(matcher, mutator))

    return () => {
      unregisters.forEach((unregister) => unregister())
    }
  }, [store])
}

export const useStateAt = (path) => {
  const store = useContext(Context)
  const [state, setState] = useState(getFromPath(store.getState(), path))

  useLayoutEffect(
    () => store.subscribe(path, () => setState(getFromPath(store.getState(), path))),
    [],
  )

  return state
}
