# 💰 Personal Finance Tracker

A modern, full-stack personal finance management application built with Next.js, Prisma, and BetterAuth. Track your accounts, transactions, and cryptocurrency portfolio all in one place.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)

## ✨ Features

- 🔐 **Authentication** - Secure login with BetterAuth (Google OAuth & credentials)
- 💳 **Account Management** - Track multiple accounts (checking, savings, credit cards, investments, cash)
- 📊 **Transaction Tracking** - Organize expenses and income with categories and tags
- 💸 **Credit Card Support** - Properly track debt with negative balances
- 🪙 **Cryptocurrency Portfolio** - Monitor your crypto holdings and performance
- 🎨 **Modern UI** - Clean, responsive interface built with Tailwind CSS
- 🐳 **Docker Ready** - Easy deployment with Docker Compose
- 🏗️ **Clean Architecture** - Domain-driven design with separation of concerns

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: BetterAuth
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18+ or Docker
- PostgreSQL (or use Docker Compose)
- npm or yarn

## 🛠️ Installation

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/AntoSalazar/personal-finance-tracker.git
cd personal-finance-tracker
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/finance_app"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Start the application:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
docker-compose exec app npx prisma migrate deploy
```

6. Access the app at [http://localhost:3000](http://localhost:3000)

### Option 2: Local Development

1. Clone and install dependencies:
```bash
git clone https://github.com/AntoSalazar/personal-finance-tracker.git
cd personal-finance-tracker
npm install
```

2. Set up your `.env` file (see above)

3. Run database migrations:
```bash
npx prisma migrate deploy
```

4. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
finance-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── api/               # API routes
│   └── hooks/                 # React hooks
├── lib/
│   ├── domain/                # Domain entities & interfaces
│   │   ├── entities/          # Business entities
│   │   └── repositories/      # Repository interfaces
│   ├── application/           # Use cases (business logic)
│   │   ├── use-cases/
│   │   │   ├── accounts/
│   │   │   ├── categories/
│   │   │   ├── crypto/
│   │   │   └── transactions/
│   ├── infrastructure/        # External services & implementations
│   │   ├── api/              # API utilities
│   │   ├── auth/             # BetterAuth configuration
│   │   └── database/         # Prisma client & repositories
│   └── presentation/         # UI components
│       └── components/
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
└── docker-compose.yml        # Docker configuration
```

## 🎯 Usage

### Creating Accounts

1. Navigate to the **Accounts** page
2. Click "Add Account"
3. Fill in the details:
   - **Name**: e.g., "Chase Checking"
   - **Type**: CHECKING, SAVINGS, CREDIT_CARD, INVESTMENT, CASH, or OTHER
   - **Balance**: 
     - Positive for assets (checking, savings)
     - Negative for liabilities (credit cards: `-857` means you owe $857)
   - **Currency**: USD (default)

### Tracking Transactions

1. Go to the **Transactions** page
2. Create a new transaction:
   - Select the account
   - Choose EXPENSE, INCOME, or TRANSFER
   - Add amount, category, and description
   - For credit cards: expenses increase debt, payments reduce it

### Managing Categories

Categories help organize your transactions:
- **EXPENSE categories**: Food, Transportation, Entertainment, etc.
- **INCOME categories**: Salary, Investments, etc.

### Cryptocurrency Portfolio

Track your crypto investments:
- Add holdings with purchase price and date
- Monitor current value and profit/loss
- Automatic price updates (if configured)

## 🔧 API Endpoints

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/[id]` - Get account by ID
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/[id]` - Delete account

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories?type=EXPENSE` - Filter by type
- `POST /api/categories` - Create category

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction

### Crypto
- `GET /api/crypto` - Get crypto holdings
- `POST /api/crypto` - Add crypto holding
- `POST /api/crypto/update-prices` - Update crypto prices

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:
- `user` - User accounts (BetterAuth)
- `accounts` - Financial accounts
- `transactions` - Financial transactions
- `categories` - Transaction categories
- `tags` - Transaction tags
- `crypto_holdings` - Cryptocurrency holdings
- `crypto_prices` - Cryptocurrency price data

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Secret key for BetterAuth | Yes |
| `BETTER_AUTH_URL` | Application URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Anto Salazar**

- GitHub: [@AntoSalazar](https://github.com/AntoSalazar)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication by [BetterAuth](https://www.better-auth.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)

---

⭐ If you find this project helpful, please consider giving it a star!
