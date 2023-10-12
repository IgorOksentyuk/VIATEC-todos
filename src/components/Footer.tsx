import React from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';
import { Status } from '../types/Status';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { deleteTodo } from '../slices/todosSlice';

type Props = {
  selectedStatus: string,
  setSelectedStatus: (value: Status) => void;
  allCompletedTodos: Todo[],
  allActiveTodos: Todo[],
};

export const Footer: React.FC<Props> = ({
  selectedStatus,
  setSelectedStatus,
  allCompletedTodos,
  allActiveTodos,
}) => {
  const dispatch = useAppDispatch();
  const { todos } = useAppSelector(state => state.todos);

  const deleteCompletedTodos = () => {
    allCompletedTodos.forEach((todo) => {
      dispatch(deleteTodo(todo.id));
    });
  }

  return (
    <footer className="todoapp__footer">
      <span className="todo-count">
        {`${todos.length} справ залишилось`}
      </span>

      <nav className="filter">
        <a
          href="#/"
          className={classNames(
            'filter__link',
            { selected: selectedStatus === Status.All },
          )}
          onClick={() => setSelectedStatus(Status.All)}
        >
          {Status.All}
        </a>

        <a
          href="#/active"
          className={classNames(
            'filter__link',
            { selected: selectedStatus === Status.Active },
          )}
          onClick={() => {
            if (allActiveTodos.length > 0) {
              setSelectedStatus(Status.Active);
            } else {
              setSelectedStatus(Status.All);
            }
          }}
        >
          {Status.Active}
        </a>

        <a
          href="#/completed"
          className={classNames(
            'filter__link',
            { selected: selectedStatus === Status.Completed },
          )}
          onClick={() => {
            if (allCompletedTodos.length > 0) {
              setSelectedStatus(Status.Completed);
            } else {
              setSelectedStatus(Status.All);
            }
          }}
        >
          {Status.Completed}
        </a>
      </nav>

      <button
        type="button"
        className={classNames(
          'todoapp__clear-completed',
          { 'is-invisible': allCompletedTodos.length === 0 },
        )}
        onClick={deleteCompletedTodos}
      >
        Видалити виконані
      </button>
    </footer>
  );
};
