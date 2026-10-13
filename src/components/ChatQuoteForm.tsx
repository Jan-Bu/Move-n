import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';

type Language = 'cs' | 'en';

interface ChatQuoteFormProps {
  lang: Language;
  transcript: string;
  onCancel: () => void;
  onSubmitted: () => void;
}

interface QuoteDraft {
  name: string;
  email: string;
  phone: string;
  fromAddress: string;
  fromFloor: string;
  fromElevator: boolean;
  toAddress: string;
  toFloor: string;
  toElevator: boolean;
  moveSize: string;
  preferredDate: string;
  disassembly: boolean;
  assembly: boolean;
  packingService: boolean;
  heavyItems: boolean;
  notes: string;
  consent: boolean;
}

const initialDraft: QuoteDraft = {
  name: '',
  email: '',
  phone: '',
  fromAddress: '',
  fromFloor: '0',
  fromElevator: false,
  toAddress: '',
  toFloor: '0',
  toElevator: false,
  moveSize: '',
  preferredDate: '',
  disassembly: false,
  assembly: false,
  packingService: false,
  heavyItems: false,
  notes: '',
  consent: false,
};

const volumeByMoveSize: Record<string, number> = {
  fewItems: 4,
  studio: 10,
  apartment2: 18,
  apartment3: 28,
  apartment4: 38,
  house: 50,
  office: 25,
  unknown: 0,
};

const copy = {
  cs: {
    title: 'Nezávazná poptávka v chatu',
    steps: ['Trasa', 'Rozsah', 'Kontakt'],
    back: 'Zpět', next: 'Pokračovat', cancel: 'Zrušit', submit: 'Odeslat poptávku',
    from: 'Odkud stěhujete?', to: 'Kam stěhujete?', address: 'Město a adresa', floor: 'Patro', elevator: 'Je k dispozici výtah',
    size: 'Co přibližně stěhujete?', date: 'Preferovaný termín (volitelné)', services: 'Co pro vás můžeme zajistit?',
    disassembly: 'Demontáž nábytku', assembly: 'Montáž nábytku', packing: 'Kompletní balení', heavy: 'Těžké předměty (piano, trezor apod.)',
    notes: 'Další důležité informace', notesPlaceholder: 'Např. špatné parkování, dlouhé nošení, úzké schodiště, seznam větších kusů…',
    name: 'Jméno', email: 'E-mail', phone: 'Telefon',
    consent: 'Souhlasím se zpracováním údajů za účelem vyřízení nezávazné poptávky.',
    required: 'Vyplňte prosím všechna povinná pole.',
    error: 'Poptávku se nepodařilo odeslat. Zkuste to znovu nebo zavolejte na +420 777 535 749.',
    sizes: {
      fewItems: 'Několik kusů nábytku', studio: 'Garsonka / 1+kk', apartment2: 'Byt 2+kk / 2+1',
      apartment3: 'Byt 3+kk / 3+1', apartment4: 'Byt 4+kk a větší', house: 'Rodinný dům', office: 'Kancelář / firma', unknown: 'Nevím – potřebuji poradit',
    },
  },
  en: {
    title: 'Request a non-binding quote',
    steps: ['Route', 'Scope', 'Contact'],
    back: 'Back', next: 'Continue', cancel: 'Cancel', submit: 'Send request',
    from: 'Where are you moving from?', to: 'Where are you moving to?', address: 'City and address', floor: 'Floor', elevator: 'Elevator available',
    size: 'What are you moving?', date: 'Preferred date (optional)', services: 'What can we arrange for you?',
    disassembly: 'Furniture disassembly', assembly: 'Furniture assembly', packing: 'Complete packing service', heavy: 'Heavy items (piano, safe, etc.)',
    notes: 'Other important details', notesPlaceholder: 'Parking access, long carrying distance, narrow stairs, larger items…',
    name: 'Name', email: 'Email', phone: 'Phone',
    consent: 'I agree to the processing of my details for this non-binding moving request.',
    required: 'Please complete all required fields.',
    error: 'The request could not be sent. Please try again or call +420 777 535 749.',
    sizes: {
      fewItems: 'A few pieces of furniture', studio: 'Studio / 1-bedroom', apartment2: '2-room apartment',
      apartment3: '3-room apartment', apartment4: '4+ room apartment', house: 'Family house', office: 'Office / company', unknown: 'Not sure – I need advice',
    },
  },
};

