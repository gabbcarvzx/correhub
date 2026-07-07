export async function withFallback<T>(input: {
  query: () => Promise<T>;
  fallback: () => T;
  isEmpty?: (value: T) => boolean;
}): Promise<T> {
  try {
    const value = await input.query();

    if (input.isEmpty ? input.isEmpty(value) : !value) {
      return input.fallback();
    }

    return value;
  } catch {
    return input.fallback();
  }
}
