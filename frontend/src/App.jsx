import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [uploadResponse, setUploadResponse] = useState(null);
  const [solanaResponse, setSolanaResponse] = useState(null);
  const [verifyResponse, setVerifyResponse] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);

  const BACKEND_URL = "http://localhost:5000"; // 👈 your backend base URL

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("File selected:", selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setHash(data.hash);
      setUploadResponse(data);
      alert("✅ File uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed: " + err.message);
    }
  };

  const handleVerifyLocal = async () => {
    if (!hash) return alert("No hash found. Upload a file first!");

    try {
      const res = await fetch(`${BACKEND_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });

      const data = await res.json();
      setVerifyResponse(data);
      alert(data.message || "Verification complete!");
    } catch (err) {
      console.error(err);
      alert("❌ Verification failed");
    }
  };

  const handleStoreOnSolana = async () => {
    if (!hash) return alert("Upload a file first to get its hash!");

    try {
      const res = await fetch(`${BACKEND_URL}/onchain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });

      const data = await res.json();
      setSolanaResponse(data);
      alert(data.message || "Stored on Solana!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to store hash on Solana");
    }
  };

  const handleVerifyOnChain = async () => {
    if (!hash) return alert("Upload a file first!");

    try {
      const res = await fetch(`${BACKEND_URL}/verify-onchain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash }),
      });

      const data = await res.json();
      setVerifyResponse(data);
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("❌ On-chain verification failed");
    }
  };

  const handleWalletBalance = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/balance`);
      const data = await res.json();
      setWalletInfo(data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to fetch wallet balance");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">🔗 Solana Proof System</h1>

      {/* File Upload */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm mb-3 text-gray-300"
        />
        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mb-4 transition"
        >
          Upload File
        </button>

        {uploadResponse && (
          <div className="bg-gray-700 p-3 rounded-lg mb-4">
            <p><b>Filename:</b> {uploadResponse.filename}</p>
            <p><b>Hash:</b> {uploadResponse.hash}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleVerifyLocal}
            className="bg-yellow-500 hover:bg-yellow-600 py-2 rounded-lg transition"
          >
            Verify Locally
          </button>
          <button
            onClick={handleStoreOnSolana}
            className="bg-green-600 hover:bg-green-700 py-2 rounded-lg transition"
          >
            Store Hash on Solana
          </button>
          <button
            onClick={handleVerifyOnChain}
            className="bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition"
          >
            Verify On-Chain
          </button>
          <button
            onClick={handleWalletBalance}
            className="bg-gray-600 hover:bg-gray-700 py-2 rounded-lg transition"
          >
            Check Wallet Balance
          </button>
        </div>

        {walletInfo && (
          <div className="bg-gray-700 p-3 rounded-lg mt-4">
            <p><b>Public Key:</b> {walletInfo.publicKey}</p>
            <p><b>Balance:</b> {walletInfo.balance}</p>
          </div>
        )}

        {solanaResponse && (
          <div className="bg-gray-700 p-3 rounded-lg mt-4">
            <p>{solanaResponse.message}</p>
            {solanaResponse.explorer && (
              <a
                href={solanaResponse.explorer}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                View Transaction on Solana Explorer
              </a>
            )}
          </div>
        )}

        {verifyResponse && (
          <div className="bg-gray-700 p-3 rounded-lg mt-4">
            <p>{verifyResponse.message}</p>
            {verifyResponse.explorer && (
              <a
                href={verifyResponse.explorer}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                View Verification
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
