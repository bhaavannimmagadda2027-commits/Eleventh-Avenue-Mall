import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Check, Gift, Microphone, PaperPlaneRight, Stop } from '@phosphor-icons/react'
import { ADS } from '../../data/advertisements'
import { PRODUCTS, type Product } from '../../data/products'
import { PLACE } from '../../data/storeLayout'
import { STORE_BY_ID, TATA_STORES, type Store } from '../../data/stores'
import { thumb } from '../../lib/productArt'
import { activeCart, cartCount, inr, toPay, useMall } from '../../state/useMall'
import { BrandMark, cx } from '../ui/primitives'

type Msg = { id: number; from: 'you' | 'guide'; text: string; products?: Product[]; stores?: Store[] }

const STOP = new Set(['a', 'an', 'the', 'i', 'me', 'my', 'we', 'need', 'want', 'get', 'buy', 'find', 'where', 'is', 'are', 'can', 'do', 'you', 'have', 'show', 'take', 'to', 'for', 'some', 'of', 'please', 'looking', 'in', 'on', 'any'])

/** Answers from this mall's own catalogue, stores, cart and wallet. Nothing leaves the device. */
function answer(q: string): Omit<Msg, 'id' | 'from'> {
  const t = q.toLowerCase()
  const s = useMall.getState()
  if (/\b(coin|coins|neucoin|neucoins|balance)\b/.test(t)) return { text: `You have ${s.coins.toLocaleString('en-IN')} NeuCoins. You earn 1 for every ₹100.` }
  if (/\b(cart|total|basket)\b/.test(t)) {
    const n = cartCount(activeCart(s))
    return { text: n ? `Your cart has ${n} item${n > 1 ? 's' : ''}, ${inr(toPay(s))} to pay.` : 'Your cart is empty.' }
  }
  if (/\b(offer|offers|deal|deals|discount|sale)\b/.test(t)) {
    return { text: 'Current offers in the mall:', products: PRODUCTS.filter((p) => p.offer && PLACE[p.id]).slice(0, 4) }
  }
  const words = t.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w))
  if (!words.length) return { text: 'Tell me what you are looking for, like milk, headphones or a gift for mum.' }
  const stem = (w: string) => w.replace(/(es|s)$/, '')
  const hits = (hay: string) => words.reduce((a, w) => a + (hay.includes(stem(w)) ? 1 : 0), 0)
  const products = PRODUCTS.filter((p) => PLACE[p.id])
    .map((p) => ({ p, n: hits(`${p.name} ${p.brand} ${p.section}`.toLowerCase()) * 2 + hits(p.desc.toLowerCase()) }))
    .filter((o) => o.n > 0).sort((a, b) => b.n - a.n).slice(0, 4).map((o) => o.p)
  const stores = TATA_STORES.filter((st) => hits(`${st.name} ${st.category} ${st.tagline}`.toLowerCase()) > 0).slice(0, 3)
  if (!products.length && !stores.length) return { text: `I could not find “${q}” in this mall. Try a product, a brand or a store name.` }
  return { text: products.length ? 'Here is what I found. Tap one and NEU CART will take you to the shelf.' : 'These stores match.', products, stores: products.length ? [] : stores }
}

type Recognizer = { lang: string; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null }

