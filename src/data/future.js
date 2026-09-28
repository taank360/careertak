// Future-of-work data. Growth (CAGR) and automation-risk figures are INDICATIVE projections
// built from published trend reports (WEF Future of Jobs 2025, NASSCOM, India Skills Report,
// MNRE/solar & EV policy targets). They are for comparison between options, not official forecasts.

export const TREND_SOURCE = 'Indicative projections based on WEF Future of Jobs 2025, NASSCOM, India Skills Report and Govt. sector targets.';

export const START_YEAR = 2026;
export const END_YEAR = 2031;

// Per-career outlook: cagr = expected yearly demand growth, risk = % of tasks at risk of automation.
export const CAREER_FUTURE = {
  'software-developer': { cagr: 0.09, risk: 30, note: 'AI tools change the job. Developers who use AI well and understand systems stay in high demand.' },
  'web-developer': { cagr: 0.06, risk: 38, note: 'Simple sites are being automated by AI builders; full-stack and product skills remain valuable.' },
  'data-analyst': { cagr: 0.12, risk: 25, note: 'Every sector is becoming data-driven — among the fastest-growing roles globally.' },
  'ai-ml-engineer': { cagr: 0.25, risk: 10, note: 'Top growth role worldwide. India is building national AI capacity (IndiaAI Mission).' },
  'cybersecurity-analyst': { cagr: 0.16, risk: 12, note: 'More digital payments and services mean more attacks — security talent is short.' },
  'ui-ux-designer': { cagr: 0.08, risk: 30, note: 'Digital products keep growing; designers with research skills stay ahead of AI tools.' },
  'digital-marketer': { cagr: 0.1, risk: 35, note: 'Small businesses are moving online fast; AI handles content, humans own strategy.' },
  accountant: { cagr: 0.01, risk: 55, note: 'Routine bookkeeping is being automated. GST, compliance and financial analysis skills keep you relevant.' },
  'banking-associate': { cagr: 0.0, risk: 50, note: 'Teller and counter jobs are shrinking; digital banking, fintech and credit sales are growing.' },
  'govt-officer': { cagr: 0.02, risk: 10, note: 'Stable and secure, but vacancies are limited and competition is very high.' },
  teacher: { cagr: 0.04, risk: 20, note: 'NEP 2020 and ed-tech create demand for teachers who can teach with digital tools.' },
  'sales-bde': { cagr: 0.06, risk: 25, note: 'Relationship-based selling stays human; high fresher hiring across sectors.' },
  'hr-executive': { cagr: 0.04, risk: 35, note: 'Screening is being automated; people-management and HR analytics roles grow.' },
  'production-engineer': { cagr: 0.06, risk: 30, note: 'Make in India & PLI schemes grow manufacturing; automation skills are a must.' },
  electrician: { cagr: 0.12, risk: 10, note: 'Solar rooftops, EV charging and smart meters need skilled technicians — hard to automate.' },
  'agri-specialist': { cagr: 0.08, risk: 15, note: 'Agri-tech, drones and FPOs are modernising MP’s large farm sector.' },
  'healthcare-assistant': { cagr: 0.1, risk: 8, note: 'Healthcare is expanding and care work needs people — very low automation risk.' },
  entrepreneur: { cagr: 0.1, risk: 15, note: 'Startup India, MP Startup Policy and digital payments make it easier to start small.' },
};

