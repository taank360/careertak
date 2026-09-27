// Master skill catalogue. `cat` drives grouping in the self-rating UI.
// `test` links a skill to an assessment module so quiz scores can calibrate self-ratings.
export const SKILLS = {
  // Foundational / employability
  communication: { name: 'English Communication', hi: 'अंग्रेज़ी संवाद', cat: 'core', test: 'communication' },
  aptitude: { name: 'Quantitative & Logical Aptitude', hi: 'गणितीय व तार्किक योग्यता', cat: 'core', test: 'aptitude' },
  digital: { name: 'Digital Literacy', hi: 'डिजिटल साक्षरता', cat: 'core', test: 'digital' },
  teamwork: { name: 'Teamwork & Collaboration', hi: 'टीमवर्क', cat: 'core', test: 'softskills' },
  problem: { name: 'Problem Solving', hi: 'समस्या समाधान', cat: 'core', test: 'aptitude' },
  presentation: { name: 'Presentation & Public Speaking', hi: 'प्रस्तुति कौशल', cat: 'core' },

  // Tech
  programming: { name: 'Programming Fundamentals', hi: 'प्रोग्रामिंग', cat: 'tech', test: 'programming' },
  python: { name: 'Python', cat: 'tech', test: 'programming' },
  java: { name: 'Java / OOP', cat: 'tech' },
  dsa: { name: 'Data Structures & Algorithms', cat: 'tech' },
  webdev: { name: 'HTML, CSS & JavaScript', cat: 'tech' },
  react: { name: 'React / Frontend Frameworks', cat: 'tech' },
  backend: { name: 'Backend & APIs (Node/Django)', cat: 'tech' },
  sql: { name: 'SQL & Databases', cat: 'tech', test: 'data' },
  git: { name: 'Git & GitHub', cat: 'tech' },
  excel: { name: 'MS Excel / Spreadsheets', hi: 'एक्सेल', cat: 'tech', test: 'data' },
  statistics: { name: 'Statistics', cat: 'tech', test: 'data' },
  powerbi: { name: 'Power BI / Tableau', cat: 'tech' },
  ml: { name: 'Machine Learning', cat: 'tech' },
  genai: { name: 'Generative AI & Prompting', cat: 'tech' },
  cloud: { name: 'Cloud Basics (AWS/Azure)', cat: 'tech' },
  networking: { name: 'Computer Networking', cat: 'tech' },
  linux: { name: 'Linux', cat: 'tech' },
  security: { name: 'Cyber Security Fundamentals', cat: 'tech' },
  figma: { name: 'Figma / UI Design', cat: 'tech' },
  cad: { name: 'AutoCAD / SolidWorks', cat: 'tech' },

  // Business / domain
  seo: { name: 'SEO & Content', cat: 'domain', test: 'marketing' },
  socialmedia: { name: 'Social Media Marketing', cat: 'domain', test: 'marketing' },
  analytics: { name: 'Google Analytics & Ads', cat: 'domain', test: 'marketing' },
  accounting: { name: 'Accounting & Tally', hi: 'लेखांकन व टैली', cat: 'domain', test: 'finance' },
  gst: { name: 'GST & Taxation', cat: 'domain', test: 'finance' },
  banking: { name: 'Banking Awareness', hi: 'बैंकिंग जागरूकता', cat: 'domain', test: 'finance' },
  sales: { name: 'Sales & Negotiation', hi: 'बिक्री कौशल', cat: 'domain' },
  customer: { name: 'Customer Handling', hi: 'ग्राहक सेवा', cat: 'domain' },
  hrm: { name: 'HR Processes & Recruitment', cat: 'domain' },
  gk: { name: 'General Knowledge & Current Affairs', hi: 'सामान्य ज्ञान', cat: 'domain' },
  mpgk: { name: 'MP General Knowledge', hi: 'मध्यप्रदेश सामान्य ज्ञान', cat: 'domain' },
  pedagogy: { name: 'Teaching & Pedagogy', hi: 'शिक्षण कौशल', cat: 'domain' },
  subject: { name: 'Subject Expertise', hi: 'विषय विशेषज्ञता', cat: 'domain' },
  manufacturing: { name: 'Manufacturing Processes', cat: 'domain' },
  quality: { name: 'Quality Control (Six Sigma, 5S)', cat: 'domain' },
  safety: { name: 'Industrial Safety', hi: 'औद्योगिक सुरक्षा', cat: 'domain' },
  electrical: { name: 'Electrical Wiring & Maintenance', hi: 'विद्युत वायरिंग', cat: 'domain' },
  solar: { name: 'Solar PV Installation', hi: 'सोलर इंस्टॉलेशन', cat: 'domain' },
  agronomy: { name: 'Agronomy & Crop Science', hi: 'कृषि विज्ञान', cat: 'domain' },
  agritech: { name: 'Agri-Tech & Drones', cat: 'domain' },
  entrepreneurship: { name: 'Entrepreneurship', hi: 'उद्यमिता', cat: 'domain' },
  patientcare: { name: 'Patient Care', hi: 'रोगी देखभाल', cat: 'domain' },
  firstaid: { name: 'First Aid & Hygiene', cat: 'domain' },
  hospitality: { name: 'Hospitality & Guest Service', hi: 'आतिथ्य', cat: 'domain' },
  design: { name: 'Visual Design Principles', cat: 'domain' },
};

export const SKILL_CATS = {
  core: 'Employability Skills',
  tech: 'Technical Skills',
  domain: 'Domain Skills',
};

export const LEVELS = ['None', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
export const LEVELS_HI = ['शून्य', 'शुरुआती', 'बेसिक', 'मध्यम', 'उन्नत', 'विशेषज्ञ'];
