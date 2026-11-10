export const mockGitHubSearchResults = {
    total_count: 2,
    incomplete_results: false,
    items: [
      {
        id: 101,
        name: "schema-demo",
        full_name: "test-user/schema-demo",
        html_url: "https://github.com/test-user/schema-demo",
        description: "A demo repository for schema testing",
        stargazers_count: 42
      },
      {
        id: 102,
        name: "vscode-plugin",
        full_name: "test-user/vscode-plugin",
        html_url: "https://github.com/test-user/vscode-plugin",
        description: "Sample VS Code extension repo",
        stargazers_count: 15
      }
    ]
  };
  
  export class MockGitHubSearchService {
    async searchRepositories(query: string) {
      if (!query) {
        return { total_count: 0, items: [] };
      }
      return mockGitHubSearchResults;
    }
  }