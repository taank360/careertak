import { CAREERS, careerById } from '../data/careers.js';
import { SCHEMES } from '../data/opportunities.js';
import { SKILLS } from '../data/skills.js';
import { computeReadiness, skillGap, recommendCareers, nextActions } from './readiness.js';

const HINGLISH = /\b(kya|kaise|kaisa|mujhe|mera|meri|naukri|kaam|batao|chahiye|karu|karun|kar|hai|hain|nahi|sarkari|padhai|kitna|kaun|konsa|salah)\b/i;
export const isHindi = (s) => /[ऀ-ॿ]/.test(s) || HINGLISH.test(s);

const has = (s, ...words) => words.some((w) => s.includes(w));

function findCareer(msg) {
  const m = msg.toLowerCase();
  const alias = {
    'software-developer': ['software', 'developer', 'programmer', 'coder', 'सॉफ्टवेयर'],
    'web-developer': ['web', 'frontend', 'full stack', 'fullstack'],
    'data-analyst': ['data analyst', 'data analytics', 'analyst', 'डेटा'],
    'ai-ml-engineer': ['ai ', 'ml', 'machine learning', 'artificial intelligence', 'एआई'],
    'cybersecurity-analyst': ['cyber', 'security', 'hacking'],
    'ui-ux-designer': ['ui', 'ux', 'designer', 'design'],
    'digital-marketer': ['marketing', 'seo', 'social media', 'मार्केटिंग'],
    accountant: ['account', 'tally', 'gst', 'ca ', 'लेखा'],
    'banking-associate': ['bank', 'ibps', 'sbi', 'बैंक'],
    'govt-officer': ['mppsc', 'upsc', 'ssc', 'government job', 'sarkari', 'सरकारी', 'civil service', 'ias'],
    teacher: ['teacher', 'teaching', 'tet', 'शिक्षक', 'teach'],
    'sales-bde': ['sales', 'business development', 'bde'],
    'hr-executive': ['hr', 'human resource'],
    'production-engineer': ['mechanical', 'production', 'manufacturing'],
    electrician: ['electrician', 'solar', 'iti', 'wiring'],
    'agri-specialist': ['agri', 'farming', 'kheti', 'कृषि', 'agriculture'],
    'healthcare-assistant': ['nurse', 'nursing', 'hospital', 'health'],
    entrepreneur: ['startup', 'business', 'entrepreneur', 'apna kaam', 'व्यापार'],
  };
  for (const [id, keys] of Object.entries(alias)) if (keys.some((k) => m.includes(k))) return careerById(id);
  return CAREERS.find((c) => m.includes(c.title.toLowerCase()));
}

/**
 * Offline rule-based career counsellor. Uses the student's live data so answers are personal.
 * Returns markdown-lite text (supports **bold** and "- " bullets).
 */