// Business ideas for self-employment, relevant to Madhya Pradesh.
export const BUSINESSES = [
  { id: 'solar-business', title: 'Solar Installation & Service', hi: 'सोलर इंस्टॉलेशन व्यवसाय', icon: '☀️', invest: [2, 5], riasec: 'RIE', skills: ['electrical', 'solar', 'sales', 'customer'], cagr: 0.18, risk: 10, schemes: ['PM Surya Ghar', 'PMEGP'], about: 'Install and maintain rooftop solar for homes and shops. PM Surya Ghar subsidies are driving huge demand.' },
  { id: 'ev-service', title: 'EV Repair & Charging Point', hi: 'ईवी रिपेयर व चार्जिंग', icon: '🔋', invest: [3, 10], riasec: 'RIE', skills: ['electrical', 'customer', 'problem'], cagr: 0.22, risk: 12, schemes: ['PMEGP', 'Mudra'], about: 'E-rickshaws and EV two-wheelers are spreading in every MP town and need service & charging.' },
  { id: 'drone-services', title: 'Agri-Drone Spraying Services', hi: 'कृषि ड्रोन सेवा', icon: '🚁', invest: [6, 12], riasec: 'RIE', skills: ['agritech', 'agronomy', 'customer'], cagr: 0.2, risk: 15, schemes: ['Kisan Drone subsidy', 'Agri Infra Fund'], about: 'Spray crops by drone for farmers on a per-acre fee. Needs a DGCA remote pilot certificate.' },
  { id: 'digital-agency', title: 'Digital Marketing Agency', hi: 'डिजिटल मार्केटिंग एजेंसी', icon: '📱', invest: [0.5, 2], riasec: 'EAS', skills: ['socialmedia', 'seo', 'design', 'sales'], cagr: 0.12, risk: 30, schemes: ['Mudra', 'Startup MP'], about: 'Manage social media, Google listings and ads for local shops, clinics and coaching centres.' },
  { id: 'food-processing', title: 'Food Processing Unit', hi: 'खाद्य प्रसंस्करण इकाई', icon: '🥫', invest: [5, 25], riasec: 'REC', skills: ['agronomy', 'entrepreneurship', 'accounting', 'quality'], cagr: 0.09, risk: 15, schemes: ['PMFME', 'PMEGP'], about: 'Process soybean, pulses, spices or garlic (MP is a top producer) into packaged products.' },
  { id: 'handicraft-store', title: 'Online Handicraft Store', hi: 'ऑनलाइन हस्तशिल्प स्टोर', icon: '🧵', invest: [0.5, 3], riasec: 'AEC', skills: ['socialmedia', 'design', 'entrepreneurship', 'customer'], cagr: 0.11, risk: 25, schemes: ['ODOP', 'Mudra'], about: 'Sell Chanderi, Maheshwari and Bagh print products online through ONDC, Amazon and Instagram.' },
  { id: 'organic-farming', title: 'Organic Farm & Produce Brand', hi: 'जैविक खेती ब्रांड', icon: '🌱', invest: [2, 8], riasec: 'RSE', skills: ['agronomy', 'entrepreneurship', 'sales'], cagr: 0.1, risk: 20, schemes: ['PKVY', 'FPO scheme'], about: 'Grow and sell certified organic produce directly to city customers or through an FPO.' },
  { id: 'freelance-studio', title: 'Web & App Development Studio', hi: 'वेब व ऐप डेवलपमेंट स्टूडियो', icon: '💻', invest: [0.3, 1.5], riasec: 'ICE', skills: ['webdev', 'programming', 'sales', 'communication'], cagr: 0.1, risk: 35, schemes: ['Startup MP', 'Mudra'], about: 'Build websites and apps for local businesses and remote clients from your own town.' },
  { id: 'homestay', title: 'Homestay & Local Tourism', hi: 'होमस्टे व पर्यटन', icon: '🏡', invest: [2, 10], riasec: 'SEA', skills: ['hospitality', 'communication', 'socialmedia', 'customer'], cagr: 0.1, risk: 20, schemes: ['MP Tourism Homestay scheme'], about: 'Host tourists near Khajuraho, Pachmarhi, Orchha or Kanha with local food and guided experiences.' },
  { id: 'cloud-kitchen', title: 'Cloud Kitchen / Tiffin Service', hi: 'क्लाउड किचन / टिफिन सेवा', icon: '🍱', invest: [1, 4], riasec: 'ESR', skills: ['hospitality', 'customer', 'socialmedia'], cagr: 0.08, risk: 35, schemes: ['PMFME', 'Mudra'], about: 'Serve students and working people through Swiggy/Zomato and monthly tiffin plans.' },
  { id: 'coaching-centre', title: 'Coaching Centre + Online Classes', hi: 'कोचिंग सेंटर', icon: '🏫', invest: [0.5, 3], riasec: 'SAE', skills: ['subject', 'pedagogy', 'communication', 'presentation'], cagr: 0.07, risk: 30, schemes: ['Mudra'], about: 'Teach school or competitive-exam students offline and record lessons for YouTube.' },
  { id: 'mobile-repair', title: 'Mobile & Electronics Repair', hi: 'मोबाइल रिपेयर', icon: '🔧', invest: [0.5, 2], riasec: 'RIC', skills: ['electrical', 'customer', 'problem'], cagr: 0.03, risk: 30, schemes: ['PMEGP', 'Mudra'], about: 'Steady local demand, but newer sealed devices make some repairs harder.' },
  { id: 'csc-centre', title: 'Digital Seva Kendra (CSC)', hi: 'डिजिटल सेवा केंद्र', icon: '🖥️', invest: [0.5, 2], riasec: 'CSE', skills: ['digital', 'customer', 'communication'], cagr: 0.01, risk: 45, schemes: ['CSC scheme'], about: 'Offer Aadhaar, banking, bill payment and form services. More people now do these on their own phones.' },
];

