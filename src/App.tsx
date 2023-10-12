import { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { Status } from "./types/Status";
import { TodoError } from "./types/TodoError";
import { ErrorTab } from "./components/ErrorTab";
import { Footer } from "./components/Footer";
import * as todoService from './api/todos';
import { TodoItem } from "./components/TodoItem";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchTodos } from "./slices/todosSlice";

function App() {
  const [selectedStatus, setSelectedStatus] = useState(Status.All);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);

  const { todos, error } = useAppSelector(state => state.todos);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTodos(todoService.USER_ID));
  }, [dispatch]);

  useEffect(() => {
    const noActiveTodos = !todos.some(todo => !todo.completed);
    const noCompletedTodos = !todos.some(todo => todo.completed);

    if (noActiveTodos && selectedStatus === Status.Active) {
      setSelectedStatus(Status.All);
    } else if (noCompletedTodos
      && selectedStatus === Status.Completed) {
      setSelectedStatus(Status.All);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos]);

  const getFilteredTodos = useMemo(() => {
    switch (selectedStatus) {
      case Status.Active:
        return todos.filter(todo => !todo.completed);

      case Status.Completed:
        return todos.filter(todo => todo.completed);

      default:
        return todos;
    }
  }, [todos, selectedStatus]);

  const visibleTodos = getFilteredTodos;
  let allCompletedTodos = todos.filter(todo => todo.completed);
  const allActiveTodos = todos.filter(todo => !todo.completed);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">справи</h1>

      <div className="todoapp__content">
        <Header />

        {visibleTodos.length > 0 && (
          <section className="todoapp__main">
            {
              visibleTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  selectedTodoId={selectedTodoId}
                  setSelectedTodoId={setSelectedTodoId}
                />
              ))
            }
          </section>
        )}

        {visibleTodos.length > 0
          && (
            <Footer
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              allCompletedTodos={allCompletedTodos}
              allActiveTodos={allActiveTodos}
            />
          )}
      </div>

      {error !== TodoError.empty && (
        <ErrorTab
          errorMesage={error}
        />
      )}
    </div>
  );
}

export default App;