<template>
  <div class="ai-assistant">
    <h2>🤖 AI Todo Assistant</h2>
    <p class="subtitle">Ask me to manage your todos using natural language!</p>

    <div class="examples">
      <p><strong>Try these examples:</strong></p>
      <button
        v-for="example in examples"
        :key="example"
        @click="aiInput = example"
        class="example-btn"
      >
        {{ example }}
      </button>
    </div>

    <div class="ai-input-container">
      <textarea
        v-model="aiInput"
        @keydown.ctrl.enter="handleSubmit"
        @keydown.meta.enter="handleSubmit"
        placeholder="List all high priority tasks"
        class="ai-input"
        rows="3"
      ></textarea>
      <button
        @click="handleSubmit"
        :disabled="aiLoading || !aiInput.trim()"
        class="ask-btn"
      >
        {{ aiLoading ? "Thinking..." : "Ask AI ✨" }}
      </button>
    </div>

    <div v-if="aiReply" class="ai-response">
      <h3>AI Response:</h3>
      <div class="response-content">{{ aiReply }}</div>
    </div>

    <p class="note">
      💡 Note: This uses OpenAI's API. Add your API key in a <code>.env</code> file as
      <code>VITE_OPENAI_API_KEY</code>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAiTodoAgent } from "../composables/useAiTodoAgent";

const { aiInput, aiReply, aiLoading, runAiAgent } = useAiTodoAgent();

const examples = [
  "Add a todo to buy groceries tomorrow with high priority",
  "Show all my incomplete tasks",
  'Mark "buy groceries" as completed',
  "List all high priority tasks",
  "Add a meeting reminder for next Monday",
];

function handleSubmit() {
  if (!aiLoading.value && aiInput.value.trim()) {
    runAiAgent();
  }
}
</script>

<style scoped>
.ai-assistant {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 2rem;
}

h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
}

.subtitle {
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.examples {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.examples p {
  margin: 0 0 0.75rem 0;
  font-weight: 500;
}

.example-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.example-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.example-btn:last-child {
  margin-bottom: 0;
}

.ai-input-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ai-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  resize: vertical;
}

.ai-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.ai-input:focus {
  outline: none;
  border-color: white;
  background: rgba(255, 255, 255, 0.15);
}

.ask-btn {
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ask-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ask-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-response {
  background: rgba(255, 255, 255, 0.15);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.ai-response h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: white;
}

.response-content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
}

.note {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0;
}

code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}
</style>
