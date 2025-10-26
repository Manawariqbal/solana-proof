import axios from "axios";
import fs from "fs";
import FormData from "form-data";

// 🔒 Hardcoded JWT (get from https://app.pinata.cloud → API Keys → JWT)
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5ZTkyYjAyZC0wYTcwLTQxYjYtODhhNC04YmIyYWI4NjUwYmEiLCJlbWFpbCI6Im1taXFiYWxtYW5hd2FyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MzBjNWQ2ZTYyMTk5Y2EwOGY3NCIsInNjb3BlZEtleVNlY3JldCI6IjhhNjYwMmI0ZDRkZjgyMTgxMjI3OGZiNzE4ZGQ1NGYwMDAyMTQ2YjliODE0M2U1N2ExNGQ0NGZmODlmNmE4MWMiLCJleHAiOjE3OTMwNDQ3NTN9.roGAp6IHxuzV82iqXSDcfuYo-PSmnwdD_bOepaONBGM";

export const uploadToIPFS = async (filePath, fileName) => {
  try {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    // Create a form-data instance (Node version)
    const data = new FormData();
    data.append("file", fs.createReadStream(filePath), fileName);

    const response = await axios.post(url, data, {
      maxBodyLength: Infinity,
      headers: {
        ...data.getHeaders(), // important to send correct multipart headers
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    });

    const cid = response.data.IpfsHash;
    console.log("✅ Uploaded to IPFS (Pinata):", cid);
    return `ipfs://${cid}`;
  } catch (err) {
    console.error("❌ IPFS Upload error (Pinata):", err.response?.data || err.message);
    throw new Error("IPFS upload failed");
  }
};
