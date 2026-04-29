# FinSphere — Next.js 14 Edition

Modern rebuild of the FinSphere finance app with Next.js App Router, MongoDB, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

App runs at http://localhost:3000.

## First Login

1. Visit `/register` and create the **first user** — they automatically become **Admin**.
2. Subsequent registrations default to **Agent** role (admin can promote later).

## Stack

- **Next.js 14** App Router (JSX)
- **MongoDB** + **Mongoose** (connection string in `.env.local`)
- **JWT** auth via httpOnly cookies + bcrypt
- **Tailwind CSS** (dark sidebar `#343a40`, header `#2c3e50`, primary `#3498db`)
- **Lucide-React** icons
- **html2canvas + jsPDF** for PDF export & receipt generation

## Folder Structure

```
lib/         mongodb.js, auth.js, format.js, txLogic.js
models/      User, Customer, Account, Transaction, Group, AccountType, Ledger, Agent, Handover, Settings
app/api/     RESTful routes (auth, customers, accounts, transactions, agents, groups, account-types, ledgers, handovers, reports/*)
app/(dashboard)/  Protected pages (dashboard, customers, accounts, transactions, agents, handovers, master, reports, settings)
components/  Sidebar, Navbar, Modal, Receipt, ReportGenerator, Tables
```

## Roles

- **Admin** — full access to everything.
- **Agent** — can only see customers/accounts in their `assigned[]` array, can record transactions on those accounts, must hand cash over to admin via Agent Handovers.

## Transaction Engine

Every transaction is double-entry: it updates the **Primary Account** (customer) and a **Secondary Account** (Cash / Bank ledger).

Transaction types: `deposit`, `withdraw`, `repay_princ`, `repay_int`, `disburse`, `income`, `expense`, `agent_handover`.

Balance impact uses the same `getTxMod(account, type)` rules as the original app — see `lib/txLogic.js`.

## Reports

Day Book, Balance Book, Ledger, Loans, P&L, Balance Sheet — all support **Print** and **PDF download** (html2canvas + jsPDF).

## Receipts

Thermal-printer style receipts include **Save Image** and **Share to WhatsApp** (uses Web Share API on mobile, copy link fallback on desktop).
