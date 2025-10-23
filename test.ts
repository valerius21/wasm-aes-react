import init, { encrypt_aes256, decrypt_aes256, AesConfig, version } from "wasm-aes";
import { stringToUint8Array, uint8ArrayToString } from "./src/utils/encoding";

// Initialize WASM module
await init();

console.log("wasm-aes version:", version());
console.log("\nTesting encryption/decryption...\n");

const password = "test-password";
const plaintext = "Hello, World! This is a test message.";
const config = new AesConfig();

console.log("Plaintext:", plaintext);
console.log("Password:", password);

// Encrypt
const data = stringToUint8Array(plaintext);
const encrypted = encrypt_aes256(data, password, config);
console.log("Encrypted bytes:", encrypted.length);

// Decrypt
const decrypted = decrypt_aes256(encrypted, password, config);
const decryptedText = uint8ArrayToString(decrypted);

console.log("Decrypted:", decryptedText);
console.log("\nSuccess:", plaintext === decryptedText ? "✓" : "✗");

// Test with custom config
console.log("\n--- Testing with custom config ---\n");
const customConfig = new AesConfig();
customConfig.setPbkdf2Iterations(200000);

console.log("PBKDF2 Iterations:", customConfig.pbkdf2Iterations);
console.log("Salt Size:", customConfig.saltSize);
console.log("IV Size:", customConfig.ivSize);
console.log("Key Size:", customConfig.keySize);

const encrypted2 = encrypt_aes256(data, password, customConfig);
const decrypted2 = decrypt_aes256(encrypted2, password, customConfig);
const decryptedText2 = uint8ArrayToString(decrypted2);

console.log("Decrypted with custom config:", decryptedText2);
console.log("Success:", plaintext === decryptedText2 ? "✓" : "✗");

console.log("\nAll tests passed!");
