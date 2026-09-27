// Sample opportunities used for matching in the prototype.
// In production these would be pulled from MP Rojgar Portal / NCS / PM Internship APIs.
export const OPPORTUNITIES = [
  { id: 'o1', title: 'Junior Software Engineer (Trainee)', org: 'IT Services Company, Crystal IT Park', city: 'Indore', type: 'Job', mode: 'On-site', stipend: '₹3.6 – 4.5 LPA', career: 'software-developer', skills: ['programming', 'dsa', 'sql', 'communication'], posted: 2, deadline: 14 },
  { id: 'o2', title: 'Web Development Intern', org: 'EdTech Startup', city: 'Bhopal', type: 'Internship', mode: 'Hybrid', stipend: '₹10,000/month', career: 'web-developer', skills: ['webdev', 'react', 'git'], posted: 1, deadline: 10 },
  { id: 'o3', title: 'Data Analyst – Fresher', org: 'Logistics Firm', city: 'Indore', type: 'Job', mode: 'On-site', stipend: '₹3.8 LPA', career: 'data-analyst', skills: ['excel', 'sql', 'powerbi', 'statistics'], posted: 3, deadline: 20 },
  { id: 'o4', title: 'AI/ML Research Intern', org: 'University Incubator', city: 'Remote', type: 'Internship', mode: 'Remote', stipend: '₹15,000/month', career: 'ai-ml-engineer', skills: ['python', 'ml', 'statistics'], posted: 4, deadline: 12 },
  { id: 'o5', title: 'Graduate Apprentice – Banking Operations', org: 'Public Sector Bank (NATS)', city: 'Jabalpur', type: 'Apprenticeship', mode: 'On-site', stipend: '₹9,000/month', career: 'banking-associate', skills: ['banking', 'customer', 'digital'], posted: 5, deadline: 18 },
  { id: 'o6', title: 'Accounts Assistant (Tally + GST)', org: 'CA Firm', city: 'Gwalior', type: 'Job', mode: 'On-site', stipend: '₹2.4 – 3 LPA', career: 'accountant', skills: ['accounting', 'gst', 'excel'], posted: 2, deadline: 15 },
  { id: 'o7', title: 'Digital Marketing Intern', org: 'D2C Handicrafts Brand', city: 'Ujjain', type: 'Internship', mode: 'Hybrid', stipend: '₹8,000/month', career: 'digital-marketer', skills: ['socialmedia', 'seo', 'design'], posted: 1, deadline: 9 },
  { id: 'o8', title: 'Production Trainee (GET)', org: 'Auto Components Plant, Pithampur', city: 'Dhar', type: 'Job', mode: 'On-site', stipend: '₹3.2 LPA', career: 'production-engineer', skills: ['manufacturing', 'quality', 'safety'], posted: 6, deadline: 25 },
  { id: 'o9', title: 'Solar PV Technician', org: 'Rooftop Solar EPC', city: 'Rewa', type: 'Job', mode: 'Field', stipend: '₹15,000 – 20,000/month', career: 'electrician', skills: ['electrical', 'solar', 'safety'], posted: 2, deadline: 11 },
  { id: 'o10', title: 'Field Officer – FPO Support', org: 'Agri NGO', city: 'Vidisha', type: 'Job', mode: 'Field', stipend: '₹2.6 LPA', career: 'agri-specialist', skills: ['agronomy', 'communication', 'digital'], posted: 4, deadline: 16 },
  { id: 'o11', title: 'General Duty Assistant', org: 'Multi-speciality Hospital', city: 'Indore', type: 'Job', mode: 'On-site', stipend: '₹14,000/month', career: 'healthcare-assistant', skills: ['patientcare', 'firstaid', 'customer'], posted: 3, deadline: 13 },
  { id: 'o12', title: 'Business Development Associate', org: 'Fintech Company', city: 'Bhopal', type: 'Job', mode: 'On-site', stipend: '₹3 LPA + incentives', career: 'sales-bde', skills: ['sales', 'communication', 'customer'], posted: 1, deadline: 8 },
  { id: 'o13', title: 'HR Recruitment Intern', org: 'Staffing Agency', city: 'Remote', type: 'Internship', mode: 'Remote', stipend: '₹7,000/month', career: 'hr-executive', skills: ['hrm', 'communication', 'excel'], posted: 2, deadline: 10 },
  { id: 'o14', title: 'UI/UX Design Intern', org: 'Product Startup', city: 'Remote', type: 'Internship', mode: 'Remote', stipend: '₹12,000/month', career: 'ui-ux-designer', skills: ['figma', 'design'], posted: 5, deadline: 14 },
  { id: 'o15', title: 'SOC Analyst Trainee', org: 'Managed Security Provider', city: 'Indore', type: 'Job', mode: 'On-site', stipend: '₹4 LPA', career: 'cybersecurity-analyst', skills: ['networking', 'security', 'linux'], posted: 3, deadline: 19 },
  { id: 'o16', title: 'Guest Faculty – Mathematics', org: 'Higher Secondary School', city: 'Sagar', type: 'Job', mode: 'On-site', stipend: '₹20,000/month', career: 'teacher', skills: ['subject', 'pedagogy', 'communication'], posted: 7, deadline: 21 },
  { id: 'o17', title: 'PM Internship – Corporate (12 months)', org: 'Top-500 Company via PM Internship Scheme', city: 'Multiple', type: 'Internship', mode: 'On-site', stipend: '₹5,000/month + ₹6,000 one-time', career: null, skills: ['communication', 'digital', 'teamwork'], posted: 1, deadline: 30, link: 'https://pminternship.mca.gov.in' },
  { id: 'o18', title: 'Startup Incubation Cohort', org: 'MP Startup Centre', city: 'Bhopal', type: 'Program', mode: 'Hybrid', stipend: 'Mentoring + seed support', career: 'entrepreneur', skills: ['entrepreneurship', 'presentation', 'sales'], posted: 8, deadline: 28, link: 'https://startup.mp.gov.in' },
];

