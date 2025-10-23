// Hooks
export { useAes } from "./hooks/useAes";
export { useAesEncrypt } from "./hooks/useAesEncrypt";
export { useAesDecrypt } from "./hooks/useAesDecrypt";
export { useAesConfig } from "./hooks/useAesConfig";
export type { UseAesConfigOptions } from "./hooks/useAesConfig";

// Utilities
export {
  stringToUint8Array,
  uint8ArrayToString,
  uint8ArrayToBase64,
  base64ToUint8Array,
  hexToUint8Array,
  uint8ArrayToHex,
} from "./utils/encoding";

export { ensureWasmInit, resetWasmInit } from "./utils/wasm-init";

// Types
export type {
  AesConfig,
  AesError,
  AesState,
  EncryptResult,
  DecryptResult,
  EncryptOptions,
  DecryptOptions,
  AesHookReturn,
} from "./types";

// Re-export from wasm-aes for convenience
export { AesConfig as WasmAesConfig, ErrorCode, version, default_config_info } from "wasm-aes";
