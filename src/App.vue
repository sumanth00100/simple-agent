<template>
  <div id="app">
    <header>
      <h1>🎯 AI-Powered Todo App</h1>
      <p class="tagline">Manage your tasks with natural language</p>
    </header>

    <main>
      <TodoList />
      <AiAssistant />
    </main>

    <footer>
      <p>Built with Vue 3 + TypeScript + AI ✨</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import TodoList from "./components/TodoList.vue";
import AiAssistant from "./components/AiAssistant.vue";
</script>

<style>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  margin: 0;
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 1.1rem;
}

main {
  flex: 1;
}

footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  color: #999;
  font-size: 0.9rem;
}

footer p {
  margin: 0;
}
</style>
