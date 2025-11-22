import axios from "axios";

// Define provider type locally
type LLMProvider = "groq" | "gemini" | "openai";

// Define config inline to avoid import issues
const AI_CONFIG = {
  provider: "groq" as LLMProvider,
  models: {
    groq: "llama-3.1-8b-instant", // Fast & reliable for function calling
    gemini: "gemini-1.5-flash",
    openai: "gpt-4o-mini",
  },
  temperature: 0.7,
  maxTokens: 1000,
};

// Debug: Log the config
console.log("🔧 aiClient.ts - AI_CONFIG:", AI_CONFIG);
console.log("🔧 aiClient.ts - AI_CONFIG keys:", Object.keys(AI_CONFIG));
console.log("🔧 aiClient.ts - AI_CONFIG.provider:", AI_CONFIG.provider);
console.log("🔧 aiClient.ts - typeof AI_CONFIG:", typeof AI_CONFIG);

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ToolDef {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolCall {
  name: string;
  arguments: any;
}

export interface AiResponse {
  text?: string;
  toolCalls?: ToolCall[];
  error?: string;
}

// API Keys from environment
const API_KEYS: Record<LLMProvider, string | undefined> = {
  groq: import.meta.env.VITE_GROQ_API_KEY,
  gemini: import.meta.env.VITE_GEMINI_API_KEY,
  openai: import.meta.env.VITE_OPENAI_API_KEY,
};

// Debug: Log API keys on module load
console.log("🔧 aiClient.ts - API_KEYS loaded:", {
  groq: API_KEYS.groq ? `${API_KEYS.groq.substring(0, 15)}...` : "MISSING",
  gemini: API_KEYS.gemini
    ? `${API_KEYS.gemini.substring(0, 15)}...`
    : "MISSING",
  openai: API_KEYS.openai
    ? `${API_KEYS.openai.substring(0, 15)}...`
    : "MISSING",
});
console.log("🔧 aiClient.ts - Environment check:", {
  VITE_GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY ? "SET" : "NOT SET",
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY ? "SET" : "NOT SET",
  VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY ? "SET" : "NOT SET",
});

// API Endpoints
const API_URLS = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  gemini: "https://generativelanguage.googleapis.com/v1beta/models",
  openai: "https://api.openai.com/v1/chat/completions",
};

export async function callTodoAgent(
  messages: ChatMessage[],
  tools?: ToolDef[],
  toolResults?: any[]
): Promise<AiResponse> {
  console.log("🔧 callTodoAgent called");
  console.log("AI_CONFIG:", AI_CONFIG);
  console.log("Provider:", AI_CONFIG?.provider);
  console.log("API_KEYS:", {
    groq: API_KEYS.groq ? "Present" : "Missing",
    gemini: API_KEYS.gemini ? "Present" : "Missing",
    openai: API_KEYS.openai ? "Present" : "Missing",
  });

  const provider = AI_CONFIG.provider;
  const apiKey = API_KEYS[provider];

  console.log("Selected provider:", provider);
  console.log(
    "Selected API key:",
    apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING"
  );

  // Check if API key is configured
  if (!apiKey) {
    return {
      error: `${provider?.toUpperCase() || "UNKNOWN"} API key not configured.`,
      text: `Please add VITE_${
        provider?.toUpperCase() || "UNKNOWN"
      }_API_KEY to your .env file.\n\nGet your free API key at:\n• Groq: https://console.groq.com/\n• Gemini: https://makersuite.google.com/\n• OpenAI: https://platform.openai.com/`,
    };
  }

  // Route to the appropriate provider
  switch (provider) {
    case "groq":
      return callGroq(messages, tools, apiKey);
    case "gemini":
      return callGemini(messages, tools, apiKey);
    case "openai":
      return callOpenAI(messages, tools, apiKey);
    default:
      return {
        error: `Unknown provider: ${provider}`,
        text: `Provider ${provider} is not supported.`,
      };
  }
}

