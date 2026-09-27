import { useEffect, useRef, useState } from 'react';
import { Send, Mic, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext.jsx';
import { TopBar, RichText } from '../components/ui.jsx';
import { chat, aiStatus } from '../ai/client.js';

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const PROMPTS = {
  en: ['What should I do next?', 'Which career suits me?', 'Where do I stand?', 'What skills do I need?', 'Resume tips', 'Interview tips', 'Government schemes for me', 'Salary for my goal'],
  hi: ['मुझे आगे क्या करना चाहिए?', 'मेरे लिए कौन सा करियर सही है?', 'मेरा स्कोर कैसा है?', 'मुझे कौन सी स्किल सीखनी चाहिए?', 'रिज़्यूमे टिप्स', 'सरकारी योजनाएँ'],
};

export default function Chat() {
  const { state, update, t, lang } = useApp();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState(null);
  const [rec, setRec] = useState(false);
  const listRef = useRef(null);
  const msgs = state.chat;

  useEffect(() => { aiStatus().then(setAi); }, []);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs.length, busy]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput('');
    const history = [...msgs, { role: 'user', content, ts: Date.now() }];
    update((s) => ({ ...s, chat: history.slice(-60) }));
    setBusy(true);
    const { text: reply, source } = await chat(history.map(({ role, content: c }) => ({ role, content: c })), state);
    setBusy(false);
    update((s) => ({ ...s, chat: [...s.chat, { role: 'assistant', content: reply, source, ts: Date.now() }].slice(-60) }));
  };

  const mic = () => {
    if (!SR || rec) return;
    const r = new SR();
    r.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    r.onresult = (e) => setInput(e.results[0][0].transcript);
    r.onend = () => setRec(false);
    r.onerror = () => setRec(false);
    r.start();
    setRec(true);
  };

  return (
    <>
      <TopBar
        title={<span className="row" style={{ gap: 8 }}>{t('coach')} <span className={`badge ${ai?.ai ? 'ok' : ''}`}>{ai == null ? '…' : ai.ai ? '✨ Claude AI' : '⚡ Offline AI'}</span></span>}
        right={msgs.length > 0 && <button className="icon-btn" aria-label="Clear chat" onClick={() => confirm('Clear conversation?') && update((s) => ({ ...s, chat: [] }))}><Trash2 size={19} /></button>}
      />
      <div className="chat-page">
        <div className="chat-list" ref={listRef}>
          {msgs.length === 0 && (
            <div className="center" style={{ padding: '24px 8px' }}>
              <div className="float-emoji">🤖</div>
              <div className="title-lg mt-12">{lang === 'hi' ? 'आपका AI करियर कोच' : 'Your AI Career Coach'}</div>
              <p className="small muted mt-8">{lang === 'hi' ? 'हिंदी या अंग्रेज़ी में कुछ भी पूछें। मैं आपके स्कोर, स्किल और लक्ष्य के आधार पर सलाह दूँगा।' : 'Ask in English or Hindi. I know your score, skills and goal, so my advice is personal to you.'}</p>
            </div>
          )}
          {msgs.map((m, k) => (
            <div key={k} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>
              {m.role === 'user' ? m.content : <RichText text={m.content} />}
            </div>
          ))}
          {busy && <div className="msg bot typing"><span /><span /><span /></div>}
          {!busy && (msgs.length === 0 || msgs[msgs.length - 1]?.role === 'assistant') && (
            <div className="chips wrap" style={{ marginTop: 6 }}>
              {(PROMPTS[lang] || PROMPTS.en).slice(0, msgs.length ? 4 : 8).map((p) => <button key={p} className="chip" onClick={() => send(p)}>{p}</button>)}
            </div>
          )}
        </div>
        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
          {SR && <button type="button" className={`btn icon ${rec ? 'danger' : ''}`} onClick={mic} aria-label="Voice input" style={{ borderRadius: 23, height: 46, width: 46 }}><Mic size={20} /></button>}
          <textarea className="textarea" rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('askAnything')}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <button type="submit" className="btn primary icon" disabled={!input.trim() || busy} aria-label="Send" style={{ borderRadius: 23, height: 46, width: 46 }}><Send size={19} /></button>
        </form>
      </div>
    </>
  );
}
