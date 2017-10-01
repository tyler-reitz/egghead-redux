import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { Provider, connect } from 'react-redux'
import expect from 'expect'
import deepfreeze from 'deepfreeze'

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state
      }

      return Object.assign({}, state, {
        completed: !state.completed
      })
    default:
      return state
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, todo(undefined, action)]
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action))
    default:
      return state
  }
}

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

const todosApp = combineReducers({
  todos,
  visibilityFilter
})

let nextTodo = 0
// REACT +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
  }
}

const mapStateToProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onTodoClick: id => {
      dispatch({
        type: 'TOGGLE_TODO',
        id
      })
    }
  }
}
const TodoList = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo => (
      <Todo key={ todo.id } { ...todo } onClick={ () => onTodoClick(todo.id) } />
    ))}
  </ul>
)
const VisibleTodos = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)


const Todo = ({ onClick, completed, text }) => (
  <li
    onClick={ onClick }
    style={ {
      textDecoration: completed ? 'line-through' : 'none'
    } }
  >
    {text}
  </li>
)

const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodo++,
    text
  }
}

let AddTodo = ({ dispatch }) => {
  let input
  
  return (
    <div>
      <input ref={ node => (input = node) } />
      <button
        onClick={ () => {
          dispatch(addTodo(input.value))
          input.value = ''
        } }
      >
        Add Todo
      </button>
    </div>
  )
}
AddTodo = connect()(AddTodo)

const Link = ({ active, onClick, children }) => {
  if (active) {
    return <span>{children}</span>
  }

  return (
    <a
      href="#"
      onClick={ e => {
        e.preventDefault()
        onClick()
      } }
    >
      {children}
    </a>
  )
}

const mapLinkStateToProps = (
  state,
  ownProps
) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
}
const mapLinkDispatchToProps = (
  dispatch,
  ownProps
) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter
      })
    }
  }
}
const FilterLink = connect(
  mapLinkStateToProps,
  mapLinkDispatchToProps
)(Link)

const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink filter="SHOW_ALL" >
      All
    </FilterLink>
    {' '}
    <FilterLink filter="SHOW_COMPLETED" >
      Completed
    </FilterLink>
    {' '}
    <FilterLink filter="SHOW_ACTIVE" >
      Active
    </FilterLink>
  </p>
)
const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodos />
    <Footer />
  </div>
)

ReactDOM.render(
  <Provider store={ createStore(todosApp) }>
    <TodoApp />
  </Provider>,
  document.getElementById('root')
)
