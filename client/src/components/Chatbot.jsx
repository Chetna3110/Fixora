import { useState } from 'react';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! 👋 I am Fixora Assistant. Ask me anything about reporting or tracking issues!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_KEY;

      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: '⚠️ Chatbot is currently unavailable. Please try again later!'
        }]);
        setLoading(false);
        return;
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Fixora Assistant'
        },
        body: JSON.stringify({
         model: 'openrouter/auto',
          max_tokens: 300,
          messages: [
            {
              role: 'system',
              content: `You are Fixora Assistant, a helpful chatbot for the Fixora platform — a civic issue reporting app where citizens report local problems like potholes, broken streetlights, garbage, water leaks etc. and authorities resolve them.

Your job is to help users understand how to:
- Report an issue (go to dashboard → click Report Issue → fill form → add location → submit)
- Track issue status (Pending → In Progress → Resolved)
- Upvote issues to prioritize them
- Join guilds (volunteer groups) — workers and admins only
- Use the admin panel (only for admins)
- Worker dashboard — workers can update progress on assigned issues
- Register and login (3 roles: User, Worker, Admin)

Keep answers short, friendly and helpful. Use emojis occasionally. Max 3-4 sentences.`
            },
            {
              role: 'user',
              content: currentInput
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API error');
      }

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || 'Sorry, I could not understand that.';
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);

    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: '⚠️ I am having trouble connecting right now. Please try again in a moment!'
      }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {open && (
        <div style={{
          width: '340px', height: '460px',
          background: 'rgba(17,34,64,0.97)',
          backdropFilter: 'blur(16px)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(26,86,219,0.3)',
          display: 'flex', flexDirection: 'column',
          marginBottom: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          animation: 'slideUp 0.3s ease forwards'
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
            padding: '16px 18px',
            borderRadius: '16px 16px 0 0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem'
              }}>🤖</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Fixora Assistant
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }} />
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem' }}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #1a56db, #0ea5e9)'
                    : 'rgba(255,255,255,0.08)',
                  color: 'white', fontSize: '0.88rem', lineHeight: '1.5',
                  border: msg.role === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '16px 16px 16px 4px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px',
                      background: '#93c5fd', borderRadius: '50%',
                      animation: 'bounce 1s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', gap: '8px'
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                color: 'white', fontSize: '0.88rem',
                fontFamily: 'Outfit, sans-serif', outline: 'none'
              }}
            />
            <button onClick={sendMessage} disabled={loading}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a56db, #0ea5e9)',
                border: 'none', cursor: 'pointer', fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, opacity: loading ? 0.6 : 1
              }}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button onClick={() => setOpen(!open)}
        style={{
          width: '58px', height: '58px', borderRadius: '50%',
          background: open ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg, #1a56db, #0ea5e9)',
          border: '2px solid rgba(255,255,255,0.2)',
          color: 'white', fontSize: '1.5rem', cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(26,86,219,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: 'auto', transition: 'all 0.3s',
          backdropFilter: 'blur(8px)'
        }}>
        {open ? '✕' : '🤖'}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}