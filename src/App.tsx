import { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "./components/Header";
import { Todo } from "./types/Todo";
import { Status } from "./types/Status";
import { TodoError } from "./types/TodoError";
import { ErrorTab } from "./components/ErrorTab";
import { Footer } from "./components/Footer";
import * as todoService from './api/todos';
import { TodoItem } from "./components/TodoItem";

function App() {
  const [todosFromServer, setTodosFromServer] = useState<Todo[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(Status.All);
  const [errorMesage, setErrorMesage] = useState(TodoError.empty);
  const [newAddedTodoId, setNewAddedTodoId] = useState<number | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [changedStatusIds, setChangedStatusIds] = useState<number[]>([]);

  useEffect(() => {
    todoService
      .getTodos(todoService.USER_ID)
      .then(allTodos => setTodosFromServer(allTodos))
      .catch(() => setErrorMesage(TodoError.load));
  }, []);

  useEffect(() => {
    const noActiveTodos = !todosFromServer.some(todo => !todo.completed);
    const noCompletedTodos = !todosFromServer.some(todo => todo.completed);

    if (noActiveTodos && selectedStatus === Status.Active) {
      setSelectedStatus(Status.All);
    } else if (noCompletedTodos
      && selectedStatus === Status.Completed) {
      setSelectedStatus(Status.All);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todosFromServer]);

  const getFilteredTodos = useMemo(() => {
    const filteredTodos = [...todosFromServer];

    switch (selectedStatus) {
      case Status.Active:
        return filteredTodos.filter(todo => !todo.completed);

      case Status.Completed:
        return filteredTodos.filter(todo => todo.completed);

      default:
        return filteredTodos;
    }
  }, [todosFromServer, selectedStatus]);

  const visibleTodos = getFilteredTodos;
  const allCompletedTodos = todosFromServer.filter(todo => todo.completed);
  const allActiveTodos = todosFromServer.filter(todo => !todo.completed);

  const deleteCompletedTodos = useCallback(() => {
    const completedTodos = visibleTodos.filter(todo => todo.completed);

    const deletePromises = completedTodos.map(todo => {
      setChangedStatusIds(ids => [...ids, todo.id]);

      return (
        todoService.deleteTodo(String(todo.id))
      );
    });

    Promise.all(deletePromises)
      .then(() => {
        const remainingTodos = visibleTodos.filter(todo => !todo.completed);

        setTodosFromServer(remainingTodos);
      })
      .catch(() => {
        setErrorMesage(TodoError.delete);
      })
      .finally(() => {
        setChangedStatusIds([]);
        setSelectedStatus(Status.All);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todosFromServer]);

  const toggleTodoStatus = useCallback(async ({
    id,
    title,
    userId,
    completed,
  }: Todo) => {
    try {
      const newTodos = todosFromServer.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed: !completed };
        }

        return todo;
      });

      setTodosFromServer(newTodos);
      setSelectedTodoId(id);

      await todoService.updateTodo({
        id,
        title,
        userId,
        completed: !completed,
      }).then(() => {
        todoService
          .getTodos(todoService.USER_ID);
      });
    } catch {
      setErrorMesage(TodoError.update);
    } finally {
      setSelectedTodoId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todosFromServer, selectedStatus]);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={visibleTodos}
          setTodosFromServer={setTodosFromServer}
          setErrorMesage={setErrorMesage}
          setChangedStatusIds={setChangedStatusIds}
          setNewAddedTodoId={setNewAddedTodoId}
        />

        {visibleTodos.length > 0 && (
          <section className="todoapp__main">
            {
              visibleTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  todos={todosFromServer}
                  newAddedTodoId={newAddedTodoId}
                  setErrorMesage={setErrorMesage}
                  selectedTodoId={selectedTodoId}
                  setSelectedTodoId={setSelectedTodoId}
                  toggleTodoStatus={toggleTodoStatus}
                  setTodosFromServer={setTodosFromServer}
                  changedStatusIds={changedStatusIds}
                />
              ))
            }
          </section>
        )}

        {visibleTodos.length > 0
          && (
            <Footer
              todos={visibleTodos}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              deleteCompletedTodos={deleteCompletedTodos}
              allCompletedTodos={allCompletedTodos}
              allActiveTodos={allActiveTodos}
            />
          )}
      </div>

      {errorMesage && (
        <ErrorTab
          errorMesage={errorMesage}
          setErrorMesage={setErrorMesage}
        />
      )}
    </div>
  );
}

export default App;
