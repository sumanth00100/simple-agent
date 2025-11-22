import { ref } from "vue";
import { useTodos } from "./useTodos";
import {
  callTodoAgent,
  type ChatMessage,
  type ToolDef,
} from "../services/aiClient";

export function useAiTodoAgent() {
  const aiInput = ref("");
  const aiReply = ref("");
  const aiLoading = ref(false);

  const todos = useTodos();

  // Define available tools for the AI agent
  const tools: ToolDef[] = [
    {
      name: "createTodo",
      description:
        "Create a new todo item with a title and optional due date and priority",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title or description of the todo",
          },
          dueDate: {
            type: "string",
            description: "The due date in YYYY-MM-DD format (optional)",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "The priority level (optional)",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "listTodos",
      description:
        "List all todos. Can optionally filter by completion status, date, or priority. Call with no parameters to list all todos.",
      parameters: {
        type: "object",
        properties: {
          completed: {
            type: "boolean",
            description: "Filter by completion status (optional)",
          },
          date: {
            type: "string",
            description: "Filter by due date in YYYY-MM-DD format (optional)",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Filter by priority (optional)",
          },
        },
        required: [],
      },
    },
    {
      name: "completeTodo",
      description: "Mark a todo as completed by its ID or title",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "The ID of the todo to complete",
          },
          title: {
            type: "string",
            description: "Search for todo by title if ID is not known",
          },
        },
        required: [],
      },
    },
    {
      name: "updateTodo",
      description: "Update a todo by its ID or title with new fields",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "The ID of the todo to update",
          },
          title: {
            type: "string",
            description: "Search for todo by title if ID is not known",
          },
          newTitle: {
            type: "string",
            description: "New title for the todo",
          },
          dueDate: {
            type: "string",
            description: "New due date in YYYY-MM-DD format",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "New priority level",
          },
        },
        required: [],
      },
    },
    {
      name: "deleteTodo",
      description: "Delete a todo by its ID or title",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "number",
            description: "The ID of the todo to delete",
          },
          title: {
            type: "string",
            description: "Search for todo by title if ID is not known",
          },
        },
        required: [],
      },
    },
  ];

  // Execute a tool call
  function executeTool(toolName: string, args: any): any {
    switch (toolName) {
      case "createTodo": {
        const todo = todos.addTodo(args.title, {
          dueDate: args.dueDate,
          priority: args.priority,
        });
        return {
          success: true,
          message: `Created todo: "${todo.title}"`,
          todo,
        };
      }

      case "listTodos": {
        const filter: any = {};
        if (args.completed !== undefined) filter.completed = args.completed;
        if (args.date) filter.date = args.date;
        if (args.priority) filter.priority = args.priority;

        const todoList = todos.listTodos(filter);
        return {
          success: true,
          count: todoList.length,
          todos: todoList,
        };
      }

      case "completeTodo": {
        let todoId = args.id;

        // If no ID, search by title
        if (!todoId && args.title) {
          const found = todos.findTodoByTitle(args.title);
          if (found) {
            todoId = found.id;
          } else {
            return {
              success: false,
              message: `Could not find todo with title: "${args.title}"`,
            };
          }
        }

        if (todoId) {
          const success = todos.completeTodo(todoId);
          return {
            success,
            message: success
              ? `Marked todo as completed`
              : `Could not find todo with ID ${todoId}`,
          };
        }

        return {
          success: false,
          message: "Please provide either id or title",
        };
      }

      case "updateTodo": {
        let todoId = args.id;

        // If no ID, search by title
        if (!todoId && args.title) {
          const found = todos.findTodoByTitle(args.title);
          console.log("🔍 Search by title:", args.title);
          console.log("🔍 Found todo:", found);
          if (found) {
            todoId = found.id;
          } else {
            // Check for spelling mistakes - get suggestions
            const suggestions = todos.getSuggestions(args.title);
            if (suggestions.length > 0) {
              return {
                success: false,
                message: `Could not find todo with title: "${args.title}". Did you mean one of these?`,
                suggestions: suggestions.map((t) => ({
                  id: t.id,
                  title: t.title,
                })),
              };
            }
            return {
              success: false,
              message: `Could not find todo with title: "${args.title}"`,
            };
          }
        }

        if (todoId) {
          const updates: any = {};
          if (args.newTitle) updates.title = args.newTitle;
          if (args.dueDate) updates.dueDate = args.dueDate;
          if (args.priority) updates.priority = args.priority;

          console.log("🔧 Updating todo ID:", todoId, "with:", updates);
          const success = todos.updateTodo(todoId, updates);
          console.log("🔧 Update result:", success);

          return {
            success,
            message: success
              ? `Updated todo successfully`
              : `Could not find todo with ID ${todoId}`,
            updatedTodo: success
              ? todos.todos.value.find((t) => t.id === todoId)
              : undefined,
          };
        }

        return {
          success: false,
          message: "Please provide either id or title",
        };
      }

      case "deleteTodo": {
        let todoId = args.id;

        // If no ID, search by title
        if (!todoId && args.title) {
          const found = todos.findTodoByTitle(args.title);
          if (found) {
            todoId = found.id;
          } else {
            return {
              success: false,
              message: `Could not find todo with title: "${args.title}"`,
            };
          }
        }

        if (todoId) {
          const success = todos.deleteTodo(todoId);
          return {
            success,
            message: success
              ? `Deleted todo`
              : `Could not find todo with ID ${todoId}`,
          };
        }

        return {
          success: false,
          message: "Please provide either id or title",
        };
      }

      default:
        return {
          success: false,
          message: `Unknown tool: ${toolName}`,
        };
    }
  }

  // System prompt for the AI
  const systemPrompt = `You are a Todo assistant inside a Vue 3 app. You help users manage their tasks stored on the client side.

When a user asks to do something with their todos, use the provided tools to:
- Create new todos
- List existing todos with filters
- Mark todos as completed
- Update todo details
- Delete todos

Always use the tools to perform operations instead of just telling the user what to do.
After calling tools, provide a friendly summary of what you did and show relevant task information.

When users mention relative dates like "today", "tomorrow", "this weekend", calculate the actual date.
Today's date is ${new Date().toISOString().split("T")[0]}.

Be concise and helpful.`;

  // Main AI agent function
  async function runAiAgent() {
    if (!aiInput.value.trim()) {
      aiReply.value = "Please enter a command.";
      return;
    }

    aiLoading.value = true;
    aiReply.value = "";

    try {
      // First call to AI with user input
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: aiInput.value },
      ];

      let response = await callTodoAgent(messages, tools);

      // Handle errors
      if (response.error) {
        aiReply.value = response.text || response.error;
        aiLoading.value = false;
        return;
      }

      // If AI wants to call tools
      if (response.toolCalls && response.toolCalls.length > 0) {
        // Execute all tool calls
        const toolResults = response.toolCalls.map((tc) => {
          const result = executeTool(tc.name, tc.arguments);
          return {
            tool: tc.name,
            result,
          };
        });

        // Call AI again with tool results to get final response
        messages.push({
          role: "assistant",
          content: `I executed the tools and got these results.`,
        });
        messages.push({
          role: "user",
          content: `Here are the actual results from the tools I called:\n\n${JSON.stringify(
            toolResults,
            null,
            2
          )}\n\nPlease summarize these ACTUAL results for the user. Do not make up or hallucinate any data - only report what you see in the results above.`,
        });

        const finalResponse = await callTodoAgent(messages);
        aiReply.value = finalResponse.text || "Task completed successfully.";
      } else if (response.text) {
        // Direct text response
        aiReply.value = response.text;
      } else {
        aiReply.value = "I processed your request.";
      }
    } catch (error: any) {
      console.error("AI agent error:", error);
      aiReply.value = "Sorry, I encountered an error. Please try again.";
    } finally {
      aiLoading.value = false;
    }
  }

  return {
    aiInput,
    aiReply,
    aiLoading,
    runAiAgent,
  };
}
