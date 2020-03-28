import createStore, { Store } from './index'

interface State {
  players: any[]
}

interface AroAction {
  type: '@action'
}

interface OkBossAction {
  type: 'OkBoss'
}

interface OuiOuiAction {
  type: 'OuiOui'
  payload: string
}

type Action = AroAction | OkBossAction | OuiOuiAction

const store = createStore<State, Action>()
const state = store.getState()
store.setState({ players: [{ name: 'Tripa' }] })

store.addListener('@action', () => {
  console.log('ouai')
})

store.addListener({ type: 'OkBoss' }, (store, action) => {
  store.dispatch({ type: 'OuiOui', payload: 'ok' })
})

store.subscribe(() => {
  console.log('here')
})

store.subscribe((store, oldState, action) => {
  console.log(store, oldState, action)
})

store.subscribe('players', () => {
  console.log('players change!')
})

const listener = (store: Store<State, Action>, action: Action) => {
  console.log(action.type)
}

store.addListener(listener)

store.dispatch('@action')
store.dispatch({ type: 'OkBoss' })
