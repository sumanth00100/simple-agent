export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

export type TodoFilter = {
  completed?: boolean;
  date?: string;
  priority?: "low" | "medium" | "high";
};

export type CreateTodoOptions = {
  dueDate?: string;
  priority?: "low" | "medium" | "high";
};

export type Priority = "low" | "medium" | "high";
