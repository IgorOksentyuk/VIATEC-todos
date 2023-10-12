import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';
import * as todoService from '../api/todos';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addTodo, setErrorMessage, updateTodoStatus } from '../slices/todosSlice';
import { TodoError } from '../types/TodoError';

export const Header: React.FC = () => {
  const [todoTitle, setTodoTitle] = useState('');
  const [isInputDisabled, setIsInputDisabled] = useState(false);

  const dispatch = useAppDispatch();
  const { todos } = useAppSelector(state => state.todos);

  const todoTemp = {
    id: 0,
    title: todoTitle,
    completed: false,
    userId: todoService.USER_ID,
  };

  const handleAddTodo = async (todo: Todo) => {
    setIsInputDisabled(true);

    try {
      await dispatch(addTodo(todo));
    } finally {
      setTodoTitle('');
      setIsInputDisabled(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (todoTemp.title.trim() !== '') {
        handleAddTodo(todoTemp);
      } else {
        dispatch(setErrorMessage(TodoError.emtyTitle));
      }
    }
  };

  const areAllCompleted = () => {
    return todos.every((todo) => todo.completed);
  };

  const toggleAllTodos = useCallback(async () => {
    const newStatus = !areAllCompleted();

    const updatePromises = todos.map(todo => {
      if (todo.completed !== newStatus) {
        return dispatch(updateTodoStatus(todo));
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos]);

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={classNames(
          'todoapp__toggle-all',
          { active: areAllCompleted() },
        )}
        aria-label="toggle"
        onClick={toggleAllTodos}
      />

      <form>
        <input
          type="text"
          className="todoapp__new-todo"
          placeholder="Що потрібно виконати?"
          value={todoTitle}
          onChange={(event) => setTodoTitle(event.target.value)}
          onKeyDown={event => handleKeyPress(event)}
          disabled={isInputDisabled}
        />
      </form>
    </header>
  );
};