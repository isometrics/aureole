# Chat Components

This directory contains the modular components for the chat application.

## Components

### Chat
The main chat component that orchestrates all other components. It uses the `useChat` hook for state management.

### Message
Renders individual chat messages with different styles for user and assistant messages.

### MessagesList
Displays the list of all messages and includes the loading indicator when needed.

### MessageInput
Handles the input form for sending new messages, including the send button.

### LoadingIndicator
Shows an animated loading indicator with bouncing dots.

## Usage

```tsx
import { Chat } from '../components';

export default function Home() {
  return <Chat />;
}
```

## Structure

```
components/
├── Chat.tsx              # Main chat component
├── Message.tsx           # Individual message component
├── MessagesList.tsx      # Messages list container
├── MessageInput.tsx      # Input form component
├── LoadingIndicator.tsx  # Loading animation
├── index.ts             # Component exports
└── README.md            # This file
```

## Hooks

The chat logic is extracted into a custom hook (`useChat`) located in `../hooks/useChat.ts` for better separation of concerns. 