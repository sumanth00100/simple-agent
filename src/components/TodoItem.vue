<template>
  <div class="todo-item" :class="{ completed: todo.completed }">
    <div class="todo-content">
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="$emit('toggle', todo.id)"
        class="todo-checkbox"
      />
      <div class="todo-details">
        <span class="todo-title">{{ todo.title }}</span>
        <div class="todo-meta">
          <span v-if="todo.dueDate" class="todo-date">
            📅 {{ formatDate(todo.dueDate) }}
          </span>
          <span v-if="todo.priority" class="todo-priority" :class="`priority-${todo.priority}`">
            {{ todo.priority.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>
    <button @click="$emit('delete', todo.id)" class="delete-btn" title="Delete">
      🗑️
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from "../types/todo";

defineProps<{
  todo: Todo;
}>();

defineEmits<{
  toggle: [id: number];
  delete: [id: number];
}>();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.todo-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: #999;
}

.todo-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
}

.todo-details {
  flex: 1;
}

.todo-title {
  display: block;
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.todo-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.todo-date {
  font-size: 0.875rem;
  color: #666;
}

.todo-priority {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.priority-high {
  background: #fee;
  color: #c33;
}

.priority-medium {
  background: #fef3cd;
  color: #856404;
}

.priority-low {
  background: #d1ecf1;
  color: #0c5460;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0.25rem;
}

.delete-btn:hover {
  opacity: 1;
}
</style>