export const PORTALS = [
  { name: 'MP Rojgar Portal', desc: 'State employment exchange, job fairs (Rojgar Mela) & registration', url: 'https://mprojgar.gov.in', icon: '🏢' },
  { name: 'National Career Service', desc: 'Govt. of India jobs, counselling & career centres', url: 'https://www.ncs.gov.in', icon: '🇮🇳' },
  { name: 'PM Internship Scheme', desc: '12-month paid internships in top companies for 21–24 yrs', url: 'https://pminternship.mca.gov.in', icon: '🎓' },
  { name: 'Apprenticeship India (NAPS)', desc: 'Paid apprenticeships for ITI, diploma & graduates', url: 'https://www.apprenticeshipindia.gov.in', icon: '🛠️' },
  { name: 'NATS (Graduate/Diploma Apprenticeship)', desc: 'Board of Apprenticeship Training portal', url: 'https://nats.education.gov.in', icon: '📜' },
  { name: 'Skill India Digital Hub', desc: 'Free courses, certifications and job links', url: 'https://www.skillindiadigital.gov.in', icon: '📚' },
  { name: 'MP Employees Selection Board (ESB)', desc: 'State recruitment exams', url: 'https://esb.mp.gov.in', icon: '📝' },
  { name: 'MPPSC', desc: 'State civil services & other exams', url: 'https://mppsc.mp.gov.in', icon: '🏛️' },
];

export const SCHEMES = [
  { name: 'Mukhyamantri Seekho Kamao Yojana', tag: 'MP Govt', desc: 'On-the-job training with monthly stipend for youth aged 18–29 in MP. Stipend scales with qualification (12th / ITI / Diploma / Graduate).', url: 'https://mmsky.mp.gov.in', for: ['12th', 'iti', 'diploma', 'ug', 'pg'] },
  { name: 'PM Internship Scheme', tag: 'GoI', desc: '12-month internships in top companies with monthly assistance for youth aged 21–24 not in full-time education or employment.', url: 'https://pminternship.mca.gov.in', for: ['12th', 'iti', 'diploma', 'ug'] },
  { name: 'National Apprenticeship Promotion Scheme', tag: 'GoI', desc: 'Stipend support for apprentices in industry, including ITI and diploma holders.', url: 'https://www.apprenticeshipindia.gov.in', for: ['10th', '12th', 'iti', 'diploma', 'ug'] },
  { name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)', tag: 'GoI', desc: 'Free short-term skill training & certification with placement support.', url: 'https://www.pmkvyofficial.org', for: ['10th', '12th', 'iti', 'diploma', 'ug'] },
  { name: 'Mukhyamantri Medhavi Vidyarthi Yojana', tag: 'MP Govt', desc: 'Fee support for meritorious MP students pursuing higher education.', url: 'https://scholarshipportal.mp.nic.in', for: ['12th', 'ug'] },
  { name: 'PMEGP / Mudra Loans', tag: 'GoI', desc: 'Credit-linked subsidy and collateral-free loans to start your own enterprise.', url: 'https://www.kviconline.gov.in/pmegpeportal', for: ['10th', '12th', 'iti', 'diploma', 'ug', 'pg'] },
  { name: 'SWAYAM & NPTEL', tag: 'GoI', desc: 'Free online courses from IITs/IIMs with credit transfer and certificates.', url: 'https://swayam.gov.in', for: ['12th', 'diploma', 'ug', 'pg'] },
];

export const MP_DISTRICTS = [
  'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur',
  'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Indore',
  'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Maihar', 'Mandla', 'Mandsaur', 'Mauganj', 'Morena',
  'Narmadapuram', 'Narsinghpur', 'Neemuch', 'Niwari', 'Pandhurna', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa',
  'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli',
  'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha', 'Other (outside MP)',
];

export const EDUCATION_LEVELS = [
  { id: '10th', label: '10th Pass' },
  { id: '12th', label: '12th Pass' },
  { id: 'iti', label: 'ITI' },
  { id: 'diploma', label: 'Diploma / Polytechnic' },
  { id: 'ug', label: 'Undergraduate (B.Tech / B.Sc / B.Com / BA …)' },
  { id: 'pg', label: 'Postgraduate (M.Tech / MBA / MCA / M.Sc …)' },
];

export const STREAMS = [
  { id: 'engineering', label: 'Engineering / Computer Applications' },
  { id: 'science', label: 'Science' },
  { id: 'commerce', label: 'Commerce / Management' },
  { id: 'arts', label: 'Arts / Humanities' },
  { id: 'diploma', label: 'Polytechnic / Technical' },
  { id: 'iti', label: 'ITI Trade' },
];
