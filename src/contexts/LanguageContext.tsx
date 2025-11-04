import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'cs' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  cs: {
    'nav.home': 'Domů',
    'nav.services': 'Služby',
    'nav.about': 'O nás',
    'nav.reviews': 'Recenze',
    'nav.contact': 'Kontakt',
    'hero.title': 'Profesionální Stěhování',
    'hero.subtitle': 'S MOVI-N',
    'hero.description': 'Rychlé, spolehlivé a bezpečné stěhovací služby pro váš domov nebo firmu',
    'hero.cta.quote': 'Nezávazná Poptávka',
    'hero.cta.services': 'Naše Služby',
    'footer.rights': 'Všechna práva vyhrazena',
    'contact.title': 'Kontaktujte Nás',
    'contact.phone': 'Telefon',
    'contact.email': 'Email',
    'contact.address': 'Adresa',

    // GDPR Page
    'gdpr.title': 'Ochrana osobních údajů (GDPR)',
    'gdpr.backToHome': 'Zpět na hlavní stránku',
    'gdpr.lastUpdated': 'Poslední aktualizace:',
    'gdpr.intro.title': 'Úvod',
    'gdpr.intro.content': 'Společnost MOVI-N (dále jen "společnost" nebo "správce") zpracovává osobní údaje v souladu s nařízením Evropského parlamentu a Rady (EU) 2016/679 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů (obecné nařízení o ochraně osobních údajů, GDPR) a zákonem č. 110/2019 Sb., o zpracování osobních údajů.',
    'gdpr.controller.title': 'Správce osobních údajů',
    'gdpr.controller.company': 'MOVI-N',
    'gdpr.controller.id': 'IČO: [IČO společnosti]',
    'gdpr.controller.address': 'Sídlo: [Adresa společnosti]',
    'gdpr.purposes.title': 'Účel a rozsah zpracování osobních údajů',
    'gdpr.purposes.services': 'Poskytování stěhovacích služeb',
    'gdpr.purposes.services.desc': 'Zpracováváme jméno, příjmení, telefon, e-mail, adresu stěhování (původní a cílovou) pro realizaci objednané služby.',
    'gdpr.purposes.quotes': 'Poptávky a cenové nabídky',
    'gdpr.purposes.quotes.desc': 'Pro zpracování poptávky a zaslání cenové nabídky zpracováváme kontaktní údaje a informace o požadované službě.',
    'gdpr.purposes.invoicing': 'Fakturace a účetnictví',
    'gdpr.purposes.invoicing.desc': 'Pro vystavení faktury a plnění účetních povinností zpracováváme identifikační a fakturační údaje.',
    'gdpr.purposes.marketing': 'Marketingová komunikace',
    'gdpr.purposes.marketing.desc': 'Se souhlasem klienta můžeme zasílat informace o našich službách a speciálních nabídkách.',
    'gdpr.legal.title': 'Právní základ zpracování',
    'gdpr.legal.content': 'Osobní údaje zpracováváme na základě:|• Plnění smlouvy - pro poskytnutí stěhovacích služeb (čl. 6 odst. 1 písm. b) GDPR)|• Právní povinnosti - pro účetní a daňové povinnosti (čl. 6 odst. 1 písm. c) GDPR)|• Oprávněného zájmu - pro evidenci komunikace a vyřizování reklamací (čl. 6 odst. 1 písm. f) GDPR)|• Souhlasu - pro marketingovou komunikaci (čl. 6 odst. 1 písm. a) GDPR)',
    'gdpr.retention.title': 'Doba uchovávání osobních údajů',
    'gdpr.retention.content': '• Smluvní dokumentace: po dobu trvání smluvního vztahu a následně po dobu stanovenou právními předpisy (minimálně 10 let pro účetní doklady)|• Marketingové souhlasy: do odvolání souhlasu nebo maximálně 5 let od posledního kontaktu|• Poptávky bez uzavření smlouvy: 2 roky od vytvoření poptávky',
    'gdpr.recipients.title': 'Předání osobních údajů třetím stranám',
    'gdpr.recipients.content': 'Vaše osobní údaje mohou být předány pouze:|• Subdodavatelům při realizaci stěhování (pouze v nezbytném rozsahu)|• Účetním a daňovým poradcům pro plnění zákonných povinností|• Poskytovatelům IT služeb zajišťujícím provoz našich systémů|• Orgánům veřejné moci v případech stanovených zákonem||Všichni příjemci jsou povinni zachovávat mlčenlivost a zabezpečit osobní údaje proti zneužití.',
    'gdpr.rights.title': 'Práva subjektů údajů',
    'gdpr.rights.content': 'Máte následující práva:|• Právo na přístup - můžete požadovat informace o zpracování vašich osobních údajů|• Právo na opravu - můžete požadovat opravu nepřesných údajů|• Právo na výmaz - můžete požadovat výmaz údajů (není-li jejich uchovávání zákonnou povinností)|• Právo na omezení zpracování - můžete požadovat omezení zpracování vašich údajů|• Právo na přenositelnost - můžete získat vaše údaje ve strukturovaném formátu|• Právo vznést námitku - můžete vznést námitku proti zpracování|• Právo odvolat souhlas - můžete kdykoliv odvolat souhlas se zpracováním|• Právo podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz)',
    'gdpr.security.title': 'Zabezpečení osobních údajů',
    'gdpr.security.content': 'Přijali jsme vhodná technická a organizační opatření k ochraně vašich osobních údajů, zejména:|• Šifrované připojení (SSL/TLS) pro webové stránky a e-mailovou komunikaci|• Pravidelné zálohy dat|• Omezený přístup k osobním údajům pouze pro oprávněné osoby|• Pravidelné školení zaměstnanců v oblasti ochrany osobních údajů|• Bezpečné uchovávání fyzické dokumentace',
    'gdpr.cookies.title': 'Cookies a webové stránky',
    'gdpr.cookies.content': 'Naše webové stránky používají cookies pro zajištění základní funkčnosti a analýzu návštěvnosti. Používáme pouze nezbytně nutné cookies.',
    'gdpr.contact.title': 'Kontakt pro otázky ohledně GDPR',
    'gdpr.contact.content': 'Pro uplatnění vašich práv nebo dotazy ohledně zpracování osobních údajů nás kontaktujte:|E-mail: khaled.rami1990@gmail.com|Telefon: +420 777 535 749|Poštovní adresa: Převýšov 31, 503 51 Převýšov',

    // Terms Page
    'terms.title': 'Obchodní podmínky společnosti Movi-n',
    'terms.backToHome': 'Zpět na hlavní stránku',
    'terms.lastUpdated': 'Poslední aktualizace:',
    'terms.intro.title': '1. Úvodní ustanovení',
    'terms.intro.content': 'Tyto obchodní podmínky (dále jen „Podmínky") upravují práva a povinnosti mezi společností:|Movi-n|IČO: 01110713|Sídlo: Převýšov 31, 503 51 Převýšov|E-mail: khaled.rami1990@gmail.com|Telefon: ‪+420 777 535 749‬|(dále jen „Poskytovatel")||a zákazníkem, který si objednává stěhovací služby (dále jen „Klient").|Poskytovatel je podnikatel zapsaný v živnostenském rejstříku a provozuje webové stránky, na kterých může Klient vyplnit poptávkový formulář k nezávazné poptávce stěhovacích služeb.',
    'terms.provider.title': '2. Předmět služby',
    'terms.provider.company': '',
    'terms.provider.id': '',
    'terms.provider.address': '',
    'terms.services.title': '',
    'terms.services.content': 'Poskytovatel nabízí stěhovací služby v České republice i v zahraničí, zejména:|• stěhování bytů, domů, kanceláří a firem,|• mezinárodní stěhování,|• demontáž a montáž nábytku,|• balicí služby a zajištění obalového materiálu,|• přepravu nábytku a zařízení,|• doplňkové služby jako úklid, vyklízení nebo dočasné uskladnění.||Všechny služby jsou poskytovány po předchozí domluvě na základě individuální nabídky.',
    'terms.order.title': '3. Objednávka a uzavření smlouvy',
    'terms.order.content': '1. Klient může zaslat nezávaznou poptávku prostřednictvím formuláře na webu, e-mailem nebo telefonicky.|2. Na základě poptávky Poskytovatel vypracuje cenovou nabídku – kalkulaci ceny, rozsahu a termínu stěhování.|3. K uzavření smlouvy o poskytování služeb dochází v okamžiku, kdy Klient nabídku písemně nebo elektronicky (např. e-mailem) potvrdí.|4. Poskytovatel si může vyžádat zálohu předem, zejména u větších nebo zahraničních zakázek.',
    'terms.price.title': '5. Ceny a platební podmínky',
    'terms.price.content': '1. Ceny služeb jsou stanoveny individuálně podle rozsahu, vzdálenosti a času trvání zakázky.|2. Poskytovatel vystaví Klientovi cenovou nabídku před uzavřením smlouvy.|3. Platbu lze provést:|• v hotovosti po dokončení stěhování,|• bankovním převodem (předem nebo po službě na fakturu),|• QR platbou,|• na fakturu – pouze pro firemní zákazníky po předchozí domluvě.|4. Faktury jsou splatné do 14 dnů, pokud není dohodnuto jinak.|5. Při prodlení s platbou je Poskytovatel oprávněn účtovat úrok z prodlení dle zákona.',
    'terms.customer.title': '4. Práva a povinnosti smluvních stran',
    'terms.customer.content': 'Povinnosti Poskytovatele:|• Provést sjednané služby řádně, včas a s odbornou péčí.|• Použít vhodné dopravní prostředky a zajistit odpovídající počet pracovníků.|• Zacházet s věcmi Klienta šetrně a bezpečně.||Povinnosti Klienta:|• Uvést pravdivé a úplné informace o rozsahu stěhování (objem věcí, přístup, patra apod.).|• Zajistit parkovací místo a volný přístup do objektu.|• Připravit věci ke stěhování a vhodně je zabalit (zejména křehké předměty označit).|• Být přítomen při nakládce a vykládce nebo zajistit oprávněného zástupce.|• Uhradit cenu služby dle dohodnutých podmínek.',
    'terms.provider.resp.title': '7. Odpovědnost za škody a reklamace',
    'terms.provider.resp.content': '1. Poskytovatel odpovídá za škody vzniklé na věcech Klienta v důsledku prokazatelného pochybení svých pracovníků.|2. Poskytovatel má sjednané pojištění odpovědnosti za škodu při výkonu činnosti.|3. Klient je povinen nahlásit případné poškození ihned po skončení stěhování, nejpozději do 24 hodin od převzetí věcí.|4. Reklamace bude vyřízena bez zbytečného odkladu, nejpozději do 30 dnů.',
    'terms.insurance.title': '',
    'terms.insurance.content': '',
    'terms.cancellation.title': '6. Stornovací podmínky',
    'terms.cancellation.content': 'Klient může objednanou službu zrušit bez udání důvodu, avšak dle termínu zrušení je povinen uhradit storno poplatek:||Čas zrušení před datem stěhování / Storno poplatek|• 11 a více dní / 0 % (bez poplatku)|• 10 – 8 dní / 10 % z ceny služby|• 7 – 5 dní / 20 % z ceny služby|• 4 – 3 dny / 50 % z ceny služby|• 2 dny a méně / v den stěhování / 100 % z ceny služby||Pokud již byla uhrazena záloha, bude po odečtení storno poplatku zbytek vrácen do 14 dnů od zrušení.||Poskytovatel může službu zrušit pouze z vážných provozních důvodů (např. porucha vozidla, nemoc pracovníků, živelní událost). V takovém případě neprodleně informuje Klienta a nabídne náhradní termín nebo vrátí přijatou platbu.',
    'terms.complaints.title': '',
    'terms.complaints.content': '',
    'terms.personal.title': '8. Ochrana osobních údajů',
    'terms.personal.content': 'Poskytovatel zpracovává osobní údaje Klienta v souladu s nařízením GDPR (EU 2016/679) pouze pro účely vyřízení poptávky, uzavření smlouvy a plnění služeb. Údaje nejsou poskytovány třetím osobám mimo nezbytné případy (např. účetní, pojišťovna).||Podrobnosti jsou uvedeny v Zásadách zpracování osobních údajů dostupných na webu Poskytovatele.',
    'terms.final.title': '9. Závěrečná ustanovení',
    'terms.final.content': '• Právní vztahy mezi Poskytovatelem a Klientem se řídí právním řádem České republiky, zejména občanským zákoníkem (zákon č. 89/2012 Sb.).|• Spotřebitel má právo na mimosoudní řešení sporu u České obchodní inspekce (www.coi.cz).|• Tyto Podmínky nabývají účinnosti dnem 1. 11. 2025 a jsou platné pro všechny objednávky podané po tomto datu.',

    // Cookie Banner
    'cookie.title': 'Stěhujeme vaše soukromí na bezpečné místo!',
    'cookie.description': 'Používáme cookies, abychom vám zajistili hladký průběh procházení našich stránek - stejně jako hladké stěhování vašeho majetku. Bez zbytečných překážek!',
    'cookie.necessary.title': 'Nezbytné cookies',
    'cookie.necessary.description': 'Tyto cookies jsou jako naši profesionální stěhováci - bez nich to prostě nejde. Zajišťují základní funkčnost webu.',
    'cookie.marketing.title': 'Marketingové cookies',
    'cookie.marketing.description': 'Pomáhají nám vylepšovat naše služby a nabízet vám relevantní obsah. Můžete je odmítnout, ale rádi bychom zůstali v kontaktu!',
    'cookie.acceptAll': 'Přijmout vše',
    'cookie.acceptNecessary': 'Pouze nezbytné',
    'cookie.customize': 'Přizpůsobit',
    'cookie.savePreferences': 'Uložit předvolby',
    'cookie.learnMore': 'Více informací'
  },
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.reviews': 'Reviews',
    'nav.contact': 'Contact',
    'hero.title': 'Professional Moving Services',
    'hero.subtitle': 'With MOVI-N',
    'hero.description': 'Fast, reliable and safe moving services for your home or business',
    'hero.cta.quote': 'Get a Free Quote',
    'hero.cta.services': 'Our Services',
    'footer.rights': 'All rights reserved',
    'contact.title': 'Contact Us',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.address': 'Address',

    // GDPR Page
    'gdpr.title': 'Privacy Policy (GDPR)',
    'gdpr.backToHome': 'Back to Home',
    'gdpr.lastUpdated': 'Last Updated:',
    'gdpr.intro.title': 'Introduction',
    'gdpr.intro.content': 'MOVI-N company (hereinafter "company" or "controller") processes personal data in accordance with Regulation (EU) 2016/679 of the European Parliament and of the Council on the protection of natural persons with regard to the processing of personal data (General Data Protection Regulation, GDPR) and Act No. 110/2019 Coll., on the processing of personal data.',
    'gdpr.controller.title': 'Data Controller',
    'gdpr.controller.company': 'MOVI-N',
    'gdpr.controller.id': 'Company ID: [Company ID]',
    'gdpr.controller.address': 'Address: [Company Address]',
    'gdpr.purposes.title': 'Purpose and Scope of Personal Data Processing',
    'gdpr.purposes.services': 'Provision of Moving Services',
    'gdpr.purposes.services.desc': 'We process name, surname, phone, email, moving addresses (origin and destination) to provide the ordered service.',
    'gdpr.purposes.quotes': 'Inquiries and Price Quotes',
    'gdpr.purposes.quotes.desc': 'To process inquiries and send price quotes, we process contact details and information about the requested service.',
    'gdpr.purposes.invoicing': 'Invoicing and Accounting',
    'gdpr.purposes.invoicing.desc': 'For invoice issuance and fulfilling accounting obligations, we process identification and billing information.',
    'gdpr.purposes.marketing': 'Marketing Communication',
    'gdpr.purposes.marketing.desc': 'With client consent, we may send information about our services and special offers.',
    'gdpr.legal.title': 'Legal Basis for Processing',
    'gdpr.legal.content': 'We process personal data based on:|• Contract performance - to provide moving services (Art. 6(1)(b) GDPR)|• Legal obligations - for accounting and tax obligations (Art. 6(1)(c) GDPR)|• Legitimate interest - for communication records and complaint handling (Art. 6(1)(f) GDPR)|• Consent - for marketing communication (Art. 6(1)(a) GDPR)',
    'gdpr.retention.title': 'Data Retention Period',
    'gdpr.retention.content': '• Contract documentation: for the duration of the contractual relationship and subsequently for the period stipulated by law (minimum 10 years for accounting documents)|• Marketing consents: until consent withdrawal or maximum 5 years from last contact|• Inquiries without contract: 2 years from inquiry creation',
    'gdpr.recipients.title': 'Transfer of Personal Data to Third Parties',
    'gdpr.recipients.content': 'Your personal data may be transferred only to:|• Subcontractors during moving execution (only to the necessary extent)|• Accounting and tax advisors for legal obligations|• IT service providers ensuring operation of our systems|• Public authorities in cases stipulated by law||All recipients are obliged to maintain confidentiality and secure personal data against misuse.',
    'gdpr.rights.title': 'Data Subject Rights',
    'gdpr.rights.content': 'You have the following rights:|• Right of access - you can request information about processing of your personal data|• Right to rectification - you can request correction of inaccurate data|• Right to erasure - you can request deletion of data (if retention is not a legal obligation)|• Right to restriction of processing - you can request restriction of processing|• Right to data portability - you can obtain your data in a structured format|• Right to object - you can object to processing|• Right to withdraw consent - you can withdraw consent at any time|• Right to lodge a complaint with the Office for Personal Data Protection (www.uoou.cz)',
    'gdpr.security.title': 'Personal Data Security',
    'gdpr.security.content': 'We have implemented appropriate technical and organizational measures to protect your personal data, including:|• Encrypted connection (SSL/TLS) for websites and email communication|• Regular data backups|• Limited access to personal data only for authorized persons|• Regular employee training in data protection|• Secure storage of physical documentation',
    'gdpr.cookies.title': 'Cookies and Website',
    'gdpr.cookies.content': 'Our website uses cookies to ensure basic functionality and analyze traffic. We only use strictly necessary cookies.',
    'gdpr.contact.title': 'Contact for GDPR Questions',
    'gdpr.contact.content': 'To exercise your rights or for questions regarding personal data processing, contact us:|Email: khaled.rami1990@gmail.com|Phone: +420 777 535 749|Postal address: Převýšov 31, 503 51 Převýšov',

    // Terms Page
    'terms.title': 'Terms & Conditions of Movi-n',
    'terms.backToHome': 'Back to Home',
    'terms.lastUpdated': 'Last Updated:',
    'terms.intro.title': '1. Introductory Provisions',
    'terms.intro.content': 'These Terms and Conditions (hereinafter "Terms") govern the rights and obligations between the company:|Movi-n|Company ID: 01110713|Registered office: Převýšov 31, 503 51 Převýšov|Email: khaled.rami1990@gmail.com|Phone: ‪+420 777 535 749‬|(hereinafter "Provider")||and the customer who orders moving services (hereinafter "Client").|The Provider is an entrepreneur registered in the Trade Register and operates a website where the Client can fill out an inquiry form for a non-binding request for moving services.',
    'terms.provider.title': '2. Subject of Service',
    'terms.provider.company': '',
    'terms.provider.id': '',
    'terms.provider.address': '',
    'terms.services.title': '',
    'terms.services.content': 'The Provider offers moving services in the Czech Republic and abroad, in particular:|• moving of apartments, houses, offices and companies,|• international moving,|• disassembly and assembly of furniture,|• packing services and provision of packaging materials,|• transportation of furniture and equipment,|• additional services such as cleaning, clearance or temporary storage.||All services are provided after prior arrangement based on an individual offer.',
    'terms.order.title': '3. Order and Contract Conclusion',
    'terms.order.content': '1. The Client may send a non-binding inquiry via the form on the website, by email or by phone.|2. Based on the inquiry, the Provider will prepare a price quote – calculation of price, scope and date of moving.|3. The contract for the provision of services is concluded at the moment when the Client confirms the offer in writing or electronically (e.g. by email).|4. The Provider may request a deposit in advance, especially for larger or international orders.',
    'terms.price.title': '5. Prices and Payment Terms',
    'terms.price.content': '1. Service prices are set individually according to scope, distance and duration of the order.|2. The Provider will issue a price quote to the Client before concluding the contract.|3. Payment can be made:|• in cash after completion of the move,|• by bank transfer (in advance or after service on invoice),|• by QR payment,|• on invoice – only for corporate customers after prior arrangement.|4. Invoices are due within 14 days, unless otherwise agreed.|5. In case of delay in payment, the Provider is entitled to charge interest on late payment according to the law.',
    'terms.customer.title': '4. Rights and Obligations of the Parties',
    'terms.customer.content': 'Provider\'s Obligations:|• Perform the agreed services properly, on time and with professional care.|• Use suitable means of transport and ensure an appropriate number of workers.|• Handle the Client\'s belongings carefully and safely.||Client\'s Obligations:|• Provide truthful and complete information about the scope of the move (volume of items, access, floors, etc.).|• Ensure parking space and free access to the premises.|• Prepare items for moving and pack them appropriately (especially mark fragile items).|• Be present during loading and unloading or ensure an authorized representative.|• Pay the service price according to the agreed terms.',
    'terms.provider.resp.title': '7. Liability for Damages and Complaints',
    'terms.provider.resp.content': '1. The Provider is liable for damage to the Client\'s belongings resulting from proven negligence of its workers.|2. The Provider has liability insurance for damage during the performance of activities.|3. The Client is obliged to report any damage immediately after the move is completed, no later than 24 hours after receiving the items.|4. The complaint will be resolved without undue delay, no later than 30 days.',
    'terms.insurance.title': '',
    'terms.insurance.content': '',
    'terms.cancellation.title': '6. Cancellation Terms',
    'terms.cancellation.content': 'The Client may cancel the ordered service without giving a reason, but according to the cancellation date is obliged to pay a cancellation fee:||Cancellation time before moving date / Cancellation fee|• 11 days or more / 0% (no fee)|• 10 – 8 days / 10% of service price|• 7 – 5 days / 20% of service price|• 4 – 3 days / 50% of service price|• 2 days or less / on moving day / 100% of service price||If a deposit has already been paid, the remainder will be refunded within 14 days of cancellation after deducting the cancellation fee.||The Provider may cancel the service only for serious operational reasons (e.g. vehicle breakdown, worker illness, natural disaster). In such case, the Provider will immediately inform the Client and offer an alternative date or return the payment received.',
    'terms.complaints.title': '',
    'terms.complaints.content': '',
    'terms.personal.title': '8. Personal Data Protection',
    'terms.personal.content': 'The Provider processes the Client\'s personal data in accordance with the GDPR Regulation (EU 2016/679) only for the purposes of processing the inquiry, concluding the contract and providing services. Data is not provided to third parties except in necessary cases (e.g. accountant, insurance company).||Details are provided in the Privacy Policy available on the Provider\'s website.',
    'terms.final.title': '9. Final Provisions',
    'terms.final.content': '• Legal relations between the Provider and the Client are governed by the legal system of the Czech Republic, in particular the Civil Code (Act No. 89/2012 Coll.).|• Consumers have the right to out-of-court dispute resolution at the Czech Trade Inspection Authority (www.coi.cz).|• These Terms take effect on November 1, 2025 and are valid for all orders placed after this date.',

    // Cookie Banner
    'cookie.title': 'Moving Your Privacy to a Safe Place!',
    'cookie.description': 'We use cookies to ensure smooth browsing of our website - just like smooth moving of your belongings. No unnecessary obstacles!',
    'cookie.necessary.title': 'Necessary Cookies',
    'cookie.necessary.description': 'These cookies are like our professional movers - we simply can\'t do without them. They ensure basic website functionality.',
    'cookie.marketing.title': 'Marketing Cookies',
    'cookie.marketing.description': 'They help us improve our services and offer you relevant content. You can refuse them, but we\'d love to stay in touch!',
    'cookie.acceptAll': 'Accept All',
    'cookie.acceptNecessary': 'Necessary Only',
    'cookie.customize': 'Customize',
    'cookie.savePreferences': 'Save Preferences',
    'cookie.learnMore': 'Learn More'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'cs') ? saved : 'cs';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['cs']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
