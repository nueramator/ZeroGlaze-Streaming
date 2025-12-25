# Zeroglaze

Stream to Earn - Trade streamer tokens on Solana

## Overview

Zeroglaze connects streamers' live streams to tokens/meme coins launched on the Solana blockchain. As investors trade these tokens, fees are distributed between the platform and streamers, creating a win-win-win scenario.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Solana (Devnet for MVP), SPL Token Program
- **Wallet**: Phantom Wallet Integration via @solana/wallet-adapter
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **Smart Contracts**: Anchor Framework (Rust)

## Project Status

**Status**: Initial setup complete - Ready for development

### MVP Scope
- ✅ Project initialization
- ⏳ Token launchpad (create streamer tokens)
- ⏳ Bonding curve trading mechanism
- ⏳ Wallet integration (Phantom)
- ⏳ Basic UI (streamer portal, trading interface)

### V2 Features (Post-MVP)
- Twitch API integration
- Live stream verification
- Dynamic fees based on stream status

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Phantom wallet browser extension
- Solana CLI (for smart contract deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Zeroglaze_streaming.git
cd Zeroglaze_streaming
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then fill in the required values in `.env`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
zeroglaze/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── streamer/    # Streamer portal pages
│   ├── trader/      # Trader portal pages
│   └── page.tsx     # Home page
├── components/       # React components
├── lib/             # Libraries and clients
├── utils/           # Utility functions
├── docs/            # Project documentation
└── public/          # Static assets
```

## Documentation

- [Project Specification](docs/Project_Spec_doc.md)
- [Architecture](docs/architecture.md)
- [Development Guide](CLAUDE.md)

## Contributing

This project follows strict development guidelines outlined in `CLAUDE.md`. Key points:
- Always create feature branches
- Never commit directly to `main`
- Run linting before commits
- Update documentation with changes

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
