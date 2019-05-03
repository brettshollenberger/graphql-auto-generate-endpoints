import {
  takeEvery,
  takeLatest,
  put,
  all,
  select,
  retry
} from "redux-saga/effects";
import axios from "axios";
import ApolloClient from "apollo-boost";
import {
  gql
} from "apollo-boost";
const _ = require('lodash');

const client = new ApolloClient({
  uri: `${getBaseUrl()}`
});

function getBaseUrl() {
  return process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : 'http://localhost:3000/graphql'
}

function* createTodo(data) {
  let todos = yield select(state => state.todos)
  let thisTodo = _.find(todos, (todo) => {
    return todo.text === data.text
  });

  try {
    let response = yield retry(3, 100, attemptCreateTodo, data)
    let backendData = response.data.createTodo.todo

    yield put({
      backendData: backendData,
      data: thisTodo,
      type: 'ADD_TODO_SUCCESS'
    });
  } catch (e) {
    yield put({
      ...data,
      type: 'ADD_TODO_FAIL'
    });
  }
}

function* attemptCreateTodo(action) {
  return yield client.mutate({
    variables: {
      input: {
        todo: {
          text: action.text
        }
      }
    },
    mutation: gql `
        mutation CreateTodo($input: CreateTodoInput!) {
          createTodo(input: $input) {
            todo {
              id, text, completed
            }
          }
        }
    `
  })
}

export function* fetchTodos() {
  let response = yield client.query({
    query: gql `
      { 
        allTodos {
          edges {
            node {
              id,text,completed
            }
          }
        }
      }
    `
  })
  let todos = _.map(response.data.allTodos.edges, (n) => {
    return n.node
  })

  yield put({
    type: "TODOS_LOADED",
    todos
  });
}

export function* destroyTodo(action) {
  yield client.mutate({
    variables: {
      input: {
        id: action.id,
      }
    },
    mutation: gql `
      mutation deleteTodoById($input: DeleteTodoByIdInput!) {
        deleteTodoById(input: $input) {
          todo {
            id, text, completed
          }
        }
      }
    `
  })
}

export function* destroyAllTodos() {
  let filtered = yield select(state => state.todos.filter(todo => todo.completed))
  yield put({
    type: 'LOCAL_CLEAR_COMPLETED'
  })

  yield axios.post(`${getBaseUrl()}/api/todos/bulk_delete`, {
    ids: filtered.map(f => f.id)
  })
}

export function* editTodo(action) {
  yield client.mutate({
    variables: {
      input: {
        id: action.id,
        todoPatch: {
          text: action.todo.text,
          completed: action.todo.completed
        }
      }
    },
    mutation: gql `
      mutation updateTodoById($input: UpdateTodoByIdInput!) {
          updateTodoById(input: $input) {
          todo {
            id, text, completed
          }
        }
      }
    `
  })
}

export function* completeAllTodos() {
  let todos = yield select(state => state.todos)
  let allAreMarked = todos.every(todo => todo.completed)
  let newTodos = todos.map((todo) => {
    return {
      ...todo,
      completed: !allAreMarked
    }
  })

  yield put({
    type: 'BULK_EDIT_TODOS',
    todos: newTodos
  })
}

export function* bulkEditTodos(action) {
  yield axios.put(`${getBaseUrl()}/api/todos/bulk_update`, {
    todos: action.todos
  })
}

export function* rootSaga() {
  yield all([
    takeLatest("FETCH_TODOS", fetchTodos),
    takeEvery("ADD_TODO", createTodo),
    takeEvery("DELETE_TODO", destroyTodo),
    takeEvery("EDIT_TODO", editTodo),
    takeLatest("CLEAR_COMPLETED", destroyAllTodos),
    takeEvery("COMPLETE_ALL_TODOS", completeAllTodos),
    takeEvery("BULK_EDIT_TODOS", bulkEditTodos),
  ])
}