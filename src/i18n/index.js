// UI strings. Content-heavy data (questions, course names) stays in English;
// career titles and key labels carry Hindi translations in the data files.
const STRINGS = {
  en: {
    home: 'Home', assess: 'Assess', analysis: 'Analysis', careers: 'Careers', selfAnalysis: 'Self Analysis', future: 'Future Careers', roadmap: 'Roadmap', jobs: 'Jobs', coach: 'AI Coach', profile: 'Profile',
    hello: 'Hello', readiness: 'Career Readiness', readinessScore: 'Readiness Score', basedOn: 'Based on {n}% of assessments',
    nextSteps: 'Your next best steps', seeAll: 'See all', quickTools: 'Quick tools', skillGap: 'Skill Gap', resume: 'Resume',
    interview: 'Mock Interview', explore: 'Explore Careers', report: 'Report Card', institute: 'Placement Cell',
    topMatches: 'Top career matches for you', target: 'Target role', setGoal: 'Set as goal', yourGoal: 'Your goal',
    strengths: 'Strengths', focus: 'Focus areas', notAssessed: 'Not assessed yet', start: 'Start', retake: 'Retake',
    continue: 'Continue', back: 'Back', next: 'Next', finish: 'Finish', save: 'Save', cancel: 'Cancel', submit: 'Submit',
    askAnything: 'Ask anything about your career…', streak: 'day streak', level: 'Level', progress: 'Progress',
    assessments: 'Assessments', assessSub: 'Measure where you stand today', minutes: 'min', questions: 'questions',
    completed: 'Completed', score: 'Score', settings: 'Settings', language: 'Language', theme: 'Theme',
    generate: 'Generate my roadmap', regenerate: 'Regenerate', week: 'Week', offline: 'You are offline — the app still works.',
    install: 'Install app', installSub: 'Add CareerTak to your home screen', opportunities: 'Opportunities', schemes: 'Schemes',
    portals: 'Official portals', match: 'match', apply: 'Apply', saved: 'Saved', welcome: 'Welcome to CareerTak',
    tagline: 'Know where you stand today. Know what to do next.',
  },
  hi: {
    home: 'होम', assess: 'आकलन', analysis: 'विश्लेषण', careers: 'करियर', selfAnalysis: 'स्व-विश्लेषण', future: 'भविष्य के करियर', roadmap: 'रोडमैप', jobs: 'नौकरियाँ', coach: 'AI कोच', profile: 'प्रोफ़ाइल',
    hello: 'नमस्ते', readiness: 'करियर तैयारी', readinessScore: 'तैयारी स्कोर', basedOn: '{n}% आकलन पर आधारित',
    nextSteps: 'आपके अगले सबसे अच्छे कदम', seeAll: 'सभी देखें', quickTools: 'त्वरित टूल', skillGap: 'स्किल गैप', resume: 'रिज़्यूमे',
    interview: 'मॉक इंटरव्यू', explore: 'करियर खोजें', report: 'रिपोर्ट कार्ड', institute: 'प्लेसमेंट सेल',
    topMatches: 'आपके लिए टॉप करियर', target: 'लक्ष्य भूमिका', setGoal: 'लक्ष्य बनाएँ', yourGoal: 'आपका लक्ष्य',
    strengths: 'ताकत', focus: 'सुधार क्षेत्र', notAssessed: 'अभी आकलन नहीं हुआ', start: 'शुरू करें', retake: 'फिर से दें',
    continue: 'जारी रखें', back: 'पीछे', next: 'आगे', finish: 'समाप्त', save: 'सहेजें', cancel: 'रद्द करें', submit: 'जमा करें',
    askAnything: 'अपने करियर के बारे में कुछ भी पूछें…', streak: 'दिन लगातार', level: 'स्तर', progress: 'प्रगति',
    assessments: 'आकलन', assessSub: 'जानिए आज आप कहाँ खड़े हैं', minutes: 'मिनट', questions: 'प्रश्न',
    completed: 'पूर्ण', score: 'स्कोर', settings: 'सेटिंग्स', language: 'भाषा', theme: 'थीम',
    generate: 'मेरा रोडमैप बनाएँ', regenerate: 'फिर से बनाएँ', week: 'सप्ताह', offline: 'आप ऑफ़लाइन हैं — ऐप फिर भी काम करता है।',
    install: 'ऐप इंस्टॉल करें', installSub: 'CareerTak को होम स्क्रीन पर जोड़ें', opportunities: 'अवसर', schemes: 'योजनाएँ',
    portals: 'आधिकारिक पोर्टल', match: 'मैच', apply: 'आवेदन करें', saved: 'सहेजे गए', welcome: 'CareerTak में आपका स्वागत है',
    tagline: 'जानिए आज आप कहाँ हैं। जानिए आगे क्या करना है।',
  },
};

export function makeT(lang) {
  const dict = STRINGS[lang] || STRINGS.en;
  return (key, vars) => {
    let s = dict[key] ?? STRINGS.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
    return s;
  };
}
