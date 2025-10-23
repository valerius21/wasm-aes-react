import type { AesConfig, AesError } from "wasm-aes";

export type { AesConfig, AesError };

export interface AesState {
  isLoading: boolean;
  error: Error | null;
}

export interface EncryptResult {
  data: Uint8Array | null;
  isLoading: boolean;
  error: Error | null;
}

export interface DecryptResult {
  data: Uint8Array | null;
  isLoading: boolean;
  error: Error | null;
}

export interface EncryptOptions {
  password: string;
  config?: AesConfig;
  onSuccess?: (encrypted: Uint8Array) => void;
  onError?: (error: Error) => void;
}

export interface DecryptOptions {
  password: string;
  config?: AesConfig;
  onSuccess?: (decrypted: Uint8Array) => void;
  onError?: (error: Error) => void;
}

export interface AesHookReturn {
  encrypt: (data: Uint8Array, options: EncryptOptions) => Promise<Uint8Array>;
  decrypt: (encryptedData: Uint8Array, options: DecryptOptions) => Promise<Uint8Array>;
  encryptString: (text: string, options: EncryptOptions) => Promise<string>;
  decryptString: (encryptedText: string, options: DecryptOptions) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
}
