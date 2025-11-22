<template>
  <div class="todo-list-container">
    <h2>📝 My Todos</h2>
    
    <div v-if="todos.todos.value.length === 0" class="empty-state">
      <p>No active tasks</p>
      <p class="subtitle">What needs to be done?</p>
    </div>

    <div v-else>
      <!-- Manual Input -->
      <div class="add-todo-form">
        <input
          v-model="dueDate"
          type="date"
          class="date-input"
          placeholder="mm/dd/yyyy"
        />
        <select v-model="priority" class="priority-select">
          <option value="">No priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button @click="addManualTodo" class="add-btn">Add Todo</button>
      </div>

      <!-- Filters -->
      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          :class="{ active: currentFilter === filter.value }"
          class="filter-btn"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Todo List -->
      <div class="todo-items">
        <TodoItem
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
          @toggle="toggleTodo"
          @delete="deleteTodo"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useTodos } from "../composables/useTodos";
import TodoItem from "./TodoItem.vue";

const todos = useTodos();
const currentFilter = ref<"all" | "active" | "completed">("all");
const dueDate = ref("");
const priority = ref<"" | "low" | "medium" | "high">("");

const filters = [
  { label: "All", value: "all" as const },
  { label: "Active", value: "active" as const },
  { label: "Completed", value: "completed" as const },
];

const filteredTodos = computed(() => {
  switch (currentFilter.value) {
    case "active":
      return todos.listTodos({ completed: false });
    case "completed":
      return todos.listTodos({ completed: true });
    default:
      return todos.todos.value;
  }
});

function addManualTodo() {
  // This is just a placeholder - users should use AI assistant instead
  alert("Use the AI assistant below to add todos!");
}

function toggleTodo(id: number) {
  const todo = todos.todos.value.find((t) => t.id === id);
  if (todo) {
    if (todo.completed) {
      todos.uncompleteTodo(id);
    } else {
      todos.completeTodo(id);
    }
  }
}

function deleteTodo(id: number) {
  todos.deleteTodo(id);
}
</script>

<style scoped>
.todo-list-container {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-state p {
  margin: 0.5rem 0;
}

.subtitle {
  font-size: 0.875rem;
}

.add-todo-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.date-input,
.priority-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.875rem;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #45a049;
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.todo-items {
  display: flex;
  flex-direction: column;
}
</style>
