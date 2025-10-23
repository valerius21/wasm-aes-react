import { useState, useCallback } from "react";
import { decrypt_aes256, AesConfig } from "wasm-aes";
import type { DecryptResult } from "../types";
import {
  base64ToUint8Array,
  uint8ArrayToString,
} from "../utils/encoding";
import { ensureWasmInit } from "../utils/wasm-init";

/**
 * Hook for decrypting data with AES-256-CBC.
 *
 * Provides a stateful approach to decryption with result tracking.
 *
 * @example
 * ```tsx
 * const { decrypt, decryptString, data, isLoading, error, reset } = useAesDecrypt();
 *
 * const handleDecrypt = async () => {
 *   const encrypted = "base64-encrypted-data";
 *   await decryptString(encrypted, "my-password");
 *   if (data) {
 *     console.log("Decrypted:", data);
 *   }
 * };
 * ```
 */
export function useAesDecrypt() {
  const [result, setResult] = useState<DecryptResult>({
    data: null,
    isLoading: false,
    error: null,
  });

  const decrypt = useCallback(
    async (
      encryptedData: Uint8Array,
      password: string,
      config?: AesConfig
    ): Promise<Uint8Array | null> => {
      setResult({ data: null, isLoading: true, error: null });

      try {
        await ensureWasmInit();
        const cfg = config || new AesConfig();
        const decrypted = decrypt_aes256(encryptedData, password, cfg);

        setResult({ data: decrypted, isLoading: false, error: null });
        return decrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setResult({ data: null, isLoading: false, error });
        return null;
      }
    },
    []
  );

  const decryptString = useCallback(
    async (
      encryptedText: string,
      password: string,
      config?: AesConfig
    ): Promise<string | null> => {
      const encryptedData = base64ToUint8Array(encryptedText);
      const decrypted = await decrypt(encryptedData, password, config);
      return decrypted ? uint8ArrayToString(decrypted) : null;
    },
    [decrypt]
  );

  const reset = useCallback(() => {
    setResult({ data: null, isLoading: false, error: null });
  }, []);

  return {
    decrypt,
    decryptString,
    data: result.data,
    isLoading: result.isLoading,
    error: result.error,
    reset,
  };
}
