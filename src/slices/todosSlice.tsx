import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Todo } from '../types/Todo';
import * as todoService from '../api/todos';
import { TodoError } from '../types/TodoError';

type TodosState = {
  todos: Todo[],
  loading: boolean,
  error: TodoError,
};

const initialState: TodosState = {
  todos: [],
  loading: false,
  error: TodoError.empty,
};

export const fetchTodos = createAsyncThunk(
  'todos/fetch',
  async (userId: number) => {
    const todos = await todoService.getTodos(userId);

    return todos;
  },
);

export const addTodo = createAsyncThunk(
  'todos/add',
  async ({ title, userId, completed }: Todo) => {
    const newTodo = await todoService.createTodo({ title, userId, completed });

    return newTodo;
  }
);

export const updateTodoStatus = createAsyncThunk(
  'todos/updateStatus',
  async ({ id, title, userId, completed }: Todo) => {
    await todoService.updateTodo({
      id,
      title,
      userId,
      completed: !completed,
    });

    return { id, completed: !completed };
  }
);

export const updateTodoTitle = createAsyncThunk(
  'todos/updateTitle',
  async ({ id, title, userId, completed }: Todo) => {
    await todoService.updateTodo({
      id,
      title,
      userId,
      completed,
    });

    return { id, title };
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/delete',
  async (todoId: number) => {
    await todoService.deleteTodo(String(todoId));

    return todoId;
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setErrorMessage: (state, action) => {
      state.error = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      //fetch reducers:
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = TodoError.empty;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.todos = action.payload;
        state.loading = false;
        state.error = TodoError.empty;
      })
      .addCase(fetchTodos.rejected, (state) => {
        state.loading = false;
        state.error = TodoError.load;
      })
      //add todo reducer:
      .addCase(addTodo.pending, (state) => {
        state.loading = true;
        state.error = TodoError.empty;
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.error = TodoError.empty;
        state.todos.push(action.payload);
      })
      .addCase(addTodo.rejected, (state) => {
        state.loading = false;
        state.error = TodoError.add;
      })
      //update status reducers:
      .addCase(updateTodoStatus.pending, (state) => {
        state.loading = true;
        state.error = TodoError.empty;
      })
      .addCase(updateTodoStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = TodoError.empty;

        const updatedTodo = state.todos.find(todo => todo.id === action.payload.id);

        if (updatedTodo) {
          updatedTodo.completed = !updatedTodo.completed;
        }
      })
      .addCase(updateTodoStatus.rejected, (state) => {
        state.loading = false;
        state.error = TodoError.update;
      })
      //update title reducers
      .addCase(updateTodoTitle.pending, (state) => {
        state.loading = true;
        state.error = TodoError.empty;
      })
      .addCase(updateTodoTitle.fulfilled, (state, action) => {
        state.loading = false;
        state.error = TodoError.empty;

        const { id, title } = action.payload;
        const updatedTodo = state.todos.find(todo => todo.id === id);

        if (updatedTodo) {
          updatedTodo.title = title;
        }
      })
      .addCase(updateTodoTitle.rejected, (state) => {
        state.loading = false;
        state.error = TodoError.update;
      })
      //delete reducers
      .addCase(deleteTodo.pending, (state) => {
        state.loading = true;
        state.error = TodoError.empty;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        const deletedTodoId = action.payload;

        state.todos = state.todos.filter(todo => todo.id !== deletedTodoId);
        state.loading = false;
        state.error = TodoError.empty;
      })
      .addCase(deleteTodo.rejected, (state) => {
        state.loading = false;
        state.error = TodoError.delete;
      });
  },
});

export const { setErrorMessage } = todosSlice.actions;
export default todosSlice.reducer;
