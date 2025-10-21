import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [message, setMessage] = useState("");
  const [walletInfo, setWalletInfo] = useState(null);

  const backendURL = "http://localhost:5000";

  // 📂 Select file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log("File selected:", selectedFile.name, selectedFile.size);
      setFile(selectedFile);
      setMessage("");
    }
  };

  // 📤 Upload file (POST /upload)
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file to:", `${backendURL}/upload`);

      const res = await axios.post(`${backendURL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload response:", res.data);
      setHash(res.data.hash);
      setMessage(`✅ File uploaded. Hash: ${res.data.hash}`);
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Upload failed: " + err.message);
    }
  };

  // 💰 Get Solana Wallet Balance (GET /balance)
  const handleGetBalance = async () => {
    try {
      const res = await axios.get(`${backendURL}/balance`);
      setWalletInfo(res.data);
    } catch (err) {
      console.error("Balance error:", err);
      setMessage("❌ Failed to fetch balance");
    }
  };

  // 🌐 Store file hash on Solana blockchain (POST /onchain)
  const handleStoreOnChain = async () => {
    try {
      const res = await axios.post(`${backendURL}/onchain`, { hash });
      console.log("✅ Onchain response:", res.data);
      setMessage(`✅ Hash stored on Solana. Signature: ${res.data.signature}`);
    } catch (err) {
      console.error("Onchain error:", err);
      setMessage("❌ Failed to store on Solana");
    }
  };

  // 🔗 Verify file authenticity on Solana (POST /verify-onchain)
  const handleVerifyOnChain = async () => {
    try {
      const res = await axios.post(`${backendURL}/verify-onchain`, { hash });
      console.log("✅ Verify onchain response:", res.data);
      if (res.data.isMatch) {
        setMessage("✅ File verified on Solana blockchain!");
      } else {
        setMessage("❌ File not found or hash mismatch on blockchain");
      }
    } catch (err) {
      console.error("Verify onchain error:", err);
      setMessage("❌ Verification failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">🔗 Solana Proof-of-File</h1>

      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 p-2 border rounded"
      />

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Upload
        </button>

        <button
          onClick={handleStoreOnChain}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Store on Solana
        </button>

        <button
          onClick={handleVerifyOnChain}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Verify on Solana
        </button>

        <button
          onClick={handleGetBalance}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          Get Wallet Balance
        </button>
      </div>

      {walletInfo && (
        <div className="bg-white p-3 rounded shadow-md w-80 text-center mb-2">
          <p>🪙 <strong>Address:</strong> {walletInfo.publicKey}</p>
          <p>💰 <strong>Balance:</strong> {walletInfo.balance}</p>
        </div>
      )}

      {message && (
        <div className="bg-white p-4 rounded shadow-md w-80 text-center">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default App;
