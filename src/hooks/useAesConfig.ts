import { useState, useCallback, useEffect } from "react";
import { AesConfig } from "wasm-aes";
import { ensureWasmInit } from "../utils/wasm-init";

export interface UseAesConfigOptions {
  pbkdf2Iterations?: number;
}

/**
 * Hook for managing AES configuration.
 *
 * Creates and manages an AesConfig instance with optional custom settings.
 * Automatically handles memory cleanup on unmount.
 *
 * @example
 * ```tsx
 * const { config, setPbkdf2Iterations, reset, info } = useAesConfig({
 *   pbkdf2Iterations: 200000
 * });
 *
 * // Use in encryption
 * const { encrypt } = useAes();
 * encrypt(data, { password: "secret", config });
 * ```
 */
export function useAesConfig(options?: UseAesConfigOptions) {
  const [config, setConfig] = useState<AesConfig | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Initialize WASM and create config
  useEffect(() => {
    ensureWasmInit().then(() => {
      const cfg = new AesConfig();
      if (options?.pbkdf2Iterations) {
        try {
          cfg.setPbkdf2Iterations(options.pbkdf2Iterations);
        } catch (err) {
          console.error("Failed to set PBKDF2 iterations:", err);
        }
      }
      setConfig(cfg);
    });
  }, [options?.pbkdf2Iterations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      config?.free();
    };
  }, [config]);

  const setPbkdf2Iterations = useCallback(
    async (iterations: number) => {
      if (!config) return;
      setError(null);
      try {
        await ensureWasmInit();
        // Force re-render by creating new config with same settings
        const newConfig = new AesConfig();
        newConfig.setPbkdf2Iterations(iterations);
        setConfig((old) => {
          old?.free();
          return newConfig;
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [config]
  );

  const reset = useCallback(async () => {
    setError(null);
    await ensureWasmInit();
    setConfig((old) => {
      old?.free();
      return new AesConfig();
    });
  }, []);

  const info = config ? {
    saltSize: config.saltSize,
    ivSize: config.ivSize,
    keySize: config.keySize,
    pbkdf2Iterations: config.pbkdf2Iterations,
    headerSize: config.headerSize,
    minEncryptedSize: config.minEncryptedSize,
  } : {
    saltSize: 0,
    ivSize: 0,
    keySize: 0,
    pbkdf2Iterations: 0,
    headerSize: 0,
    minEncryptedSize: 0,
  };

  return {
    config,
    setPbkdf2Iterations,
    reset,
    error,
    info,
  };
}
