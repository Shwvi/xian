export abstract class BaseDescriptionGenerator {
  protected abstract templates: Record<string, Record<string, string[]>>;

  protected getRandomTemplate(type: string, subType: string): string {
    const templates = this.templates[type]?.[subType];
    if (!templates || templates.length === 0) {
      return "";
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }

  protected formatTemplate(
    template: string,
    context: Record<string, any>
  ): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      return String(context[key] || "");
    });
  }

  abstract generate(context: Record<string, any>): string;
}
