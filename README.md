# CipherVault 🛡️

### Zero-Knowledge Secure Document Store

**Live Application:** [cvault-secure.vercel.app](https://cvault-secure.vercel.app/)

CipherVault is a premium, privacy-first file storage platform designed to ensure absolute data sovereignty. Built with a **Zero-Knowledge Architecture**, it ensures that even the host server cannot access, read, or decrypt your files. Every cryptographic operation happens exclusively in the user's browser.

---

## 🚀 Engineering Highlights

- **Zero-Knowledge Architecture:** No passwords or encryption keys are ever transmitted. The server only sees encrypted blobs, random salts, and initialization vectors.
- **Authenticated Encryption:** Leverages **AES-256-GCM** for military-grade confidentiality and built-in integrity verification.
- **Hardened Key Derivation:** Uses **PBKDF2** with 100,000 iterations of SHA-256 to transform user passwords into high-entropy cryptographic keys.
- **The "Digital Seal" Protocol:** A secondary SHA-256 hashing layer that verifies file integrity locally post-decryption, detecting any server-side tampering.
- **Automated Shredding Service:** Implements strict data retention policies via a background Cron service and a 3-attempt fail-safe policy.
- **Modern Cyber-Sleek UI:** A multi-page glassmorphism interface built with **Next.js 14**, **Tailwind CSS v4**, and **Framer Motion**.

---

## 🌐 Cloud Infrastructure

This platform is powered by a high-availability distributed stack:
- **Frontend:** Hosted on **Vercel** with global edge distribution.
- **Backend API:** High-performance Node.js service running on **Render**.
- **Database:** Managed **MongoDB Atlas** cluster for encrypted metadata persistence.
- **CI/CD:** Automated deployment pipeline triggered via **GitHub** actions.

---

## 🛠️ Technical Stack

- **Frontend:** Next.js (App Router), TypeScript, Web Crypto API (SubtleCrypto), Tailwind CSS, Lucide React.
- **Backend:** Node.js, Express, TypeScript, Multer, Node-Cron.
- **Database:** MongoDB (Metadata & Lifecycle tracking).
- **Security:** AES-256-GCM, PBKDF2 (SHA-256), SHA-256 Hashing.

---

## 📦 System Architecture

1.  **Encryption (Client-Side):**
    -   User selects file and provides Master Password.
    -   Random 16-byte Salt and 12-byte IV are generated.
    -   Key derived via PBKDF2 (100k iterations).
    -   Payload encrypted; SHA-256 "Digital Seal" is created.
2.  **Transmission:**
    -   Encrypted Blob + Cryptographic Metadata (Salt, IV, Seal) sent to Backend.
3.  **Persistence:**
    -   Backend stores the blob in an isolated filesystem and metadata in MongoDB.
    -   A background service monitors the TTL (Time-to-Live).
4.  **Retrieval (Zero-Knowledge):**
    -   User enters Access Token and Master Password.
    -   Browser fetches Blob + Metadata.
    -   Decryption and Integrity Verification happen entirely in local RAM.
    -   File is shredded from the server immediately upon success.

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on port 27017 or Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGODB_URI=your_mongodb_uri
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 🔒 Security Posture
CipherVault is designed to mitigate the following threat vectors:
- **Server Compromise:** Stored blobs are indecipherable without the client's local Master Key.
- **Man-in-the-Middle (MITM):** Authenticated encryption (GCM) and Digital Seals prevent payload tampering.
- **Brute-Force:** High PBKDF2 iteration count significantly increases the computational cost of dictionary attacks.
- **Data Persistence:** Automated background shredder ensures ephemeral data doesn't accumulate.

---

## 📜 License
MIT License - Created for educational and security research purposes.
