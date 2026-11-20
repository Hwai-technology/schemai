export interface DiffPreviewHost {
  showDiff(before: string, after: string): Promise<boolean>;
  apply(after: string): Promise<void>;
}

export class DiffPreview {
  public constructor(private readonly host: DiffPreviewHost) {}

  public async show(before: string, after: string): Promise<boolean> {
    const confirmed = await this.host.showDiff(before, after);

    if (!confirmed) {
      return false;
    }

    await this.host.apply(after);
    return true;
  }
}