// Careers expected to shrink — shown as a warning with a better alternative.
export const DECLINING = [
  { title: 'Data Entry Operator', hi: 'डेटा एंट्री ऑपरेटर', icon: '⌨️', cagr: -0.08, risk: 85, why: 'OCR and AI now read forms and invoices automatically.', switchTo: 'data-analyst' },
  { title: 'Bank Teller / Cashier', hi: 'बैंक कैशियर', icon: '💵', cagr: -0.06, risk: 75, why: 'UPI and digital banking reduce counter transactions every year.', switchTo: 'banking-associate' },
  { title: 'Typist / Stenographer', hi: 'टाइपिस्ट / स्टेनोग्राफर', icon: '📠', cagr: -0.07, risk: 85, why: 'Speech-to-text and AI writing tools replace manual typing.', switchTo: 'digital-marketer' },
  { title: 'Bookkeeping Clerk', hi: 'बहीखाता क्लर्क', icon: '📒', cagr: -0.05, risk: 75, why: 'Accounting software automates entries and reconciliation.', switchTo: 'accountant' },
  { title: 'Telecaller (basic voice process)', hi: 'टेलीकॉलर', icon: '☎️', cagr: -0.05, risk: 70, why: 'AI voice bots and chatbots handle routine calls.', switchTo: 'sales-bde' },
  { title: 'DTP / Photo Lab Operator', hi: 'डीटीपी ऑपरेटर', icon: '🖨️', cagr: -0.06, risk: 70, why: 'Print demand is falling and design tools are automated.', switchTo: 'ui-ux-designer' },
  { title: 'Ticket / Travel Booking Agent', hi: 'टिकट बुकिंग एजेंट', icon: '🎫', cagr: -0.05, risk: 70, why: 'Customers book directly through apps.', switchTo: 'entrepreneur' },
  { title: 'Manual Assembly Worker', hi: 'मैनुअल असेंबली वर्कर', icon: '🏭', cagr: -0.03, risk: 60, why: 'Factories are adding robots and automated lines.', switchTo: 'production-engineer' },
];

export const demandSeries = (cagr) => {
  const out = [];
  for (let y = START_YEAR; y <= END_YEAR; y++) out.push({ year: y, value: Math.round(100 * (1 + cagr) ** (y - START_YEAR)) });
  return out;
};

export const growthBy = (cagr, year = 2030) => Math.round(((1 + cagr) ** (year - START_YEAR) - 1) * 100);

/** 0-100 future-proof score from growth and automation risk. */
export const futureScore = ({ cagr, risk }) => Math.max(0, Math.min(100, Math.round(55 + cagr * 250 - risk * 0.45)));

export function trendOf(cagr) {
  if (cagr >= 0.1) return { id: 'boom', label: 'High growth', hi: 'तेज़ वृद्धि', tone: 'ok', arrow: '▲▲' };
  if (cagr >= 0.05) return { id: 'rising', label: 'Growing', hi: 'बढ़ रही', tone: 'ok', arrow: '▲' };
  if (cagr >= 0) return { id: 'stable', label: 'Stable', hi: 'स्थिर', tone: 'warn', arrow: '▬' };
  return { id: 'declining', label: 'Declining', hi: 'घट रही', tone: 'bad', arrow: '▼' };
}

export const riskLabel = (risk) => (risk >= 60 ? 'High' : risk >= 35 ? 'Medium' : 'Low');

export const futureOf = (careerId) => {
  const f = CAREER_FUTURE[careerId];
  if (!f) return null;
  return { ...f, score: futureScore(f), trend: trendOf(f.cagr), growth2030: growthBy(f.cagr), series: demandSeries(f.cagr) };
};

export const businessFuture = (b) => ({ score: futureScore(b), trend: trendOf(b.cagr), growth2030: growthBy(b.cagr), series: demandSeries(b.cagr) });