export function localCounselor(message, state) {
  const msg = message.toLowerCase().trim();
  const hi = isHindi(message) || state.settings?.lang === 'hi';
  const name = state.profile?.name?.split(' ')[0] || (hi ? 'दोस्त' : 'there');
  const r = computeReadiness(state);
  const target = careerById(state.profile?.targetRole);
  const asked = findCareer(msg);

  if (/^(hi|hello|hey|namaste|नमस्ते|hii+|good (morning|evening))\b/.test(msg)) {
    return hi
      ? `नमस्ते ${name}! 🙏 मैं आपका AI करियर कोच हूँ। आपका अभी का Readiness Score **${r.score}/100** है। आप मुझसे पूछ सकते हैं:\n- मुझे आगे क्या करना चाहिए?\n- मेरे लिए कौन सा करियर सही है?\n- रिज़्यूमे / इंटरव्यू टिप्स\n- सरकारी योजनाएँ और इंटर्नशिप`
      : `Hi ${name}! 👋 I'm your AI Career Coach. Your current readiness score is **${r.score}/100** (${r.band.label}). Ask me things like:\n- What should I do next?\n- Which career suits me?\n- How do I improve my resume?\n- Interview tips for my target role\n- Government schemes & internships in MP`;
  }

  if (has(msg, 'score', 'readiness', 'where do i stand', 'स्कोर', 'kitna ready', 'how ready')) {
    const measured = r.dims.filter((d) => d.value != null);
    const weakest = [...measured].sort((a, b) => a.value - b.value).slice(0, 2);
    return (hi ? `आपका Readiness Score **${r.score}/100** है (${r.band.hi}). यह ${r.coverage}% आकलन पर आधारित है।\n` : `Your readiness score is **${r.score}/100** — ${r.band.label} ${r.band.emoji}. It is based on ${r.coverage}% of the full assessment.\n`)
      + measured.map((d) => `- ${hi ? d.hi : d.label}: ${d.value}`).join('\n')
      + (weakest.length ? (hi ? `\n\nसबसे पहले **${weakest.map((d) => d.hi).join(' और ')}** पर काम करें।` : `\n\nFocus first on **${weakest.map((d) => d.label).join(' and ')}** — that will move your score the most.`) : '')
      + (r.coverage < 100 ? (hi ? '\n\nबाकी टेस्ट पूरे करें ताकि स्कोर और सटीक हो।' : '\n\nComplete the remaining assessments to make the score more accurate.') : '');
  }

  if (has(msg, 'next', 'what should i do', 'aage kya', 'kya karu', 'क्या करूँ', 'आगे', 'plan', 'start')) {
    const acts = nextActions(state).slice(0, 4);
    return (hi ? `${name}, आपके अगले कदम:\n` : `Here's your personalised next-step plan, ${name}:\n`) + acts.map((a, i) => `${i + 1}. **${a.title}** — ${a.detail}`).join('\n')
      + (hi ? '\n\nरोज़ 1–2 घंटे लगातार काम करें — 12 हफ़्तों में बड़ा फ़र्क दिखेगा। 💪' : '\n\nConsistency beats intensity — 1–2 focused hours a day for 12 weeks makes a huge difference. 💪');
  }

  if (has(msg, 'which career', 'suit', 'best career', 'career option', 'कौन सा करियर', 'konsa career', 'career choose', 'confused', 'not sure')) {
    const recs = recommendCareers(state, 3);
    return (hi ? 'आपकी रुचि, कौशल और स्ट्रीम के आधार पर टॉप करियर:\n' : 'Based on your interests, skills and stream, your top matches are:\n')
      + recs.map((c) => `- ${c.icon} **${hi ? c.hi : c.title}** — ${c.fit}% fit · ₹${c.salary[0]}–${c.salary[1]} LPA · demand ${c.demand}`).join('\n')
      + (state.tests?.interest ? '' : hi ? '\n\nऔर सटीक सुझाव के लिए **Career Interest Profiler** टेस्ट दें।' : '\n\nTake the **Career Interest Profiler** for more accurate matches.');
  }

  if (has(msg, 'gap', 'skill', 'learn', 'kya seekh', 'सीख', 'course', 'improve')) {
    const c = asked || target;
    if (c) {
      const gaps = skillGap(c.id, state).filter((g) => g.status !== 'strong').slice(0, 4);
      return (hi ? `**${c.hi}** के लिए आपकी मुख्य स्किल गैप:\n` : `For **${c.title}**, your key skill gaps are:\n`)
        + (gaps.length ? gaps.map((g) => `- ${g.name}: ${g.current}/5 → ${g.required}/5`).join('\n') : hi ? '- बहुत बढ़िया! कोई बड़ा गैप नहीं।' : '- Great news — no major gaps!')
        + (hi ? '\n\nमुफ़्त कोर्स:\n' : '\n\nFree courses to start with:\n') + c.courses.slice(0, 3).map((k) => `- ${k.title} (${k.provider})`).join('\n');
    }
  }

  if (has(msg, 'resume', 'cv', 'रिज़्यूमे', 'biodata')) {
    const s = state.resume?.analysis;
    return (hi ? 'रिज़्यूमे टिप्स:\n' : `Resume tips${s ? ` (your current score: **${s.score}/100**)` : ''}:\n`)
      + (s?.suggestions?.length ? s.suggestions.slice(0, 4).map((x) => `- ${x}`).join('\n') : [
        '- Keep it to 1 page with a clear 2–3 line summary for your target role.',
        '- Start every bullet with an action verb: Built, Led, Analysed, Improved.',
        '- Quantify impact: “Reduced report time by 30%”, “Taught 40 students”.',
        '- Add a Skills section with keywords from the job description.',
        '- Include 2–3 projects with links (GitHub / Drive / portfolio).',
      ].join('\n'))
      + (hi ? '\n\nResume टैब में जाकर AI से स्कोर करवाएँ।' : '\n\nUse the **Resume** tab to build one or get an instant ATS score.');
  }

  if (has(msg, 'interview', 'इंटरव्यू', 'hr round', 'tell me about yourself')) {
    return hi
      ? 'इंटरव्यू टिप्स:\n- “Tell me about yourself” — वर्तमान → अतीत → भविष्य (60–90 सेकंड)\n- Behavioural सवालों में **STAR** तरीका: Situation, Task, Action, Result\n- कंपनी के बारे में पहले से रिसर्च करें\n- आँख मिलाकर, धीरे और साफ़ बोलें\n- अंत में 1–2 सवाल ज़रूर पूछें\n\n**Mock Interview** में अभ्यास करें — AI तुरंत फ़ीडबैक देगा।'
      : `Interview tips${target ? ` for ${target.title}` : ''}:\n- “Tell me about yourself”: Present → Past → Future in 60–90 seconds.\n- Behavioural questions: use **STAR** (Situation, Task, Action, Result).\n- Research the company’s product and values beforehand.\n- For technical questions: explain the concept, then give an example.\n- Close by asking 1–2 thoughtful questions.\n\nPractise in **Mock Interview** — you can answer by voice and get instant AI feedback.`;
  }

  if (has(msg, 'scheme', 'yojana', 'योजना', 'scholarship', 'stipend', 'government help', 'internship scheme', 'seekho')) {
    const edu = state.profile?.education;
    const list = SCHEMES.filter((s) => !edu || s.for.includes(edu)).slice(0, 4);
    return (hi ? 'आपके लिए उपयोगी योजनाएँ:\n' : 'Schemes you may be eligible for:\n') + list.map((s) => `- **${s.name}** (${s.tag}) — ${s.desc}`).join('\n')
      + (hi ? '\n\nपात्रता आधिकारिक पोर्टल पर ज़रूर जाँचें।' : '\n\nAlways verify eligibility on the official portal (links in the Jobs → Schemes tab).');
  }

  if (has(msg, 'salary', 'package', 'pay', 'lpa', 'सैलरी', 'kitna milega')) {
    const c = asked || target;
    if (c) return hi ? `**${c.hi}** में शुरुआती वेतन लगभग ₹${c.salary[0]}–${c.salary[1]} LPA (टियर-2 शहर)। डिमांड: ${c.demand}, ग्रोथ ~${c.growth}%।` : `Entry-level **${c.title}** roles typically pay ₹${c.salary[0]}–${c.salary[1]} LPA in Tier-2 cities like Indore/Bhopal. Demand: ${c.demand}, projected growth ~${c.growth}%. Skills, projects and communication can push you to the top of that range.`;
  }

  if (asked) {
    return `${asked.icon} **${hi ? asked.hi : asked.title}**\n${asked.about}\n\n- ${hi ? 'वेतन' : 'Salary'}: ₹${asked.salary[0]}–${asked.salary[1]} LPA\n- ${hi ? 'मांग' : 'Demand'}: ${asked.demand}\n- ${hi ? 'मुख्य कौशल' : 'Key skills'}: ${asked.skills.slice(0, 5).map(([id]) => SKILLS[id]?.name || id).join(', ')}\n- ${hi ? 'प्रोजेक्ट आइडिया' : 'Starter project'}: ${asked.projects[0]}\n\n${hi ? 'क्या इसे अपना लक्ष्य बनाना चाहेंगे? Explore में “Set as goal” दबाएँ।' : 'Want to make this your goal? Tap “Set as goal” in Explore Careers.'}`;
  }

  if (has(msg, 'stress', 'anxious', 'depressed', 'fail', 'demotivat', 'give up', 'tension', 'डर', 'परेशान')) {
    return hi
      ? 'चिंता होना स्वाभाविक है — आप अकेले नहीं हैं। 💙\n- बड़े लक्ष्य को छोटे रोज़ के कामों में बाँटें\n- दूसरों से तुलना न करें, अपनी प्रगति देखें\n- पर्याप्त नींद और व्यायाम करें\n- ज़रूरत हो तो Tele-MANAS हेल्पलाइन **14416** पर मुफ़्त बात करें।'
      : 'It’s completely normal to feel this way — you’re not alone. 💙\n- Break big goals into small daily tasks (your roadmap does this).\n- Compare yourself only with who you were last month.\n- Sleep, move, and take breaks — they improve learning.\n- If it feels heavy, talk to someone. Tele-MANAS offers free, confidential support at **14416**.';
  }

  if (has(msg, 'thank', 'thanks', 'धन्यवाद', 'shukriya')) return hi ? 'आपका स्वागत है! 🙌 आगे बढ़ते रहिए।' : 'You’re welcome! 🙌 Keep going — every step counts.';

  return hi
    ? `मैं इसमें मदद कर सकता हूँ! आप पूछ सकते हैं: “आगे क्या करूँ?”, “मेरे लिए कौन सा करियर सही है?”, “रिज़्यूमे टिप्स”, “सरकारी योजनाएँ”। आपका अभी का स्कोर ${r.score}/100 है।`
    : `I can help with that! I'm best at: your readiness score, next steps, career choices, skill gaps, resume & interview tips, salaries and government schemes. Try asking “What should I do next?”${target ? ` or “What skills do I need for ${target.title}?”` : ''}`;
}
