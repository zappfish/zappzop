export default class Path {
  steps: Array<string>;

  constructor(steps: Array<string>) {
    this.steps = steps;

    if (this.steps.length === 0) {
      throw new Error("Cannot create an empty path.");
    }
  }

  get key() {
    return JSON.stringify(this.steps);
  }

  static fromKey(k: string) {
    return new Path(JSON.parse(k));
  }

  depth() {
    return this.steps.length;
  }

  startsWith(other: Path) {
    return other.isAncestorOf(this) || other.equals(this);
  }

  isAncestorOf(other: Path) {
    if (this.steps.length >= other.steps.length) return false;
    return this.steps.every((val, i) => val === other.steps[i]);
  }

  equals(other: Path) {
    if (other.steps.length !== this.steps.length) return false;
    return this.steps.every((v, i) => v === other.steps[i]);
  }

  parent(): Path | null {
    if (this.steps.length <= 1) return null;
    return new Path(this.steps.slice(0, -1));
  }

  child(uri: string): Path {
    return new Path([...this.steps, uri]);
  }

  leaf() {
    return this.steps.at(-1)!;
  }
}
