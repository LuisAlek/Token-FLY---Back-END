export abstract class ValueObject<T> {
  protected constructor(protected readonly value: T) {}

  getValue(): T {
    return this.value;
  }

  equals(other: ValueObject<T>): boolean {
    return other.constructor === this.constructor && this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
