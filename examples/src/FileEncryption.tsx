import React, { useState } from "react";
import { useAes } from "wasm-aes-react";

/**
 * Client-side file encryption/decryption example.
 * All operations happen in the browser - no data is sent to any server.
 */
export function FileEncryptionExample() {
  const { encrypt, decrypt, isLoading, error } = useAes();
  const [password, setPassword] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");

  const handleFileEncrypt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!password) {
      setStatus("Please enter a password first");
      return;
    }

    setStatus("Reading file...");
    setFileName(file.name);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      setStatus(`Encrypting ${file.name}...`);

      // Encrypt the file data
      const encrypted = await encrypt(fileData, { password });

      // Create a blob and download link
      const blob = new Blob([encrypted], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name}.encrypted`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus(`✓ Encrypted! Downloaded as ${file.name}.encrypted`);
    } catch (err) {
      setStatus(`✗ Encryption failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleFileDecrypt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!password) {
      setStatus("Please enter a password first");
      return;
    }

    setStatus("Reading encrypted file...");

    try {
      // Read encrypted file
      const arrayBuffer = await file.arrayBuffer();
      const encryptedData = new Uint8Array(arrayBuffer);

      setStatus("Decrypting...");

      // Decrypt the file data
      const decrypted = await decrypt(encryptedData, { password });

      // Determine original filename (remove .encrypted extension if present)
      const originalName = file.name.endsWith(".encrypted")
        ? file.name.slice(0, -10)
        : `${file.name}.decrypted`;

      // Create a blob and download link
      const blob = new Blob([decrypted], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus(`✓ Decrypted! Downloaded as ${originalName}`);
    } catch (err) {
      setStatus(`✗ Decryption failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Client-Side File Encryption</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Encrypt and decrypt files directly in your browser. No data leaves your computer.
      </p>

      <div style={{ marginBottom: "20px", padding: "15px", background: "#f0f7ff", borderRadius: "8px" }}>
        <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
          Encryption Password:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a strong password"
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "2px solid #4CAF50",
            borderRadius: "4px",
            boxSizing: "border-box"
          }}
        />
        <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
          Remember this password - you'll need it to decrypt your files!
        </small>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "20px"
      }}>
        {/* Encrypt Section */}
        <div style={{
          padding: "20px",
          border: "2px dashed #4CAF50",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <h3 style={{ marginTop: 0, color: "#4CAF50" }}>🔒 Encrypt File</h3>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Select a file to encrypt
          </p>
          <input
            type="file"
            onChange={handleFileEncrypt}
            disabled={!password || isLoading}
            style={{ display: "none" }}
            id="encrypt-file-input"
          />
          <label
            htmlFor="encrypt-file-input"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: password && !isLoading ? "#4CAF50" : "#ccc",
              color: "white",
              borderRadius: "4px",
              cursor: password && !isLoading ? "pointer" : "not-allowed",
              fontWeight: "bold"
            }}
          >
            Choose File to Encrypt
          </label>
        </div>

        {/* Decrypt Section */}
        <div style={{
          padding: "20px",
          border: "2px dashed #2196F3",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <h3 style={{ marginTop: 0, color: "#2196F3" }}>🔓 Decrypt File</h3>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Select an encrypted file
          </p>
          <input
            type="file"
            onChange={handleFileDecrypt}
            disabled={!password || isLoading}
            style={{ display: "none" }}
            id="decrypt-file-input"
          />
          <label
            htmlFor="decrypt-file-input"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: password && !isLoading ? "#2196F3" : "#ccc",
              color: "white",
              borderRadius: "4px",
              cursor: password && !isLoading ? "pointer" : "not-allowed",
              fontWeight: "bold"
            }}
          >
            Choose File to Decrypt
          </label>
        </div>
      </div>

      {/* Status Display */}
      {(status || error) && (
        <div style={{
          padding: "15px",
          background: error ? "#ffebee" : "#e8f5e9",
          border: `2px solid ${error ? "#f44336" : "#4CAF50"}`,
          borderRadius: "8px",
          marginTop: "20px"
        }}>
          {error && (
            <div style={{ color: "#f44336", fontWeight: "bold", marginBottom: "10px" }}>
              Error: {error.message}
            </div>
          )}
          <div style={{ color: error ? "#c62828" : "#2e7d32" }}>
            {status}
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{
          marginTop: "20px",
          textAlign: "center",
          fontSize: "18px",
          color: "#666"
        }}>
          <div style={{
            display: "inline-block",
            width: "20px",
            height: "20px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          <p>Processing...</p>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: "30px",
        padding: "20px",
        background: "#fff3e0",
        borderRadius: "8px",
        border: "2px solid #ff9800"
      }}>
        <h3 style={{ marginTop: 0, color: "#e65100" }}>ℹ️ How to use:</h3>
        <ol style={{ paddingLeft: "20px", color: "#666" }}>
          <li>Enter a strong password</li>
          <li>
            <strong>To encrypt:</strong> Click "Choose File to Encrypt", select a file,
            and it will be encrypted and downloaded automatically
          </li>
          <li>
            <strong>To decrypt:</strong> Click "Choose File to Decrypt", select an
            encrypted file (with the same password), and it will be decrypted
          </li>
          <li>
            <strong>Security:</strong> All encryption happens in your browser.
            No data is sent to any server.
          </li>
        </ol>
      </div>

      {/* Technical Details */}
      <details style={{ marginTop: "20px", padding: "15px", background: "#f5f5f5", borderRadius: "8px" }}>
        <summary style={{ cursor: "pointer", fontWeight: "bold", color: "#555" }}>
          Technical Details
        </summary>
        <ul style={{ paddingLeft: "20px", color: "#666", marginTop: "10px" }}>
          <li>Encryption: AES-256-CBC</li>
          <li>Key Derivation: PBKDF2-HMAC-SHA256 (100,000 iterations)</li>
          <li>Random salt and IV for each encryption</li>
          <li>WebAssembly-powered for performance</li>
          <li>File size limit: Browser memory dependent</li>
        </ul>
      </details>
    </div>
  );
}
