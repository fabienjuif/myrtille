import createStore from "./index";

const store = createStore({
  todos: [{ id: 1, label: "finish the documentation" }],
});

store.addListener((store, action) => {
  console.log("new action is dispatched!", store, action);
});

store.addListener("CLEAR_TODOS", (store, action) => {
  console.log("clear_todos listener", store, action);

  store.setState({
    ...store.getState(),
    todos: [],
  });
});

// the listener to focus on
store.addListener({ type: "@@ui/CLEAR_TODOS" }, (store) => {
  if (store.getState().todos && store.getState().todos.length > 0) {
    store.dispatch("CLEAR_TODOS");
  }
});

store.subscribe((store, state, action) => {
  console.log("args", state, action);
  console.log("mutation", store.getState());
});

// dispatch the listened action
store.dispatch("@@ui/CLEAR_TODOS");

console.log("----------");
console.log("----------");

store.addListener("mutate", (store) => {
  store.mutate((state) => {
    state.todos.push({ id: 2, label: "youpi" });
  });
});

store.dispatch("mutate");
