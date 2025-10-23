import React, { useState } from "react";
import {
  useAes,
  useAesEncrypt,
  useAesDecrypt,
  useAesConfig,
} from "wasm-aes-react";
import { FileEncryptionExample } from "./FileEncryption";

export function BasicExample() {
  const { encryptString, decryptString, isLoading, error } = useAes();
  const [password, setPassword] = useState("my-secret-password");
  const [plaintext, setPlaintext] = useState("Hello, World!");
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");

  const handleEncrypt = async () => {
    try {
      const result = await encryptString(plaintext, { password });
      setEncrypted(result);
    } catch (err) {
      console.error("Encryption failed:", err);
    }
  };

  const handleDecrypt = async () => {
    try {
      const result = await decryptString(encrypted, { password });
      setDecrypted(result);
    } catch (err) {
      console.error("Decryption failed:", err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>Basic useAes Example</h2>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: "10px", width: "300px" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Plaintext:
          <input
            type="text"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            style={{ marginLeft: "10px", width: "300px" }}
          />
        </label>
        <button onClick={handleEncrypt} disabled={isLoading} style={{ marginLeft: "10px" }}>
          Encrypt
        </button>
      </div>

      {encrypted && (
        <div style={{ marginBottom: "10px" }}>
          <strong>Encrypted (base64):</strong>
          <div style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "12px" }}>
            {encrypted}
          </div>
          <button onClick={handleDecrypt} disabled={isLoading} style={{ marginTop: "5px" }}>
            Decrypt
          </button>
        </div>
      )}

      {decrypted && (
        <div style={{ marginBottom: "10px" }}>
          <strong>Decrypted:</strong> {decrypted}
        </div>
      )}

      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
}

export function EncryptOnlyExample() {
  const { encryptString, data, isLoading, error, reset } = useAesEncrypt();
  const [text, setText] = useState("Sensitive data");
  const [password, setPassword] = useState("secure-password");

  const handleEncrypt = async () => {
    await encryptString(text, password);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>useAesEncrypt Example</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Text to encrypt"
          style={{ width: "300px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ width: "300px" }}
        />
      </div>

      <button onClick={handleEncrypt} disabled={isLoading}>
        {isLoading ? "Encrypting..." : "Encrypt"}
      </button>
      <button onClick={reset} style={{ marginLeft: "10px" }}>
        Reset
      </button>

      {data && (
        <div style={{ marginTop: "10px" }}>
          <strong>Result:</strong>
          <div style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "12px" }}>
            {data}
          </div>
        </div>
      )}

      {error && <div style={{ color: "red", marginTop: "10px" }}>Error: {error.message}</div>}
    </div>
  );
}

export function CustomConfigExample() {
  const { config, setPbkdf2Iterations, info } = useAesConfig({
    pbkdf2Iterations: 150000,
  });
  const { encryptString, decryptString } = useAes();
  const [result, setResult] = useState("");

  const handleEncryptWithConfig = async () => {
    if (!config) return;
    try {
      const encrypted = await encryptString("Data with custom config", {
        password: "password",
        config,
      });
      const decrypted = await decryptString(encrypted, {
        password: "password",
        config,
      });
      setResult(decrypted);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>useAesConfig Example</h2>

      <div style={{ marginBottom: "10px" }}>
        <strong>Configuration Info:</strong>
        <ul>
          <li>Salt Size: {info.saltSize} bytes</li>
          <li>IV Size: {info.ivSize} bytes</li>
          <li>Key Size: {info.keySize} bytes</li>
          <li>PBKDF2 Iterations: {info.pbkdf2Iterations}</li>
          <li>Min Encrypted Size: {info.minEncryptedSize} bytes</li>
        </ul>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          PBKDF2 Iterations:
          <input
            type="number"
            min={10000}
            max={10000000}
            defaultValue={150000}
            onChange={(e) => setPbkdf2Iterations(parseInt(e.target.value))}
            style={{ marginLeft: "10px", width: "150px" }}
          />
        </label>
      </div>

      <button onClick={handleEncryptWithConfig}>
        Encrypt & Decrypt with Custom Config
      </button>

      {result && (
        <div style={{ marginTop: "10px" }}>
          <strong>Result:</strong> {result}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"basics" | "file">("basics");

  return (
    <div>
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "30px 20px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ margin: 0, fontSize: "32px" }}>wasm-aes-react Examples</h1>
        <p style={{ margin: "10px 0 0 0", opacity: 0.9 }}>
          WebAssembly-powered AES-256 encryption for React
        </p>
      </div>

      <div style={{
        display: "flex",
        gap: "10px",
        padding: "20px",
        borderBottom: "2px solid #eee",
        background: "#f9f9f9"
      }}>
        <button
          onClick={() => setActiveTab("basics")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            background: activeTab === "basics" ? "#667eea" : "white",
            color: activeTab === "basics" ? "white" : "#333",
            boxShadow: activeTab === "basics" ? "0 4px 6px rgba(102, 126, 234, 0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.3s"
          }}
        >
          📝 Basic Examples
        </button>
        <button
          onClick={() => setActiveTab("file")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            background: activeTab === "file" ? "#667eea" : "white",
            color: activeTab === "file" ? "white" : "#333",
            boxShadow: activeTab === "file" ? "0 4px 6px rgba(102, 126, 234, 0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.3s"
          }}
        >
          📁 File Encryption
        </button>
      </div>

      {activeTab === "basics" ? (
        <div style={{ background: "white" }}>
          <BasicExample />
          <hr style={{ margin: "40px 20px", border: "none", borderTop: "2px solid #eee" }} />
          <EncryptOnlyExample />
          <hr style={{ margin: "40px 20px", border: "none", borderTop: "2px solid #eee" }} />
          <CustomConfigExample />
        </div>
      ) : (
        <div style={{ background: "white" }}>
          <FileEncryptionExample />
        </div>
      )}

      <div style={{
        marginTop: "40px",
        padding: "20px",
        background: "#f5f5f5",
        textAlign: "center",
        color: "#666",
        fontSize: "14px"
      }}>
        <p>
          Built with <a href="https://www.npmjs.com/package/wasm-aes" style={{ color: "#667eea" }}>wasm-aes</a> •
          All encryption happens in your browser • No data is sent to any server
        </p>
      </div>
    </div>
  );
}
