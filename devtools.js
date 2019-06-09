// https://github.com/developit/unistore/blob/master/devtools.js
module.exports = (store) => {
  if (!window) return
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__ || window.top.__REDUX_DEVTOOLS_EXTENSION__
  let ignoreState = false

	if (!extension) {
		console.warn('Please install/enable Redux devtools extension')
		store.devtools = null

		return store
	}

	if (!store.devtools) {
		store.devtools = extension.connect()
		store.devtools.subscribe((message) => {
			if (message.type === 'DISPATCH' && message.state) {
        ignoreState = true
        store.setState(JSON.parse(message.state))
      } else if (message.type === 'ACTION') store.dispatch(JSON.parse(message.payload))
		})
		store.devtools.init(store.getState())
		store.subscribe((store, oldState, action) => {
      if (ignoreState) {
        ignoreState = false
        return
      }

      const actionName = action && action.type || '🤔 UNKNOWN'
      store.devtools.send(actionName, store.getState())
		})
	}

	return store
}
