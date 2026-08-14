export async function sendChatRequest(messages) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages,
            }),
        });
        const data = (await response.json());
        if (!response.ok) {
            console.error('Chat API error:', response.status, data.error);
            return { ok: false, error: data.error ?? 'api_error' };
        }
        if (!data.reply) {
            return { ok: false, error: 'empty_reply' };
        }
        return { ok: true, reply: data.reply };
    }
    catch (error) {
        console.error('Error sending chat request:', error);
        return { ok: false, error: 'network_error' };
    }
}