// Groq implementation (OpenAI-compatible API)
async function callGroq(
  messages: ChatMessage[],
  tools: ToolDef[] | undefined,
  apiKey: string
): Promise<AiResponse> {
  console.log("🚀 Calling Groq API...");
  console.log(
    "API Key present:",
    apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : "No"
  );
  console.log("Model:", AI_CONFIG.models.groq);
  console.log("Messages:", messages.length);
  console.log("Tools:", tools?.length || 0);

  try {
    const requestBody: any = {
      model: AI_CONFIG.models.groq,
      messages: messages,
      temperature: AI_CONFIG.temperature,
    };

    if (tools && tools.length > 0) {
      requestBody.tools = tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));
      requestBody.tool_choice = "auto";
    }

    console.log("📤 Sending request to:", API_URLS.groq);
    console.log("📦 Request body:", JSON.stringify(requestBody, null, 2));

    const response = await axios.post(API_URLS.groq, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const choice = response.data.choices[0];
    const message = choice.message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCalls: ToolCall[] = message.tool_calls.map((tc: any) => ({
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      }));
      return { toolCalls };
    }

    return { text: message.content };
  } catch (error: any) {
    return handleError(error, "Groq");
  }
}

// Gemini implementation
async function callGemini(
  messages: ChatMessage[],
  tools: ToolDef[] | undefined,
  apiKey: string
): Promise<AiResponse> {
  try {
    const model = AI_CONFIG.models.gemini;
    const url = `${API_URLS.gemini}/${model}:generateContent?key=${apiKey}`;

    // Convert messages to Gemini format
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // Add system message as first user message if present
    const systemMsg = messages.find((m) => m.role === "system");
    if (systemMsg) {
      contents.unshift({
        role: "user",
        parts: [{ text: `System: ${systemMsg.content}` }],
      });
    }

    const requestBody: any = {
      contents,
      generationConfig: {
        temperature: AI_CONFIG.temperature,
        maxOutputTokens: AI_CONFIG.maxTokens,
      },
    };

    // Gemini function calling format
    if (tools && tools.length > 0) {
      requestBody.tools = [
        {
          functionDeclarations: tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          })),
        },
      ];
    }

    const response = await axios.post(url, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    const candidate = response.data.candidates[0];
    const content = candidate.content;

    // Check for function calls
    if (content.parts && content.parts[0].functionCall) {
      const functionCall = content.parts[0].functionCall;
      return {
        toolCalls: [
          {
            name: functionCall.name,
            arguments: functionCall.args,
          },
        ],
      };
    }

    // Regular text response
    const text = content.parts[0].text;
    return { text };
  } catch (error: any) {
    return handleError(error, "Gemini");
  }
}

// OpenAI implementation
async function callOpenAI(
  messages: ChatMessage[],
  tools: ToolDef[] | undefined,
  apiKey: string
): Promise<AiResponse> {
  try {
    const requestBody: any = {
      model: AI_CONFIG.models.openai,
      messages: messages,
      temperature: AI_CONFIG.temperature,
    };

    if (tools && tools.length > 0) {
      requestBody.tools = tools.map((tool) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));
      requestBody.tool_choice = "auto";
    }

    const response = await axios.post(API_URLS.openai, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const choice = response.data.choices[0];
    const message = choice.message;

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCalls: ToolCall[] = message.tool_calls.map((tc: any) => ({
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      }));
      return { toolCalls };
    }

    return { text: message.content };
  } catch (error: any) {
    return handleError(error, "OpenAI");
  }
}

// Common error handler
function handleError(error: any, provider: string): AiResponse {
  console.error(`${provider} API call failed:`, error);
  console.error("Error details:", error.response?.data);
  console.error("Error status:", error.response?.status);
  console.error("Error message:", error.message);
  console.error("Full error:", JSON.stringify(error.response?.data, null, 2));

  let errorMessage = `Sorry, I encountered an error with ${provider}.`;

  if (error.response?.status === 401) {
    errorMessage = `❌ Invalid ${provider} API key.\n\nPlease check:\n• Your .env file has VITE_GROQ_API_KEY\n• The key is correct\n• You restarted the dev server after adding the key`;
  } else if (error.response?.status === 404) {
    errorMessage = `❌ ${provider} endpoint not found.\n\nAPI URL: ${error.config?.url}\n\nPlease check the configuration.`;
  } else if (error.response?.status === 429) {
    errorMessage = `🚦 Rate limit exceeded for ${provider}.\n\n💡 Try:\n• Wait a moment and retry\n• Switch to a different provider in config/ai.config.ts\n• Groq has higher free limits!`;
  } else if (error.response?.data?.error?.message) {
    errorMessage = `${provider} Error: ${error.response.data.error.message}`;
  } else if (error.message) {
    errorMessage = `Error: ${error.message}\n\nCheck the browser console (F12) for more details.`;
  }

  return {
    error: errorMessage,
    text: errorMessage,
  };
}
