# SolanaProof 🚀

### Verify File Authenticity on the Solana Blockchain

SolanaProof is a decentralized web app that lets users upload files and verify their authenticity by storing file hashes on the Solana Devnet.

## 🧱 Tech Stack
- Frontend: React + Vite + Tailwind CSS  
- Backend: Node.js + Express  
- Blockchain: Solana (Devnet via `@solana/web3.js`)

## ⚙️ Setup
```bash
git clone https://github.com/<your-username>/solana-proof.git
cd frontend && npm install && npm run dev
cd backend && npm install && node server.js


## 🌀 Git Workflow

1. Always pull latest:
   ```bash
   git checkout main
   git pull origin main
2. Create daily branch:
   git checkout -b dayN-feature
3. Commit and push:
   git add .
   git commit -m "dayN: your change"
   git push origin dayN-feature
4 .Create Pull Request → Merge → Delete branch