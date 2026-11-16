export class HttpClient {
    public async requestWithOfflineCheck(options: { online: boolean; url: string }): Promise<{ isOffline: boolean; warningIssued: boolean }> {
      const isOffline = !options.online;
      const warningIssued = isOffline;
      return {
        isOffline,
        warningIssued
      };
    }
  }