# Chatty Sparrow

This is a full-stack conversational AI product, built with Next.js, Tailwind CSS, and powered by Genkit.

## High-level Features

- Real-time, low-latency chat UI with streaming responses.
- Contextual memory + retrieval using vector embeddings.
- User authentication and role separation.
- Clean, modern, mobile-first responsive design.
- Secure backend with data persistence.

## Getting Started

### Environment Variables

Create a `.env.local` file in the root of the project and add the necessary environment variables. For now, no variables are required to run the skeleton.

```bash
# .env.local
# Example:
# GOOGLE_API_KEY=...
```

### Running the Development Server

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS with shadcn/ui
- **AI/ML**: Google Gemini with Genkit
- **Database**: PostgreSQL (planned)
- **Vector DB**: Pinecone/Weaviate (planned)
- **Authentication**: JWT (planned)
