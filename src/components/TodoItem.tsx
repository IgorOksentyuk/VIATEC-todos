import React, {
  useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { deleteTodo, updateTodoStatus, updateTodoTitle } from '../slices/todosSlice';

type Props = {
  todo: Todo,
  selectedTodoId: number | null,
  setSelectedTodoId: (id: number | null) => void,
};

export const TodoItem: React.FC<Props> = ({
  todo,
  selectedTodoId,
  setSelectedTodoId,
}) => {
  const [editedTodoId, setEditedTodoId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(state => state.todos);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [editedTodoId]);

  const toggleTodoStatus = async (todo: Todo) => {
    setSelectedTodoId(todo.id);
    await dispatch(updateTodoStatus(todo));
    setSelectedTodoId(null);
  };

  const handleDeleteTodo = async (todoId: number) => {
    setSelectedTodoId(todoId);
    await dispatch(deleteTodo(todoId));
    setSelectedTodoId(null);
  };

  const handleUpdateTodoTitle = async (todo: Todo) => {
    try {
      await dispatch(updateTodoTitle(todo));
      setEditedTodoId(null);
    } finally {
      setSelectedTodoId(null);
    }
  };

  const saveChanges = (newTodo: Todo) => {
    if (newTitle.trim() === newTodo.title) {
      setEditedTodoId(null);

      return;
    }

    if (newTitle.trim() === '') {
      handleDeleteTodo(newTodo.id);
    }

    if (newTitle.trim() !== '') {
      handleUpdateTodoTitle({ ...newTodo, title: newTitle });
    }

  };

  const submitChanges = (
    event: React.KeyboardEvent<HTMLInputElement>,
    newTodo: Todo,
  ) => {
    if (event.key === 'Enter') {
      saveChanges(newTodo);
    }
  };

  const handleDoudleClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    newTodo: Todo,
  ) => {
    if (event.detail === 2) {
      setSelectedTodoId(newTodo.id);
      setEditedTodoId(newTodo.id);
      setNewTitle(newTodo.title);
    }
  };

  const cancelChanges = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setEditedTodoId(null);
    }
  };

  return (
    <div
      className={classNames('todo', { completed: todo.completed })}
    >
      <label className="todo__status-label">
        <input
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => toggleTodoStatus(todo)}
        />
      </label>
      {
        editedTodoId === todo.id ? (
          <input
            type="text"
            className="todoapp__new-todo"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            onKeyDown={(event) => submitChanges(event, todo)}
            onKeyUp={cancelChanges}
            onBlur={() => saveChanges(todo)}
            ref={inputRef}
          />
        )
          : (
            <>
              <span
                className="todo__title"
                onClick={(event) => handleDoudleClick(event, todo)}
              >
                {todo.title}
              </span>

              <button
                type="button"
                className="todo__remove"
                onClick={() => handleDeleteTodo(todo.id)}
              >
                ×
              </button>
            </>
          )
      }
      <div className={classNames(
        'modal',
        'overlay',
        {
          'is-active': loading === true
            && (selectedTodoId === todo.id)
        },
      )}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
