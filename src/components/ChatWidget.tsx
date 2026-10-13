import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Calculator, Loader2, MessageCircle, Phone, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

type Language = 'cs' | 'en';
type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

const translations = {
  cs: {
    title: 'MOVI-N asistent',
    status: 'Online pomoc se stěhováním',
    greeting: 'Dobrý den! Jak vám mohu pomoci se stěhováním?',
    placeholder: 'Napište svůj dotaz…',
    send: 'Odeslat zprávu',
    open: 'Otevřít chat',
    close: 'Zavřít chat',
    error: 'Omlouvám se, chat je teď nedostupný. Zavolejte nám prosím na +420 777 535 749.',
    limit: 'Zpráva může mít nejvýše 1 200 znaků.',
    privacy: 'Neposílejte citlivé údaje. Zprávu zpracovává AI.',
    estimate: 'Spočítat cenu',
    contact: 'Kontakt',
    suggestions: ['Kolik stojí stěhování?', 'Stěhujete i do zahraničí?', 'Pomůžete mi s balením?'],
  },
  en: {
    title: 'MOVI-N assistant',
    status: 'Online moving assistance',
    greeting: 'Hello! How can I help you with your move?',
    placeholder: 'Type your question…',
    send: 'Send message',
    open: 'Open chat',
    close: 'Close chat',
    error: 'Sorry, chat is currently unavailable. Please call us at +420 777 535 749.',
    limit: 'A message can contain up to 1,200 characters.',
    privacy: 'Do not send sensitive information. Messages are processed by AI.',
    estimate: 'Get an estimate',
    contact: 'Contact',
    suggestions: ['How much does moving cost?', 'Do you move internationally?', 'Can you help with packing?'],
  },
};

function createMessage(role: MessageRole, content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function loadMessages(lang: Language): ChatMessage[] {
  const greeting = createMessage('assistant', translations[lang].greeting);

  try {
    const stored = sessionStorage.getItem(`movi-n-chat-${lang}`);
    if (!stored) return [greeting];

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [greeting];

    const valid = parsed.filter((item): item is ChatMessage => (
      Boolean(item) &&
      typeof item.id === 'string' &&
      (item.role === 'user' || item.role === 'assistant') &&
      typeof item.content === 'string'
    ));

    return valid.length ? valid.slice(-20) : [greeting];
  } catch {
    return [greeting];
  }
}

export default function ChatWidget() {
  const location = useLocation();
  const lang: Language = location.pathname.startsWith('/en/') ? 'en' : 'cs';
  const copy = translations[lang];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages(lang));
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const messageListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages(loadMessages(lang));
    setInput('');
    setValidationMessage('');
  }, [lang]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`movi-n-chat-${lang}`, JSON.stringify(messages.slice(-20)));
    } catch {
      // Chat remains usable if session storage is unavailable.
    }
  }, [lang, messages]);

  useEffect(() => {
    if (!isOpen) return;
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [isOpen, isSending, messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen((current) => {
      const next = !current;
      if (next) {
        window.gtag?.('event', 'chat_open', { page_path: location.pathname });
      }
      return next;
    });
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    if (trimmed.length > 1200) {
      setValidationMessage(copy.limit);
      return;
    }

    setValidationMessage('');
    setInput('');
    setIsSending(true);

    const userMessage = createMessage('user', trimmed);
    const nextMessages = [...messages, userMessage].slice(-12);
    setMessages((current) => [...current, userMessage]);
    window.gtag?.('event', 'chat_message_sent', { page_path: location.pathname, language: lang });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          pagePath: location.pathname,
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
        signal: controller.signal,
      });

      const payload = await response.json() as { reply?: string };
      if (!response.ok || !payload.reply) throw new Error('Chat request failed');

      setMessages((current) => [...current, createMessage('assistant', payload.reply as string)]);
    } catch (error) {
      console.error('Chat request failed', error);
      setMessages((current) => [...current, createMessage('assistant', copy.error)]);
    } finally {
      window.clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const configuratorHref = lang === 'en'
    ? '/en/moving-services#moving-configurator-root'
    : '/#moving-configurator-root';
  const contactHref = lang === 'en' ? '/en/moving-services#contact' : '/#kontakt';

  return (
    <>
      {isOpen && (
        <aside
          role="dialog"
          aria-label={copy.title}
          className="fixed z-[70] bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[390px] h-[min(620px,calc(100vh-7rem))] bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden flex flex-col"
        >
          <header className="bg-gradient-to-r from-green-800 to-green-600 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center" aria-hidden="true">
              <Bot className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold leading-tight">{copy.title}</h2>
              <p className="text-xs text-green-100">{copy.status}</p>
            </div>
            <button
              type="button"
              onClick={toggleChat}
              className="p-2 rounded-lg hover:bg-white/15 transition-colors"
              aria-label={copy.close}
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div ref={messageListRef} className="flex-1 overflow-y-auto bg-green-50/40 px-4 py-4 space-y-3" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
                    message.role === 'user'
                      ? 'bg-green-700 text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-sm border border-green-100 rounded-bl-md'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {copy.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(suggestion)}
                    className="text-left text-xs px-3 py-2 bg-white border border-green-200 text-green-800 rounded-full hover:bg-green-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white border border-green-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <Loader2 className="w-4 h-4 text-green-700 animate-spin" aria-label="Loading" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-green-100 bg-white px-3 pt-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <a
                href={configuratorHref}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 hover:bg-green-100 transition-colors"
                onClick={() => window.gtag?.('event', 'chat_configurator_click', { language: lang })}
              >
                <Calculator className="w-4 h-4" aria-hidden="true" />
                {copy.estimate}
              </a>
              <a
                href={contactHref}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-800 hover:bg-green-100 transition-colors"
                onClick={() => window.gtag?.('event', 'chat_contact_click', { language: lang })}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {copy.contact}
              </a>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <label htmlFor="movi-n-chat-input" className="sr-only">{copy.placeholder}</label>
              <input
                ref={inputRef}
                id="movi-n-chat-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={copy.placeholder}
                maxLength={1201}
                disabled={isSending}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="w-10 h-10 shrink-0 rounded-xl bg-green-700 text-white flex items-center justify-center hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={copy.send}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            {validationMessage && <p className="mt-1 text-xs text-red-600">{validationMessage}</p>}
            <p className="py-2 text-[10px] leading-tight text-center text-gray-500">
              {copy.privacy}{' '}
              <a href="/gdpr" className="underline hover:text-green-700">GDPR</a>
            </p>
          </div>
        </aside>
      )}

      <button
        type="button"
        onClick={toggleChat}
        className="fixed z-[70] bottom-5 right-4 sm:right-6 w-14 h-14 rounded-full bg-green-700 text-white shadow-xl flex items-center justify-center hover:bg-green-800 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-green-200"
        aria-label={isOpen ? copy.close : copy.open}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </>
  );
}
