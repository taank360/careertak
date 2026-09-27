// Mock interview question bank. `k` = keywords a strong answer usually touches.
export const HR_QUESTIONS = [
  { q: 'Tell me about yourself.', k: ['studied', 'skills', 'project', 'internship', 'goal', 'passion', 'experience', 'learned'], tip: 'Present → Past → Future: who you are, what you have done, why this role.' },
  { q: 'Why should we hire you?', k: ['skills', 'value', 'learn', 'team', 'result', 'contribute', 'experience'], tip: 'Match 2–3 of your strengths to the job requirements with proof.' },
  { q: 'What are your strengths and weaknesses?', k: ['strength', 'weakness', 'improve', 'working on', 'example'], tip: 'Pick a real weakness and show what you are doing to improve it.' },
  { q: 'Where do you see yourself in five years?', k: ['grow', 'learn', 'lead', 'responsibility', 'expert', 'company'], tip: 'Show ambition aligned with the company, not a plan to leave.' },
  { q: 'Why do you want to work with our company?', k: ['company', 'culture', 'values', 'product', 'growth', 'learn', 'mission'], tip: 'Research the company: mention its product, values or recent news.' },
  { q: 'Are you willing to relocate or work in shifts?', k: ['yes', 'flexible', 'open', 'adapt', 'family'], tip: 'Be honest; show flexibility where you can.' },
];

export const BEHAVIORAL_QUESTIONS = [
  { q: 'Describe a time you worked in a team to achieve a goal.', k: ['team', 'role', 'task', 'action', 'result', 'challenge', 'we', 'i'], tip: 'Use STAR: Situation, Task, Action, Result.' },
  { q: 'Tell me about a challenge you faced and how you overcame it.', k: ['challenge', 'problem', 'action', 'result', 'learned', 'solved'], tip: 'Focus on YOUR actions and a measurable result.' },
  { q: 'Tell me about a time you failed. What did you learn?', k: ['failed', 'mistake', 'learned', 'improve', 'next time', 'responsibility'], tip: 'Own the mistake; emphasise the lesson and change.' },
  { q: 'Describe a situation where you had to meet a tight deadline.', k: ['deadline', 'prioritise', 'plan', 'time', 'result', 'delivered'], tip: 'Show planning and prioritisation, not just working late.' },
  { q: 'Give an example of when you showed leadership.', k: ['led', 'initiative', 'team', 'motivated', 'result', 'organised'], tip: 'Leadership can be a college fest, NSS, or a group project.' },
];

