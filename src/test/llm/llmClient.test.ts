/// <reference types="node" />
import "mocha";
import * as assert from "assert";
import { LLMClient } from "../../llm/llmClient";

interface HttpRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

describe("LLMClient (HU-14 T1)", () => {
  it("sends an HTTPS request with the token from SecretStorage", async () => {
    const requests: HttpRequest[] = [];
    const httpClient = {
      post: async (request: HttpRequest): Promise<{ text: string }> => {
        requests.push(request);
        return { text: "License risk explanation" };
      },
    };
    const tokenStore = {
      getLlmApiKey: async (): Promise<string | undefined> => "secret-token",
    };
    const client = new LLMClient(httpClient, tokenStore);

    const result = await client.explain("snippet", {
      detectedLicense: "GPL-3.0",
    });

    assert.strictEqual(result, "License risk explanation");
    assert.deepStrictEqual(requests[0], {
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: "Bearer secret-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        snippet: "snippet",
        riskData: { detectedLicense: "GPL-3.0" },
      }),
    });
  });

  it("returns a fallback when the request times out instead of throwing", async () => {
    const httpClient = {
      post: async (): Promise<{ text: string }> => {
        return new Promise(() => undefined);
      },
    };
    const tokenStore = {
      getLlmApiKey: async (): Promise<string> => "secret-token",
    };
    const client = new LLMClient(httpClient, tokenStore, 1);

    await assert.doesNotReject(async () => {
      const result = await client.explain("snippet", {});
      assert.strictEqual(
        result,
        "Unable to generate an explanation at this time.",
      );
    });
  });

  it("does not log the token", async () => {
    const logs: string[] = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const capture = (...args: unknown[]) => logs.push(args.join(" "));
    console.log = capture;
    console.warn = capture;
    console.error = capture;

    try {
      const httpClient = {
        post: async (): Promise<{ text: string }> => ({ text: "explanation" }),
      };
      const tokenStore = {
        getLlmApiKey: async (): Promise<string> => "secret-token",
      };
      const client = new LLMClient(httpClient, tokenStore);

      await client.explain("snippet", {});

      assert.ok(!logs.some((message) => message.includes("secret-token")));
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  });
});
