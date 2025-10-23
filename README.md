# wasm-aes-react

React hooks for [wasm-aes](https://www.npmjs.com/package/wasm-aes) - WebAssembly-based AES-256-CBC encryption with a clean, React-friendly API.

## Features

- **Simple React Hooks** - Easy-to-use hooks for encryption and decryption
- **WebAssembly Performance** - Fast encryption powered by Rust/WASM
- **TypeScript Support** - Full type definitions included
- **String & Binary Support** - Work with both strings and Uint8Array
- **Configurable** - Customize PBKDF2 iterations and other settings
- **State Management** - Built-in loading and error states
- **Memory Safe** - Automatic cleanup of WASM resources

## Installation

```bash
bun install wasm-aes-react wasm-aes
```

Or with npm:

```bash
npm install wasm-aes-react wasm-aes
```

**Note:** Modern bundlers (Vite, Webpack 5+, Next.js, etc.) handle the WebAssembly file automatically. No additional configuration needed!

## Live Examples

To see the library in action:

```bash
cd examples
bun install
bun run dev
```

Then open http://localhost:5173 to see:
- Basic string encryption/decryption examples
- File encryption/decryption demo
- Custom configuration examples

## Quick Start

```tsx
import { useAes } from "wasm-aes-react";

function App() {
  const { encryptString, decryptString, isLoading, error } = useAes();
  const [encrypted, setEncrypted] = useState("");

  const handleEncrypt = async () => {
    const result = await encryptString("Hello, World!", {
      password: "my-secret-password"
    });
    setEncrypted(result);
  };

  const handleDecrypt = async () => {
    const result = await decryptString(encrypted, {
      password: "my-secret-password"
    });
    console.log(result); // "Hello, World!"
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isLoading}>
        Encrypt
      </button>
      <button onClick={handleDecrypt} disabled={isLoading}>
        Decrypt
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## API

### `useAes()`

Main hook providing encryption and decryption functions.

```tsx
const {
  encrypt,        // (data: Uint8Array, options: EncryptOptions) => Promise<Uint8Array>
  decrypt,        // (encryptedData: Uint8Array, options: DecryptOptions) => Promise<Uint8Array>
  encryptString,  // (text: string, options: EncryptOptions) => Promise<string>
  decryptString,  // (encryptedText: string, options: DecryptOptions) => Promise<string>
  isLoading,      // boolean
  error          // Error | null
} = useAes();
```

**Example:**

```tsx
const { encryptString, decryptString } = useAes();

// Encrypt a string (returns base64)
const encrypted = await encryptString("Sensitive data", {
  password: "my-password",
  onSuccess: (data) => console.log("Encrypted!"),
  onError: (err) => console.error(err)
});

// Decrypt back to string
const decrypted = await decryptString(encrypted, {
  password: "my-password"
});
```

### `useAesEncrypt()`

Specialized hook for encryption with result state.

```tsx
const {
  encrypt,       // (data: Uint8Array, password: string, config?: AesConfig) => Promise<Uint8Array | null>
  encryptString, // (text: string, password: string, config?: AesConfig) => Promise<string | null>
  data,          // Uint8Array | null - encrypted result
  isLoading,     // boolean
  error,         // Error | null
  reset         // () => void
} = useAesEncrypt();
```

**Example:**

```tsx
const { encryptString, data, isLoading } = useAesEncrypt();

await encryptString("My secret", "password123");
if (data) {
  console.log("Encrypted:", data);
}
```

### `useAesDecrypt()`

Specialized hook for decryption with result state.

```tsx
const {
  decrypt,       // (encryptedData: Uint8Array, password: string, config?: AesConfig) => Promise<Uint8Array | null>
  decryptString, // (encryptedText: string, password: string, config?: AesConfig) => Promise<string | null>
  data,          // Uint8Array | null - decrypted result
  isLoading,     // boolean
  error,         // Error | null
  reset         // () => void
} = useAesDecrypt();
```

### `useAesConfig(options?)`

Hook for managing AES configuration.

```tsx
const {
  config,              // AesConfig instance
  setPbkdf2Iterations, // (iterations: number) => void
  reset,              // () => void
  error,              // Error | null
  info                // Configuration details
} = useAesConfig({
  pbkdf2Iterations: 200000 // optional, default is 100000
});
```

**Example:**

```tsx
const { config, info } = useAesConfig({ pbkdf2Iterations: 200000 });
const { encrypt } = useAes();

// Use custom config
await encrypt(data, {
  password: "password",
  config
});

console.log(info);
// {
//   saltSize: 16,
//   ivSize: 16,
//   keySize: 32,
//   pbkdf2Iterations: 200000,
//   headerSize: 32,
//   minEncryptedSize: 48
// }
```

## Utility Functions

```tsx
import {
  stringToUint8Array,
  uint8ArrayToString,
  uint8ArrayToBase64,
  base64ToUint8Array,
  hexToUint8Array,
  uint8ArrayToHex
} from "wasm-aes-react";
```

## Binary Data Example

```tsx
const { encrypt, decrypt } = useAes();

// Encrypt binary data
const data = new Uint8Array([1, 2, 3, 4, 5]);
const encrypted = await encrypt(data, { password: "secret" });

// Decrypt back to binary
const decrypted = await decrypt(encrypted, { password: "secret" });
```

## File Encryption Example

Encrypt and decrypt files completely client-side - no data leaves the browser!

```tsx
import { useAes } from "wasm-aes-react";

function FileEncryption() {
  const { encrypt, decrypt } = useAes();
  const [password, setPassword] = useState("");

  const handleFileEncrypt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !password) return;

    // Read file as binary
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Encrypt the file
    const encrypted = await encrypt(fileData, { password });

    // Download encrypted file
    const blob = new Blob([encrypted], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name}.encrypted`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileDecrypt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !password) return;

    // Read encrypted file
    const arrayBuffer = await file.arrayBuffer();
    const encryptedData = new Uint8Array(arrayBuffer);

    // Decrypt the file
    const decrypted = await decrypt(encryptedData, { password });

    // Download decrypted file
    const originalName = file.name.replace(".encrypted", "");
    const blob = new Blob([decrypted]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = originalName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <input type="file" onChange={handleFileEncrypt} />
      <input type="file" onChange={handleFileDecrypt} />
    </div>
  );
}
```

**See the full interactive example in `examples/FileEncryption.tsx`**

## Advanced Configuration

```tsx
import { useAes, useAesConfig, WasmAesConfig } from "wasm-aes-react";

function SecureComponent() {
  // Create custom config with higher security
  const { config } = useAesConfig({
    pbkdf2Iterations: 500000 // More iterations = slower but more secure
  });

  const { encryptString } = useAes();

  const handleEncrypt = async () => {
    const encrypted = await encryptString("Top secret", {
      password: "strong-password",
      config // Use custom config
    });
  };

  return <button onClick={handleEncrypt}>Encrypt Securely</button>;
}
```

## Error Handling

```tsx
const { encryptString, error } = useAes();

try {
  await encryptString("data", {
    password: "password",
    onError: (err) => {
      console.error("Encryption failed:", err.message);
    }
  });
} catch (err) {
  // Handle error
}

// Or use the error state
if (error) {
  console.error("Error:", error.message);
}
```

## Security Considerations

- **Password Strength**: Use strong, unique passwords
- **PBKDF2 Iterations**: Default is 100,000. Increase for higher security (at the cost of performance)
- **Key Derivation**: Keys are derived from passwords using PBKDF2-HMAC-SHA256
- **Encryption**: Uses AES-256-CBC with random salt and IV
- **Storage**: Encrypted data is safe to store as base64 strings

## TypeScript

Full TypeScript support with comprehensive type definitions:

```tsx
import type {
  AesConfig,
  EncryptOptions,
  DecryptOptions,
  AesHookReturn,
  EncryptResult,
  DecryptResult
} from "wasm-aes-react";
```

## License

MIT

## Credits

Built on top of [wasm-aes](https://www.npmjs.com/package/wasm-aes) by Valerius Mattfeld.
