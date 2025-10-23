import init from "wasm-aes";

let wasmInitialized = false;
let wasmInitPromise: Promise<void> | null = null;

/**
 * Ensures the WASM module is initialized before use.
 * This is called automatically by the hooks but can be called manually if needed.
 */
export async function ensureWasmInit(): Promise<void> {
  if (wasmInitialized) {
    return;
  }

  if (wasmInitPromise) {
    return wasmInitPromise;
  }

  // Try to import WASM URL for Vite, fall back to auto-detection
  try {
    // @ts-ignore - Dynamic import for Vite
    const wasmModule = await import("wasm-aes/wasm_aes_bg.wasm?url");
    wasmInitPromise = init(wasmModule.default).then(() => {
      wasmInitialized = true;
    });
  } catch {
    // Fallback for other bundlers
    wasmInitPromise = init().then(() => {
      wasmInitialized = true;
    });
  }

  return wasmInitPromise;
}

/**
 * Reset the initialization state (useful for testing)
 */
export function resetWasmInit(): void {
  wasmInitialized = false;
  wasmInitPromise = null;
}
