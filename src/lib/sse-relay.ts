/**
 * Reads an OpenAI-style chat-completions stream and emits `{ token }` / `{ done: true }` events.
 * Network chunks can end in the middle of a `data:` line, so partial lines are buffered until
 * their newline arrives; parsing each chunk on its own silently dropped those tokens.
 */
export async function relayCompletionTokens(
  upstream: ReadableStream<Uint8Array>,
  emit: (event: { token?: string; done?: true }) => void,
): Promise<void> {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const handle = (line: string) => {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trim();
    if (data === '[DONE]') return emit({ done: true });
    try {
      const token = JSON.parse(data).choices?.[0]?.delta?.content;
      if (typeof token === 'string' && token) emit({ token });
    } catch {}
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach(handle);
  }
  buffer += decoder.decode();
  if (buffer) handle(buffer);
}
