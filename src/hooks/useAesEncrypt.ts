import { useState, useCallback } from "react";
import { encrypt_aes256, AesConfig } from "wasm-aes";
import type { EncryptResult } from "../types";
import { stringToUint8Array, uint8ArrayToBase64 } from "../utils/encoding";
import { ensureWasmInit } from "../utils/wasm-init";

/**
 * Hook for encrypting data with AES-256-CBC.
 *
 * Provides a stateful approach to encryption with result tracking.
 *
 * @example
 * ```tsx
 * const { encrypt, encryptString, data, isLoading, error, reset } = useAesEncrypt();
 *
 * const handleEncrypt = async () => {
 *   await encryptString("Sensitive data", "my-password");
 *   if (data) {
 *     console.log("Encrypted:", data);
 *   }
 * };
 * ```
 */
export function useAesEncrypt() {
  const [result, setResult] = useState<EncryptResult>({
    data: null,
    isLoading: false,
    error: null,
  });

  const encrypt = useCallback(
    async (
      data: Uint8Array,
      password: string,
      config?: AesConfig
    ): Promise<Uint8Array | null> => {
      setResult({ data: null, isLoading: true, error: null });

      try {
        await ensureWasmInit();
        const cfg = config || new AesConfig();
        const encrypted = encrypt_aes256(data, password, cfg);

        setResult({ data: encrypted, isLoading: false, error: null });
        return encrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setResult({ data: null, isLoading: false, error });
        return null;
      }
    },
    []
  );

  const encryptString = useCallback(
    async (
      text: string,
      password: string,
      config?: AesConfig
    ): Promise<string | null> => {
      const data = stringToUint8Array(text);
      const encrypted = await encrypt(data, password, config);
      return encrypted ? uint8ArrayToBase64(encrypted) : null;
    },
    [encrypt]
  );

  const reset = useCallback(() => {
    setResult({ data: null, isLoading: false, error: null });
  }, []);

  return {
    encrypt,
    encryptString,
    data: result.data,
    isLoading: result.isLoading,
    error: result.error,
    reset,
  };
}