export const TECH_QUESTIONS = {
  'software-developer': [
    { q: 'Explain the difference between an array and a linked list.', k: ['memory', 'contiguous', 'index', 'insertion', 'pointer', 'node', 'o(1)', 'o(n)'] },
    { q: 'What is object-oriented programming? Explain its four pillars.', k: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'class', 'object'] },
    { q: 'How would you find duplicates in a list efficiently?', k: ['hash', 'set', 'map', 'sort', 'o(n)', 'time', 'space'] },
    { q: 'What happens when you type a URL into a browser?', k: ['dns', 'ip', 'http', 'tcp', 'server', 'request', 'response', 'render'] },
  ],
  'web-developer': [
    { q: 'What is the difference between let, const and var in JavaScript?', k: ['scope', 'block', 'function', 'hoisting', 'reassign', 'const'] },
    { q: 'Explain how you make a website responsive.', k: ['media query', 'flexbox', 'grid', 'viewport', 'mobile', 'relative', 'rem'] },
    { q: 'What is a REST API?', k: ['http', 'get', 'post', 'resource', 'json', 'stateless', 'endpoint'] },
    { q: 'What are React hooks? Name a few.', k: ['usestate', 'useeffect', 'state', 'component', 'function', 'hook'] },
  ],
  'data-analyst': [
    { q: 'How would you handle missing values in a dataset?', k: ['remove', 'impute', 'mean', 'median', 'drop', 'pattern', 'business'] },
    { q: 'Explain the difference between INNER JOIN and LEFT JOIN.', k: ['inner', 'left', 'matching', 'all rows', 'null', 'table'] },
    { q: 'How would you explain a dashboard insight to a non-technical manager?', k: ['simple', 'story', 'chart', 'impact', 'action', 'recommend'] },
    { q: 'What is the difference between mean and median, and when to use each?', k: ['average', 'middle', 'outlier', 'skew', 'distribution'] },
  ],
  'ai-ml-engineer': [
    { q: 'What is overfitting and how can you prevent it?', k: ['training', 'test', 'generalise', 'regularisation', 'cross-validation', 'dropout', 'data'] },
    { q: 'Explain supervised vs unsupervised learning with examples.', k: ['label', 'classification', 'regression', 'clustering', 'example'] },
    { q: 'How would you evaluate a classification model?', k: ['accuracy', 'precision', 'recall', 'f1', 'confusion', 'roc', 'auc'] },
    { q: 'What is a large language model and how would you use one in a product responsibly?', k: ['transformer', 'prompt', 'token', 'hallucination', 'evaluation', 'privacy', 'safety'] },
  ],
  'cybersecurity-analyst': [
    { q: 'What is the CIA triad?', k: ['confidentiality', 'integrity', 'availability'] },
    { q: 'Explain phishing and how an organisation can defend against it.', k: ['email', 'training', 'filter', 'mfa', 'report', 'link'] },
    { q: 'Difference between IDS and IPS?', k: ['detect', 'prevent', 'block', 'alert', 'network'] },
  ],
  'ui-ux-designer': [
    { q: 'Walk me through your design process.', k: ['research', 'user', 'persona', 'wireframe', 'prototype', 'test', 'iterate'] },
    { q: 'How do you design for accessibility?', k: ['contrast', 'font', 'screen reader', 'alt', 'keyboard', 'wcag'] },
    { q: 'How do you handle feedback that conflicts with user research?', k: ['data', 'user', 'test', 'discuss', 'evidence', 'compromise'] },
  ],
  'digital-marketer': [
    { q: 'How would you grow Instagram followers for a local restaurant?', k: ['content', 'reels', 'hashtags', 'local', 'influencer', 'offer', 'consistency', 'analytics'] },
    { q: 'What KPIs would you track for a Google Ads campaign?', k: ['ctr', 'cpc', 'conversion', 'roas', 'impressions', 'quality score'] },
    { q: 'Explain on-page vs off-page SEO.', k: ['keyword', 'meta', 'content', 'backlink', 'authority', 'speed'] },
  ],
  accountant: [
    { q: 'Explain the difference between CGST, SGST and IGST.', k: ['intra', 'inter', 'state', 'central', 'integrated'] },
    { q: 'What is a bank reconciliation statement?', k: ['passbook', 'cash book', 'difference', 'cheque', 'match'] },
    { q: 'How do you record depreciation?', k: ['asset', 'straight line', 'written down', 'expense', 'journal'] },
  ],
  'banking-associate': [
    { q: 'What is the difference between CRR and SLR?', k: ['cash', 'reserve', 'rbi', 'liquid', 'deposits', 'statutory'] },
    { q: 'How would you convince a customer to open a savings account?', k: ['benefit', 'interest', 'safety', 'need', 'listen', 'digital'] },
    { q: 'What is financial inclusion? Name some government schemes.', k: ['jan dhan', 'mudra', 'access', 'unbanked', 'atal pension', 'insurance'] },
  ],
  'govt-officer': [
    { q: 'What are the major challenges facing Madhya Pradesh today?', k: ['agriculture', 'employment', 'health', 'education', 'tribal', 'infrastructure', 'water'] },
    { q: 'How would you handle a situation where political pressure conflicts with the rules?', k: ['law', 'integrity', 'transparent', 'document', 'senior', 'public interest'] },
    { q: 'Why do you want to join civil services?', k: ['serve', 'public', 'change', 'society', 'impact', 'governance'] },
  ],
  teacher: [
    { q: 'How would you teach a difficult concept to a weak student?', k: ['example', 'simple', 'visual', 'patience', 'practice', 'feedback'] },
    { q: 'How do you manage a noisy classroom?', k: ['rules', 'engage', 'activity', 'calm', 'respect', 'attention'] },
    { q: 'How can technology improve learning?', k: ['video', 'quiz', 'digital', 'interactive', 'diksha', 'access'] },
  ],
  'sales-bde': [
    { q: 'Sell me this pen.', k: ['need', 'question', 'benefit', 'feature', 'close', 'price', 'listen'] },
    { q: 'How do you handle rejection from a customer?', k: ['learn', 'feedback', 'follow up', 'positive', 'persist', 'next'] },
    { q: 'How would you plan to meet a monthly sales target?', k: ['pipeline', 'leads', 'daily', 'track', 'conversion', 'follow up'] },
  ],
  'hr-executive': [
    { q: 'How would you screen 500 applications for 10 positions?', k: ['criteria', 'shortlist', 'ats', 'test', 'interview', 'fair'] },
    { q: 'How do you handle a conflict between two employees?', k: ['listen', 'neutral', 'policy', 'mediate', 'document', 'solution'] },
    { q: 'What makes a good onboarding process?', k: ['welcome', 'buddy', 'training', 'documents', 'feedback', 'culture'] },
  ],
  'production-engineer': [
    { q: 'What is 5S and why is it important?', k: ['sort', 'set in order', 'shine', 'standardise', 'sustain', 'efficiency', 'safety'] },
    { q: 'How would you reduce defects on a production line?', k: ['root cause', 'fishbone', 'pareto', 'six sigma', 'inspection', 'process'] },
    { q: 'Explain OEE.', k: ['availability', 'performance', 'quality', 'efficiency', 'equipment'] },
  ],
  electrician: [
    { q: 'What safety steps do you follow before working on a live panel?', k: ['isolate', 'lockout', 'tagout', 'ppe', 'test', 'gloves', 'earthing'] },
    { q: 'Explain how a rooftop solar system with net metering works.', k: ['panel', 'inverter', 'dc', 'ac', 'grid', 'meter', 'export'] },
    { q: 'What is the purpose of an MCB and ELCB/RCCB?', k: ['overload', 'short circuit', 'leakage', 'earth', 'protection', 'trip'] },
  ],
  'agri-specialist': [
    { q: 'How would you advise a soybean farmer facing low yield?', k: ['soil test', 'seed', 'variety', 'fertiliser', 'pest', 'irrigation', 'kvk'] },
    { q: 'What are the benefits of Farmer Producer Organisations?', k: ['collective', 'market', 'price', 'input', 'bargaining', 'credit'] },
    { q: 'How can drones help agriculture?', k: ['spraying', 'survey', 'mapping', 'efficiency', 'cost', 'precision'] },
  ],
  'healthcare-assistant': [
    { q: 'How do you take care of a patient who is anxious before surgery?', k: ['listen', 'reassure', 'explain', 'calm', 'inform nurse', 'empathy'] },
    { q: 'What infection-control practices do you follow?', k: ['hand hygiene', 'gloves', 'mask', 'sterilise', 'waste', 'ppe'] },
    { q: 'What would you do if a patient collapses?', k: ['call', 'help', 'airway', 'breathing', 'cpr', 'doctor'] },
  ],
  entrepreneur: [
    { q: 'Describe your business idea and the problem it solves.', k: ['problem', 'customer', 'solution', 'market', 'revenue', 'competition'] },
    { q: 'How will you get your first 100 customers?', k: ['channel', 'referral', 'social', 'pilot', 'offer', 'local', 'partner'] },
    { q: 'How will you fund your startup?', k: ['bootstrap', 'mudra', 'pmegp', 'incubator', 'angel', 'grant', 'revenue'] },
  ],
};

export const FILLERS = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'so so', 'matlab', 'hmm'];
export const STAR_WORDS = {
  S: ['situation', 'when', 'during', 'while', 'in my', 'at my', 'once'],
  T: ['task', 'goal', 'responsible', 'needed to', 'had to', 'target', 'objective'],
  A: ['i did', 'i decided', 'i created', 'i built', 'i organised', 'i organized', 'i led', 'i spoke', 'i planned', 'i implemented', 'action', 'i took'],
  R: ['result', 'as a result', 'increased', 'reduced', 'improved', 'achieved', 'won', 'saved', '%', 'percent', 'finally', 'outcome', 'learned'],
};
