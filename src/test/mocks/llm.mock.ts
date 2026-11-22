export const mockLLMResponse = {
    id: "chatcmpl-mock-123",
    object: "chat.completion",
    created: 1700000000,
    model: "gpt-4-mock",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Mock response: Code analysis completed successfully with no critical issues."
        },
        finish_reason: "stop"
      }
    ]
  };
  
  export class MockLLMService {
    async generateCompletion(prompt: string) {
      if (!prompt) {
        throw new Error("Prompt cannot be empty");
      }
      return mockLLMResponse;
    }
  }