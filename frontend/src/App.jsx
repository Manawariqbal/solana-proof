import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [cid, setCid] = useState("");
  const [status, setStatus] = useState("");
  const backend = "http://localhost:5000";

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus("");
  };

  const uploadFile = async () => {
    if (!file) return alert("Choose a file first");
    setStatus("Uploading and hashing file...");
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(`${backend}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setHash(res.data.hash);
      setStatus(`File uploaded. Hash: ${res.data.hash}`);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed: " + (err?.response?.data?.error || err.message));
    }
  };

  const storeOnChain = async () => {
    if (!hash) return alert("Upload file first");
    setStatus("Uploading file to IPFS and storing on Solana...");
    try {
      // send filename to backend to trigger IPFS upload
      // note: server uses the saved multer filename (req.file.filename). If your frontend doesn't know saved filename, we rely on backend to find file by hash or pass filename in body. Here we only pass hash; if you want server to upload IPFS, also pass filename from upload response.
      const body = { hash }; // optional: add filename: savedName if returned earlier
      const res = await axios.post(`${backend}/onchain`, body);
      setCid(res.data.cid || "");
      setStatus(`Stored on Solana. Signature: ${res.data.signature}`);
    } catch (err) {
      console.error(err);
      setStatus("Store on-chain failed: " + (err?.response?.data?.error || err.message));
    }
  };

  const verifyOnChain = async () => {
    if (!hash && !cid) return alert("Upload and store first (need hash or cid)");
    setStatus("Searching Solana for proof...");
    try {
      const res = await axios.post(`${backend}/verify-onchain`, { hash, cid });
      if (res.data.verified) {
        setStatus(`Verified on-chain! Signature: ${res.data.signature}`);
      } else {
        setStatus("Not found on-chain in recent transactions");
      }
    } catch (err) {
      console.error(err);
      setStatus("Verification request failed: " + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">SolanaProof — IPFS + On-Chain Verify</h1>

        <input type="file" onChange={onFileChange} className="mb-4" />

        <div className="flex gap-3 mb-4">
          <button onClick={uploadFile} className="px-4 py-2 bg-blue-600 text-white rounded">Upload & Hash</button>
          <button onClick={storeOnChain} className="px-4 py-2 bg-green-600 text-white rounded">Store on Solana (IPFS)</button>
          <button onClick={verifyOnChain} className="px-4 py-2 bg-purple-600 text-white rounded">Verify on Solana</button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-700">{status}</p>
          {hash && <p className="mt-2"><strong>Hash:</strong> <span className="break-all">{hash}</span></p>}
          {cid && (
            <p className="mt-2">
              <strong>IPFS CID:</strong>{" "}
              <a className="text-blue-600" href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noreferrer">
                {cid}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
