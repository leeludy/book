import React from "react";

interface CreateStrictContextOptions<T> {
  errorMessage?: string;
  defaultValues?: Partial<T>;
  name: string;
}

export function createStrictContext<T>(options: CreateStrictContextOptions<T>) {
  const Context = React.createContext<T>(undefined!);

  Context.displayName = options.name;

  function useContext(): T {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error(
        `[${options.name}] ${
          options.errorMessage ?? "Context Provider is missing."
        }`,
      );
    }

    return { ...options.defaultValues, ...context };
  }

  return [Context.Provider, useContext] as const;
}
