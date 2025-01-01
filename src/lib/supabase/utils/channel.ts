```typescript
export function getTranscriptionChannelName(userId: string): string {
  return 'transcriptions-' + userId;
}
```