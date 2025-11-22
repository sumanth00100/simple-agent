import { ref, watch } from "vue";
import type { Todo, TodoFilter, CreateTodoOptions } from "../types/todo";

const STORAGE_KEY = "todos";

export function useTodos() {
  const todos = ref<Todo[]>([]);
  const isLoaded = ref(false);

  // Load todos from localStorage
  function loadTodosFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        todos.value = JSON.parse(stored);
      } else {
        todos.value = [];
      }
      isLoaded.value = true;
    } catch (error) {
      console.error("Failed to load todos from storage:", error);
      todos.value = [];
      isLoaded.value = true;
    }
  }

  // Save todos to localStorage
  function saveTodosToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value));
    } catch (error) {
      console.error("Failed to save todos to storage:", error);
    }
  }

  // Watch for changes and auto-save
  watch(
    todos,
    () => {
      if (isLoaded.value) {
        saveTodosToStorage();
      }
    },
    { deep: true }
  );

  // Add a new todo
  function addTodo(title: string, options?: CreateTodoOptions): Todo {
    const newTodo: Todo = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: options?.dueDate,
      priority: options?.priority,
    };
    todos.value.push(newTodo);
    return newTodo;
  }

  // List todos with optional filters
  function listTodos(filter?: TodoFilter): Todo[] {
    let filtered = todos.value;

    if (filter?.completed !== undefined) {
      filtered = filtered.filter((t) => t.completed === filter.completed);
    }

    if (filter?.date) {
      filtered = filtered.filter((t) => t.dueDate === filter.date);
    }

    if (filter?.priority) {
      filtered = filtered.filter((t) => t.priority === filter.priority);
    }

    return filtered;
  }

  // Complete a todo
  function completeTodo(id: number): boolean {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) {
      todo.completed = true;
      return true;
    }
    return false;
  }

  // Uncomplete a todo
  function uncompleteTodo(id: number): boolean {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) {
      todo.completed = false;
      return true;
    }
    return false;
  }

  // Update a todo
  function updateTodo(id: number, fields: Partial<Todo>): boolean {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) {
      Object.assign(todo, fields);
      return true;
    }
    return false;
  }

  // Delete a todo
  function deleteTodo(id: number): boolean {
    const index = todos.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      todos.value.splice(index, 1);
      return true;
    }
    return false;
  }

  // Find todo by title (fuzzy search with spelling tolerance)
  function findTodoByTitle(title: string): Todo | undefined {
    if (!title) return undefined;
    const searchTerm = title.toLowerCase().trim();

    // First try exact match
    let found = todos.value.find((todo) =>
      todo.title.toLowerCase().includes(searchTerm)
    );

    // If not found, try fuzzy matching for spelling mistakes
    if (!found && searchTerm.length > 3) {
      found = todos.value.find((todo) => {
        const todoTitle = todo.title.toLowerCase();
        // Check if most characters match (simple fuzzy logic)
        let matches = 0;
        for (let i = 0; i < searchTerm.length; i++) {
          if (todoTitle.includes(searchTerm[i])) matches++;
        }
        // If 70% of characters match, consider it a match
        return matches / searchTerm.length > 0.7;
      });
    }

    return found;
  }

  // Get suggestions for similar todo titles (for spelling mistakes)
  function getSuggestions(title: string, maxSuggestions = 3): Todo[] {
    if (!title) return [];
    const searchTerm = title.toLowerCase().trim();

    return todos.value
      .map((todo) => {
        const todoTitle = todo.title.toLowerCase();
        let score = 0;

        // Score based on character matches
        for (let i = 0; i < searchTerm.length; i++) {
          if (todoTitle.includes(searchTerm[i])) score++;
        }

        // Bonus for starting with same characters
        if (todoTitle.startsWith(searchTerm[0])) score += 2;

        return { todo, score };
      })
      .filter((item) => item.score > 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map((item) => item.todo);
  }

  // Initialize by loading from storage
  if (!isLoaded.value) {
    loadTodosFromStorage();
  }

  return {
    todos,
    addTodo,
    listTodos,
    completeTodo,
    uncompleteTodo,
    updateTodo,
    deleteTodo,
    findTodoByTitle,
    getSuggestions,
    loadTodosFromStorage,
    saveTodosToStorage,
  };
}
