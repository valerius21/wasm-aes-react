import { useState, useCallback } from "react";
import {
  encrypt_aes256,
  decrypt_aes256,
  AesConfig,
} from "wasm-aes";
import type { AesHookReturn, EncryptOptions, DecryptOptions } from "../types";
import {
  stringToUint8Array,
  uint8ArrayToString,
  uint8ArrayToBase64,
  base64ToUint8Array,
} from "../utils/encoding";
import { ensureWasmInit } from "../utils/wasm-init";

/**
 * Main hook for AES-256 encryption and decryption operations.
 *
 * Provides both binary and string-based encryption/decryption methods
 * with automatic loading and error state management.
 *
 * @example
 * ```tsx
 * const { encrypt, decrypt, encryptString, decryptString, isLoading, error } = useAes();
 *
 * const handleEncrypt = async () => {
 *   const encrypted = await encryptString("Hello, World!", {
 *     password: "my-secret-password"
 *   });
 *   console.log(encrypted);
 * };
 * ```
 */
export function useAes(): AesHookReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (data: Uint8Array, options: EncryptOptions): Promise<Uint8Array> => {
      setIsLoading(true);
      setError(null);

      try {
        await ensureWasmInit();
        const config = options.config || new AesConfig();
        const encrypted = encrypt_aes256(data, options.password, config);

        options.onSuccess?.(encrypted);
        return encrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const decrypt = useCallback(
    async (
      encryptedData: Uint8Array,
      options: DecryptOptions
    ): Promise<Uint8Array> => {
      setIsLoading(true);
      setError(null);

      try {
        await ensureWasmInit();
        const config = options.config || new AesConfig();
        const decrypted = decrypt_aes256(
          encryptedData,
          options.password,
          config
        );

        options.onSuccess?.(decrypted);
        return decrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const encryptString = useCallback(
    async (text: string, options: EncryptOptions): Promise<string> => {
      const data = stringToUint8Array(text);
      const encrypted = await encrypt(data, options);
      return uint8ArrayToBase64(encrypted);
    },
    [encrypt]
  );

  const decryptString = useCallback(
    async (encryptedText: string, options: DecryptOptions): Promise<string> => {
      const encryptedData = base64ToUint8Array(encryptedText);
      const decrypted = await decrypt(encryptedData, options);
      return uint8ArrayToString(decrypted);
    },
    [decrypt]
  );

  return {
    encrypt,
    decrypt,
    encryptString,
    decryptString,
    isLoading,
    error,
  };
}
