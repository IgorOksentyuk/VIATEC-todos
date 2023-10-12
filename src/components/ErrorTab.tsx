import React, { useEffect } from 'react';
import classNames from 'classnames';
import { TodoError } from '../types/TodoError';
import { useAppDispatch } from '../app/hooks';
import { setErrorMessage } from '../slices/todosSlice';

type Props = {
  errorMesage: TodoError,
};

export const ErrorTab: React.FC<Props> = ({ errorMesage }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    setTimeout(() => dispatch(setErrorMessage(TodoError.empty)), 3000);
  }, [dispatch]);

  return (
    <div className={classNames(
      'notification',
      'is-danger',
      'is-light',
      'has-text-weight-normal',
      { hidden: !errorMesage },
    )}
    >
      {errorMesage}

      <button
        type="button"
        className="delete"
        aria-label="delete"
        onClick={() => dispatch(setErrorMessage(TodoError.empty))}
      />
    </div>
  );
};