function floorValue(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.max(-2, Math.min(parsed, 50)) : 0;
}

export default function ChatQuoteForm({ lang, transcript, onCancel, onSubmitted }: ChatQuoteFormProps) {
  const t = copy[lang];
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<QuoteDraft>(initialDraft);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [step]);

  const selectedServices = useMemo(() => [
    draft.disassembly ? t.disassembly : '',
    draft.assembly ? t.assembly : '',
    draft.packingService ? t.packing : '',
    draft.heavyItems ? t.heavy : '',
  ].filter(Boolean), [draft, t]);

  const update = <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const canContinue = step === 0
    ? Boolean(draft.fromAddress.trim() && draft.toAddress.trim())
    : step === 1
      ? Boolean(draft.moveSize)
      : Boolean(draft.name.trim() && /\S+@\S+\.\S+/.test(draft.email) && draft.phone.trim() && draft.consent);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canContinue || isSubmitting) {
      setError(t.required);
      return;
    }

    setIsSubmitting(true);
    setError('');
    const sizeLabel = t.sizes[draft.moveSize as keyof typeof t.sizes];
    const details = [
      `${lang === 'cs' ? 'Zdroj' : 'Source'}: AI chat`,
      `${lang === 'cs' ? 'Jméno' : 'Name'}: ${draft.name}`,
      `${lang === 'cs' ? 'Rozsah' : 'Move size'}: ${sizeLabel}`,
      selectedServices.length ? `${lang === 'cs' ? 'Služby' : 'Services'}: ${selectedServices.join(', ')}` : '',
      draft.notes ? `${lang === 'cs' ? 'Poznámka' : 'Notes'}: ${draft.notes}` : '',
      transcript ? `${lang === 'cs' ? 'Předchozí konverzace' : 'Previous chat'}:\n${transcript.slice(-3000)}` : '',
    ].filter(Boolean).join('\n\n');

    try {
      const response = await fetch('/.netlify/functions/send-moving-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          pageSlug: 'ai-chat',
          source: 'chat',
          name: draft.name.trim(),
          from: { address: draft.fromAddress.trim(), floor: floorValue(draft.fromFloor), elevator: draft.fromElevator },
          to: { address: draft.toAddress.trim(), floor: floorValue(draft.toFloor), elevator: draft.toElevator },
          inventory: [],
          other: details,
          photos: [],
          services: {
            disassembly: draft.disassembly,
            assembly: draft.assembly,
            packingService: draft.packingService,
            insurance: true,
            hasHeavyItems: draft.heavyItems,
            heavyItemsCount: draft.heavyItems ? 1 : 0,
          },
          estimate: { volumeM3: volumeByMoveSize[draft.moveSize] ?? 0 },
          preferredDate: draft.preferredDate || undefined,
          email: draft.email.trim(),
          phone: draft.phone.trim(),
          consent: true,
          timestamp: new Date().toISOString(),
        }),
      });
      const result = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error || 'Submit failed');

      window.gtag?.('event', 'chat_lead_submitted', { language: lang, move_size: draft.moveSize });
      onSubmitted();
    } catch (submitError) {
      console.error('Chat quote submit failed', submitError);
      setError(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100';
  const checkboxClass = 'mt-0.5 h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600';

  return (
    <form onSubmit={submit} className="flex h-full flex-col bg-white">
      <div className="border-b border-green-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" aria-label={t.cancel}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h3 className="font-semibold text-gray-900">{t.title}</h3>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2" aria-label={`${step + 1}/3`}>
          {t.steps.map((label, index) => (
            <div key={label} className="text-center">
              <div className={`h-1.5 rounded-full ${index <= step ? 'bg-green-700' : 'bg-gray-200'}`} />
              <span className={`mt-1 block text-[10px] ${index === step ? 'font-semibold text-green-800' : 'text-gray-500'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {step === 0 && (
          <>
            {(['from', 'to'] as const).map((direction) => {
              const isFrom = direction === 'from';
              const addressKey = isFrom ? 'fromAddress' : 'toAddress';
              const floorKey = isFrom ? 'fromFloor' : 'toFloor';
              const elevatorKey = isFrom ? 'fromElevator' : 'toElevator';
              return (
                <fieldset key={direction} className="rounded-xl border border-green-100 bg-green-50/40 p-3">
                  <legend className="px-1 text-sm font-semibold text-green-900">{isFrom ? t.from : t.to}</legend>
                  <label className="mt-1 block text-xs font-medium text-gray-700">{t.address} *</label>
                  <input className={fieldClass} value={draft[addressKey]} onChange={(e) => update(addressKey, e.target.value)} autoComplete="street-address" />
                  <div className="mt-3 flex items-center gap-4">
                    <label className="min-w-0 flex-1 text-xs font-medium text-gray-700">
                      {t.floor}
                      <input type="number" min="-2" max="50" className={`${fieldClass} mt-1`} value={draft[floorKey]} onChange={(e) => update(floorKey, e.target.value)} />
                    </label>
                    <label className="mt-5 flex flex-1 items-center gap-2 text-xs text-gray-700">
                      <input type="checkbox" className={checkboxClass} checked={draft[elevatorKey]} onChange={(e) => update(elevatorKey, e.target.checked)} />
                      {t.elevator}
                    </label>
                  </div>
                </fieldset>
              );
            })}
          </>
        )}

        {step === 1 && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-900">{t.size} *</legend>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(t.sizes).map(([value, label]) => (
                  <label key={value} className={`cursor-pointer rounded-xl border px-3 py-2 text-xs transition-colors ${draft.moveSize === value ? 'border-green-700 bg-green-50 font-semibold text-green-900' : 'border-gray-200 hover:border-green-300'}`}>
                    <input type="radio" name="move-size" value={value} checked={draft.moveSize === value} onChange={() => update('moveSize', value)} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-semibold text-gray-900">
              {t.date}
              <input type="date" className={`${fieldClass} mt-2 font-normal`} value={draft.preferredDate} onChange={(e) => update('preferredDate', e.target.value)} />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-900">{t.services}</legend>
              <div className="space-y-2 rounded-xl border border-gray-200 p-3">
                {([
                  ['disassembly', t.disassembly], ['assembly', t.assembly], ['packingService', t.packing], ['heavyItems', t.heavy],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-start gap-2 text-xs text-gray-700">
                    <input type="checkbox" className={checkboxClass} checked={draft[key]} onChange={(e) => update(key, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-xs font-medium text-gray-700">
              {t.notes}
              <textarea className={`${fieldClass} mt-1 min-h-20 resize-y`} maxLength={1200} placeholder={t.notesPlaceholder} value={draft.notes} onChange={(e) => update('notes', e.target.value)} />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-xs font-medium text-gray-700">{t.name} *<input className={`${fieldClass} mt-1`} autoComplete="name" value={draft.name} onChange={(e) => update('name', e.target.value)} /></label>
            <label className="block text-xs font-medium text-gray-700">{t.email} *<input type="email" className={`${fieldClass} mt-1`} autoComplete="email" value={draft.email} onChange={(e) => update('email', e.target.value)} /></label>
            <label className="block text-xs font-medium text-gray-700">{t.phone} *<input type="tel" className={`${fieldClass} mt-1`} autoComplete="tel" value={draft.phone} onChange={(e) => update('phone', e.target.value)} /></label>
            <div className="rounded-xl bg-green-50 p-3 text-xs text-gray-700">
              <p className="font-semibold text-green-900">{draft.fromAddress} → {draft.toAddress}</p>
              <p className="mt-1">{t.sizes[draft.moveSize as keyof typeof t.sizes]}</p>
              {selectedServices.length > 0 ? <p className="mt-1">{selectedServices.join(' • ')}</p> : null}
            </div>
            <label className="flex items-start gap-2 text-xs text-gray-700">
              <input type="checkbox" className={checkboxClass} checked={draft.consent} onChange={(e) => update('consent', e.target.checked)} />
              <span>{t.consent} <a href="/gdpr" className="underline hover:text-green-700">GDPR</a></span>
            </label>
          </>
        )}

        {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p> : null}
      </div>

      <div className="flex items-center gap-2 border-t border-green-100 px-4 py-3">
        {step > 0 ? (
          <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center gap-1 rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4" />{t.back}
          </button>
        ) : (
          <button type="button" onClick={onCancel} className="rounded-xl border border-gray-300 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">{t.cancel}</button>
        )}
        {step < 2 ? (
          <button type="button" onClick={() => {
            if (!canContinue) {
              setError(t.required);
              return;
            }
            setError('');
            setStep((current) => current + 1);
          }} className="ml-auto inline-flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-green-800">
            {t.next}<ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="submit" disabled={isSubmitting} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-60">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{t.submit}
          </button>
        )}
      </div>
    </form>
  );
}
