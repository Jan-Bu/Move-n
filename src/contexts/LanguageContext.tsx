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
    'gdpr.contact.content': 'Pro uplatnění vašich práv nebo dotazy ohledně zpracování osobních údajů nás kontaktujte:|E-mail: info@move-n.cz|Telefon: +420 123 456 789|Poštovní adresa: [Adresa společnosti]',

    // Terms Page
    'terms.title': 'Obchodní podmínky',
    'terms.backToHome': 'Zpět na hlavní stránku',
    'terms.lastUpdated': 'Poslední aktualizace:',
    'terms.intro.title': 'Úvodní ustanovení',
    'terms.intro.content': 'Tyto obchodní podmínky upravují vztahy mezi společností MOVI-N (dále jen "poskytovatel" nebo "společnost") a zákazníkem při poskytování stěhovacích služeb. Obchodní podmínky jsou nedílnou součástí uzavřené smlouvy o poskytnutí služeb.',
    'terms.provider.title': 'Identifikace poskytovatele',
    'terms.provider.company': 'MOVI-N',
    'terms.provider.id': 'IČO: [IČO společnosti]',
    'terms.provider.address': 'Sídlo: [Adresa společnosti]',
    'terms.services.title': 'Předmět služeb',
    'terms.services.content': 'Poskytovatel nabízí následující služby:|• Stěhování bytů, domů a kanceláří|• Balení a ochrana nábytku a dalších předmětů|• Demontáž a montáž nábytku|• Přeprava věcí na místo určení|• Uskladnění věcí (dle dohody)|• Likvidace nepotřebného nábytku a vybavení||Konkrétní rozsah služeb je vždy specifikován v cenové nabídce a potvrzení objednávky.',
    'terms.order.title': 'Objednávka a uzavření smlouvy',
    'terms.order.content': 'Smlouva je uzavřena na základě:|1. Poptávky zákazníka (telefonicky, e-mailem nebo prostřednictvím webového formuláře)|2. Cenové nabídky poskytovatele obsahující rozsah služeb, termín a cenu|3. Potvrzení objednávky ze strany zákazníka||Smlouva vzniká okamžikem potvrzení objednávky zákazníkem. Poskytovatel si vyhrazuje právo odmítnout objednávku v odůvodněných případech.',
    'terms.price.title': 'Cena a platební podmínky',
    'terms.price.content': 'Cena za služby je stanovena v cenové nabídce na základě:|• Rozsahu a složitosti stěhování|• Vzdálenosti mezi místy nakládky a vykládky|• Objemu a váhy přepravovaných věcí|• Potřeby speciálního vybavení nebo zvláštních opatření||Platební podmínky:|• Záloha 30% při potvrzení objednávky (u velkých zakázek)|• Zbývající částka splatná v hotovosti nebo převodem po dokončení služby|• Faktura je vystavena do 3 pracovních dnů po dokončení služby||Cena může být upravena pouze v případě podstatné změny rozsahu služeb po dohodě s zákazníkem.',
    'terms.customer.title': 'Povinnosti zákazníka',
    'terms.customer.content': 'Zákazník je povinen:|• Poskytnout přesné informace o rozsahu stěhování a místech nakládky/vykládky|• Zajistit přístup k objektům v dohodnutém termínu|• Upozornit na cenné, křehké nebo nebezpečné předměty|• Informovat o zvláštních podmínkách přístupu (úzké schodiště, absence výtahu apod.)|• Být přítomen při nakládce i vykládce nebo zajistit zastoupení oprávněnou osobou|• Uhradit sjednanou cenu ve stanoveném termínu',
    'terms.provider.resp.title': 'Odpovědnost poskytovatele',
    'terms.provider.resp.content': 'Poskytovatel odpovídá za:|• Škody způsobené na přepravovaných věcech při řádně provedeném balení|• Škody způsobené nedbalostí zaměstnanců poskytovatele||Poskytovatel neodpovídá za:|• Škody na věcech, které zákazník zabalil sám|• Skrytě vady přepravovaných předmětů|• Škody způsobené vyšší mocí|• Ztrátu nebo poškození věcí, které nebyly uvedeny v seznamu přepravovaného zboží||Maximální výše náhrady škody je omezena na pojistnou částku stanovenou v pojistné smlouvě poskytovatele.',
    'terms.insurance.title': 'Pojištění',
    'terms.insurance.content': 'Poskytovatel má uzavřeno pojištění odpovědnosti za škodu. Zákazník má možnost uzavřít rozšířené pojištění přepravovaných věcí za příplatek. Podmínky rozšířeného pojištění jsou součástí cenové nabídky.',
    'terms.cancellation.title': 'Zrušení objednávky a odstoupení od smlouvy',
    'terms.cancellation.content': 'Zrušení ze strany zákazníka:|• Více než 7 dní před termínem: bez poplatku|• 3-7 dní před termínem: storno poplatek 30% z ceny|• 1-2 dny před termínem: storno poplatek 50% z ceny|• Méně než 24 hodin před termínem: storno poplatek 100% z ceny||Zrušení ze strany poskytovatele:|• Poskytovatel může zrušit objednávku z objektivních důvodů (nemoc zaměstnanců, porucha vozidla) s minimálně 24hodinovým předstihem|• V tomto případě bude zákazníkovi vrácena případná záloha v plné výši',
    'terms.complaints.title': 'Reklamace',
    'terms.complaints.content': 'Zákazník má právo reklamovat vady poskytnuté služby nebo škody vzniklé při stěhování:|• Reklamace musí být uplatněna bez zbytečného odkladu, nejpozději do 3 dnů od dokončení služby|• Reklamace se podává písemně na e-mail: info@move-n.cz nebo poštou|• Reklamace musí obsahovat popis vady/škody a fotodokumentaci|• Poskytovatel vyřídí reklamaci do 30 dnů od jejího doručení|• O vyřízení reklamace bude zákazník informován písemně',
    'terms.personal.title': 'Ochrana osobních údajů',
    'terms.personal.content': 'Zpracování osobních údajů se řídí samostatným dokumentem "Ochrana osobních údajů (GDPR)", který je k dispozici na webových stránkách společnosti.',
    'terms.final.title': 'Závěrečná ustanovení',
    'terms.final.content': 'Tyto obchodní podmínky nabývají účinnosti dnem 1. 1. 2024.|Poskytovatel si vyhrazuje právo změnit tyto obchodní podmínky. Změny nabývají účinnosti jejich zveřejněním na webových stránkách.|Na vztahy neupravené těmito obchodními podmínkami se vztahují příslušná ustanovení občanského zákoníku a dalších právních předpisů České republiky.|V případě sporů jsou příslušné soudy České republiky.',

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
    'gdpr.contact.content': 'To exercise your rights or for questions regarding personal data processing, contact us:|Email: info@move-n.cz|Phone: +420 123 456 789|Postal address: [Company Address]',

    // Terms Page
    'terms.title': 'Terms & Conditions',
    'terms.backToHome': 'Back to Home',
    'terms.lastUpdated': 'Last Updated:',
    'terms.intro.title': 'Introductory Provisions',
    'terms.intro.content': 'These Terms and Conditions govern the relationship between MOVI-N company (hereinafter "provider" or "company") and the customer in the provision of moving services. The Terms and Conditions are an integral part of the concluded service agreement.',
    'terms.provider.title': 'Provider Identification',
    'terms.provider.company': 'MOVI-N',
    'terms.provider.id': 'Company ID: [Company ID]',
    'terms.provider.address': 'Address: [Company Address]',
    'terms.services.title': 'Subject of Services',
    'terms.services.content': 'The provider offers the following services:|• Moving of apartments, houses and offices|• Packing and protection of furniture and other items|• Disassembly and assembly of furniture|• Transportation of items to destination|• Storage of items (by agreement)|• Disposal of unwanted furniture and equipment||The specific scope of services is always specified in the price quote and order confirmation.',
    'terms.order.title': 'Order and Contract Conclusion',
    'terms.order.content': 'The contract is concluded based on:|1. Customer inquiry (by phone, email or via web form)|2. Provider\'s price quote containing scope of services, date and price|3. Order confirmation from the customer||The contract arises upon confirmation of the order by the customer. The provider reserves the right to refuse an order in justified cases.',
    'terms.price.title': 'Price and Payment Terms',
    'terms.price.content': 'The price for services is determined in the price quote based on:|• Scope and complexity of the move|• Distance between loading and unloading locations|• Volume and weight of transported items|• Need for special equipment or special measures||Payment terms:|• 30% deposit upon order confirmation (for large orders)|• Remaining amount payable in cash or by transfer after service completion|• Invoice is issued within 3 business days after service completion||The price can only be adjusted in case of substantial change in scope of services by agreement with the customer.',
    'terms.customer.title': 'Customer Obligations',
    'terms.customer.content': 'The customer is obliged to:|• Provide accurate information about the scope of the move and loading/unloading locations|• Ensure access to premises at the agreed time|• Point out valuable, fragile or dangerous items|• Inform about special access conditions (narrow stairs, no elevator, etc.)|• Be present during loading and unloading or provide representation by an authorized person|• Pay the agreed price within the specified period',
    'terms.provider.resp.title': 'Provider Liability',
    'terms.provider.resp.content': 'The provider is liable for:|• Damage to transported items when properly packed|• Damage caused by negligence of provider\'s employees||The provider is not liable for:|• Damage to items packed by the customer|• Hidden defects of transported items|• Damage caused by force majeure|• Loss or damage to items not listed in the transported goods list||The maximum amount of damage compensation is limited to the insurance amount specified in the provider\'s insurance contract.',
    'terms.insurance.title': 'Insurance',
    'terms.insurance.content': 'The provider has liability insurance. The customer has the option to purchase extended insurance for transported items for an additional fee. The terms of extended insurance are part of the price quote.',
    'terms.cancellation.title': 'Order Cancellation and Withdrawal from Contract',
    'terms.cancellation.content': 'Cancellation by customer:|• More than 7 days before date: no fee|• 3-7 days before date: 30% cancellation fee|• 1-2 days before date: 50% cancellation fee|• Less than 24 hours before date: 100% cancellation fee||Cancellation by provider:|• Provider may cancel order for objective reasons (employee illness, vehicle breakdown) with at least 24 hours notice|• In this case, any deposit will be refunded in full',
    'terms.complaints.title': 'Complaints',
    'terms.complaints.content': 'The customer has the right to complain about defects in the provided service or damage incurred during the move:|• Complaint must be filed without undue delay, no later than 3 days after service completion|• Complaint is filed in writing to email: info@move-n.cz or by mail|• Complaint must include description of defect/damage and photo documentation|• Provider will handle complaint within 30 days of receipt|• Customer will be informed in writing about complaint resolution',
    'terms.personal.title': 'Personal Data Protection',
    'terms.personal.content': 'Personal data processing is governed by a separate document "Privacy Policy (GDPR)", which is available on the company website.',
    'terms.final.title': 'Final Provisions',
    'terms.final.content': 'These Terms and Conditions take effect on January 1, 2024.|The provider reserves the right to change these Terms and Conditions. Changes take effect upon publication on the website.|Relations not governed by these Terms and Conditions are subject to relevant provisions of the Civil Code and other legal regulations of the Czech Republic.|In case of disputes, courts of the Czech Republic have jurisdiction.',

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