export function AssistantPanel({ listen }: { listen?: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: 'guide', text: 'Hi Rahul. What are you shopping for today?' }])
  const [q, setQ] = useState('')
  const [hearing, setHearing] = useState(false)
  const [micError, setMicError] = useState('')
  const rec = useRef<Recognizer | null>(null)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [msgs])

  const ask = (text: string) => {
    const v = text.trim()
    if (!v) return
    setMsgs((m) => [...m, { id: m.length, from: 'you', text: v }, { id: m.length + 1, from: 'guide', ...answer(v) }])
    setQ('')
  }
  const toggleMic = () => {
    if (hearing) { rec.current?.stop(); return }
    const w = window as unknown as { SpeechRecognition?: new () => Recognizer; webkitSpeechRecognition?: new () => Recognizer }
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!SR) { setMicError('Voice input is not available in this browser. Type your question instead.'); return }
    const r = new SR()
    r.lang = 'en-IN'
    r.interimResults = false
    r.onresult = (e) => ask(e.results[0][0].transcript)
    r.onerror = (e) => setMicError(e.error === 'not-allowed' ? 'Microphone access is blocked. Allow it in your browser, or type instead.' : 'I could not hear that. Try again, or type instead.')
    r.onend = () => setHearing(false)
    rec.current = r
    setMicError('')
    setHearing(true)
    r.start()
  }
  useEffect(() => {
    if (listen) toggleMic()
    return () => rec.current?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listen])

  const submit = (e: FormEvent) => { e.preventDefault(); ask(q) }
  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex flex-col gap-2" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className={cx('flex flex-col gap-2', m.from === 'you' ? 'items-end' : 'items-start')}>
            <p className={cx('max-w-[85%] rounded-2xl px-3 py-2 text-sm', m.from === 'you' ? 'bg-ink text-on-ink' : 'bg-surface shadow-[var(--shadow-soft)]')}>{m.text}</p>
            {!!m.products?.length && (
              <div className="w-full divide-y divide-soft rounded-2xl bg-surface px-3 shadow-[var(--shadow-soft)]">
                {m.products.map((p) => (
                  <button key={p.id} onClick={() => useMall.getState().seekProduct(p.id, 'preview')} className="flex w-full items-center gap-3 py-2 text-left">
                    <img src={thumb(p.id) || undefined} alt="" className="h-10 w-10 shrink-0 rounded-xl bg-cream" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{p.name}</span><span className="block truncate text-xs text-ink-2">{STORE_BY_ID[p.storeId].name} · {inr(p.price)}</span></span>
                    <ArrowRight size={16} className="shrink-0 text-ink-3" />
                  </button>
                ))}
              </div>
            )}
            {!!m.stores?.length && (
              <div className="w-full divide-y divide-soft rounded-2xl bg-surface px-3 shadow-[var(--shadow-soft)]">
                {m.stores.map((st) => (
                  <button key={st.id} onClick={() => useMall.getState().travelTo(st.id, true)} className="flex w-full items-center gap-3 py-2 text-left">
                    <BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} size={36} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{st.name}</span><span className="block truncate text-xs text-ink-2">{st.tagline}</span></span>
                    <ArrowRight size={16} className="shrink-0 text-ink-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      {micError && <p role="alert" className="rounded-xl bg-tint px-3 py-2 text-xs text-promo-ink">{micError}</p>}
      <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl bg-surface p-2 shadow-[var(--shadow-soft)]">
        <button type="button" onClick={toggleMic} aria-label={hearing ? 'Stop listening' : 'Speak your question'} aria-pressed={hearing} className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors duration-300', hearing ? 'bg-[#3F46E8] text-white' : 'bg-cream text-ink')}>
          {hearing ? <Stop size={18} weight="fill" /> : <Microphone size={18} />}
        </button>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={hearing ? 'Listening' : 'Ask for a product or store'} aria-label="Ask the assistant" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3" />
        <button type="submit" disabled={!q.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-on-ink transition-opacity duration-300 disabled:opacity-40"><PaperPlaneRight size={18} weight="fill" /></button>
      </form>
      <p className="text-xs text-ink-3">Answers come from this mall's catalogue on your device.</p>
    </div>
  )
}

export function NotificationsPanel() {
  const activity = useMall((s) => s.activity)
  useEffect(() => { useMall.setState({ alertsSeen: useMall.getState().activity.length }) }, [activity.length])
  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
        {activity.map((a) => (
          <div key={a.id} className="flex items-center gap-3 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream">{a.amount >= 0 ? <Check size={16} className="text-success" /> : <Gift size={16} className="text-purple-ink" />}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{a.label}</span><span className="block truncate text-xs text-ink-2">{a.detail} · {a.when}</span></span>
            <span className={cx('text-sm font-semibold tnum', a.amount >= 0 ? 'text-success' : 'text-ink-2')}>{a.amount >= 0 ? '+' : '−'}{Math.abs(a.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OffersPanel() {
  return (
    <div className="divide-y divide-soft rounded-2xl bg-surface px-4 shadow-[var(--shadow-soft)]">
      {ADS.map((a) => {
        const st = STORE_BY_ID[a.storeId]
        return (
          <button key={a.id} onClick={() => useMall.getState().open({ kind: 'ad', id: a.id })} className="flex w-full items-center gap-3 py-3 text-left">
            <BrandMark name={st.name} bg={st.sign.bg} fg={st.sign.fg} size={36} />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{a.title.replace('\n', ' ')}</span><span className="block truncate text-xs text-ink-2">{a.brand} · {a.offer}</span></span>
            <ArrowRight size={16} className="shrink-0 text-ink-3" />
          </button>
        )
      })}
    </div>
  )
}
