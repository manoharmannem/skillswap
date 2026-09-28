const normalize = (value) =>
  String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

const COURSE_OVERVIEWS = {
  c: "C is a procedural programming language that teaches memory, control flow, functions, arrays, pointers, and structured problem solving.",
  "c++": "C++ builds on C with classes, objects, templates, the standard library, and modern programming techniques.",
  java: "Java teaches object-oriented programming, strong types, collections, exceptions, and application design on the JVM.",
  python: "Python uses readable syntax and is widely used for automation, web development, data work, scripting, and AI.",
  javascript: "JavaScript brings programming to the web and is used for browser interfaces, servers, APIs, and full-stack applications.",
  html: "HTML provides the semantic structure of web pages and gives browsers and assistive technologies meaningful document information.",
  css: "CSS controls presentation, layout, spacing, typography, visual hierarchy, and responsive behavior.",
  react: "React builds interfaces from reusable components whose UI changes predictably as state and data change.",
  sql: "SQL is used to retrieve, relate, filter, aggregate, and transform structured data in relational databases.",
  excel: "Excel supports practical data organization, formulas, analysis, charts, and repeatable reporting workflows.",
  "ui/ux": "UI/UX combines visual interface design with user-centered problem solving, information architecture, and interaction design.",
  figma: "Figma is a collaborative interface design tool used for wireframes, components, prototypes, and design systems.",
  "visual design": "Visual design teaches composition, hierarchy, typography, spacing, color, and consistency.",
  "public speaking": "Public speaking combines clear structure, confident delivery, storytelling, body language, and audience awareness.",
  "presentation skills": "Presentation skills help you turn information into a clear visual and spoken story for an audience.",
  storytelling: "Storytelling gives presentations and conversations a memorable structure using context, tension, examples, and resolution.",
  guitar: "Guitar learning combines posture, chord shapes, rhythm, strumming, transitions, and musical practice.",
  "guitar chords": "Guitar chords are learned through correct hand position, chord shapes, transitions, rhythm, and repeated practice.",
  "beginner spanish": "Beginner Spanish focuses on useful vocabulary, sentence patterns, pronunciation, listening, and everyday conversation.",
  conversation: "Conversation practice builds the ability to understand and respond naturally in common real-life situations.",
  grammar: "Spanish grammar gives you the patterns needed to form accurate sentences and understand why they work.",
  listening: "Listening practice trains your ear to recognize familiar Spanish words, phrases, pronunciation, and meaning.",
  "watercolour basics": "Watercolour fundamentals cover materials, brush control, water-to-paint balance, simple forms, and clean washes.",
  "colour & mixing": "Colour practice teaches mixing, value, temperature, saturation, and controlled palettes.",
  techniques: "Watercolour techniques include wet-on-wet, wet-on-dry, glazing, lifting, edges, and texture.",
  composition: "Composition helps arrange shapes, values, focal points, and negative space into a readable painting."
};

const TOPIC_SETS = {
  c: {
    fundamentals: ["Variables and data types", "Input and output", "Operators and expressions", "Conditions and loops", "Your first C program"],
    functions: ["Functions and parameters", "Scope and lifetime", "Arrays and strings", "Pointers introduction", "Build reusable C functions"],
    data: ["Arrays in C", "Strings and character arrays", "Structures", "Pointers and arrays", "Dynamic memory basics"],
    projects: ["Problem decomposition", "File organization", "Debugging C programs", "Building a menu program", "Complete beginner C project"],
    advanced: ["Pointers in depth", "Memory management", "Function pointers", "Modular programming", "Project review"]
  },
  "c++": {
    fundamentals: ["Variables and types", "Input and output", "Conditions and loops", "Functions", "Your first C++ program"],
    functions: ["References and parameters", "Classes and objects", "Constructors", "Encapsulation", "Build reusable classes"],
    data: ["Arrays and vectors", "Strings", "Maps and sets", "Iterators", "Algorithms from the standard library"],
    projects: ["Project structure", "File input and output", "Error handling", "Building a console application", "Complete beginner C++ project"],
    advanced: ["Inheritance", "Polymorphism", "Templates", "Smart pointers", "Modern C++ review"]
  },
  java: {
    fundamentals: ["Variables and data types", "Input and output", "Conditions and loops", "Methods", "Your first Java program"],
    functions: ["Classes and objects", "Constructors", "Encapsulation", "Inheritance basics", "Interfaces"],
    data: ["Arrays", "ArrayList", "HashMap", "Sets and generics", "Collections practice"],
    projects: ["Project structure", "Exceptions", "File handling", "Building a console application", "Complete beginner Java project"],
    advanced: ["Streams", "Lambdas", "Threads overview", "Packages and architecture", "Java project review"]
  },
  python: {
    fundamentals: ["Variables and data types", "Input and output", "Conditions and loops", "Functions", "Your first Python program"],
    functions: ["Function parameters", "Return values", "Scope", "Modules and imports", "Build reusable Python functions"],
    data: ["Lists and arrays", "Dictionaries", "Tuples and sets", "Strings and slicing", "Choosing the right data structure"],
    projects: ["Files and folders", "Exceptions", "Packages and virtual environments", "Build a small CLI project", "Complete beginner Python project"],
    advanced: ["Comprehensions", "Iterators and generators", "Object-oriented Python", "Testing basics", "Python project review"]
  },
  javascript: {
    fundamentals: ["Variables and data types", "Operators and expressions", "Conditions and loops", "Functions", "Your first JavaScript program"],
    functions: ["Arrays and objects", "Functions as values", "Scope and closures", "Modules", "Build reusable JavaScript functions"],
    data: ["Arrays", "Objects", "Destructuring and spread", "Map, filter and reduce", "Working with JSON"],
    projects: ["DOM basics", "Events", "Async JavaScript", "Fetch and APIs", "Build a browser project"],
    advanced: ["Promises", "Async and await", "Error handling", "Performance basics", "JavaScript project review"]
  },
  html: {
    fundamentals: ["Document structure", "Headings and text", "Links and navigation", "Images and media", "Your first webpage"],
    functions: ["Lists and tables", "Forms", "Semantic sections", "Accessible labels", "Build a structured page"],
    data: ["Page hierarchy", "Reusable content patterns", "Metadata", "Embedded content", "Organizing a multi-page site"],
    projects: ["Responsive page structure", "Landing page structure", "Portfolio structure", "Accessible form page", "Complete HTML project"],
    advanced: ["Accessibility review", "SEO-friendly structure", "Performance-friendly markup", "Semantic refactoring", "HTML project review"]
  },
  css: {
    fundamentals: ["Selectors", "Box model", "Colors and typography", "Spacing", "Your first styled page"],
    functions: ["Flexbox", "Grid", "Positioning", "Pseudo-classes", "Build reusable layout patterns"],
    data: ["Responsive units", "Media queries", "Container patterns", "Cards and navigation", "Responsive component design"],
    projects: ["Designing a landing page", "Building a dashboard layout", "Responsive forms", "Component states", "Complete CSS project"],
    advanced: ["Cascade layers", "Specificity management", "Transitions", "Animation basics", "CSS architecture review"]
  },
  react: {
    fundamentals: ["Components and JSX", "Props", "State", "Events", "Your first React feature"],
    functions: ["Reusable components", "Conditional rendering", "Lists and keys", "Forms", "Component composition"],
    data: ["State structure", "Derived data", "Context", "Custom hooks", "Managing shared data"],
    projects: ["Fetching API data", "Loading and error states", "Authentication UI", "Routing", "Build a complete React feature"],
    advanced: ["Effects", "Performance", "Memoization", "Component architecture", "React project review"]
  },
  sql: {
    fundamentals: ["Tables and columns", "SELECT", "WHERE", "ORDER BY", "Your first SQL report"],
    functions: ["GROUP BY", "Aggregate functions", "HAVING", "Aliases", "Build grouped reports"],
    data: ["Primary and foreign keys", "INNER JOIN", "LEFT JOIN", "Many-table queries", "Join debugging"],
    projects: ["Subqueries", "Common table expressions", "Window functions", "Data quality checks", "Complete SQL reporting project"],
    advanced: ["Query performance", "Indexes", "Transactions", "Views", "SQL project review"]
  },
  excel: {
    fundamentals: ["Cells and ranges", "Basic formulas", "Relative and absolute references", "Sorting and filtering", "Your first worksheet"],
    functions: ["IF and logical formulas", "Lookup formulas", "Text functions", "Date functions", "Build a useful calculator"],
    data: ["Tables", "Pivot tables", "Charts", "Conditional formatting", "Cleaning messy data"],
    projects: ["Sales report", "Budget tracker", "Dashboard basics", "Data validation", "Complete Excel project"],
    advanced: ["Advanced lookups", "Dynamic arrays", "Power Query concepts", "Model design", "Excel project review"]
  },
  "ui/ux": {
    fundamentals: ["What UI and UX mean", "User problems", "User flows", "Wireframes", "Your first screen"],
    functions: ["Information architecture", "Navigation", "Forms", "Feedback and states", "Designing reusable patterns"],
    data: ["Typography hierarchy", "Spacing systems", "Color and contrast", "Components", "Responsive interface design"],
    projects: ["Research notes", "Low-fidelity prototype", "High-fidelity screen", "Usability review", "Complete app flow"],
    advanced: ["Design systems", "Accessibility", "UX writing", "Design handoff", "Portfolio case study review"]
  },
  figma: {
    fundamentals: ["Figma workspace", "Frames and layers", "Shapes and text", "Auto layout", "Your first screen"],
    functions: ["Components", "Variants", "Styles", "Reusable patterns", "Build a small component library"],
    data: ["Wireframes", "Prototypes", "Responsive layouts", "Design tokens", "Organizing a design file"],
    projects: ["Mobile app flow", "Web page design", "Prototype interactions", "Developer handoff", "Complete Figma project"],
    advanced: ["Design systems", "Variables", "Accessibility checks", "Collaboration workflow", "Figma project review"]
  },
  "visual design": {
    fundamentals: ["Visual hierarchy", "Alignment", "Contrast", "Repetition", "Your first composition"],
    functions: ["Typography", "Color", "Spacing", "Grid systems", "Build a visual style"],
    data: ["Cards and surfaces", "Buttons and states", "Icons", "Images", "Responsive visual systems"],
    projects: ["Poster composition", "Landing page", "Social graphic", "Brand-style page", "Complete visual design project"],
    advanced: ["Art direction", "Consistency", "Accessibility", "Visual critique", "Design review"]
  },
  "public speaking": {
    fundamentals: ["Purpose and audience", "Speech structure", "Strong openings", "Clear explanations", "Deliver a one-minute talk"],
    functions: ["Voice and pace", "Body language", "Eye contact", "Pauses", "Practice confident delivery"],
    data: ["Storytelling", "Examples and analogies", "Slides", "Transitions", "Making ideas memorable"],
    projects: ["Five-minute presentation", "Handling questions", "Difficult audience moments", "Online presentation", "Complete presentation"],
    advanced: ["Persuasion", "Executive communication", "Impromptu speaking", "Feedback loops", "Speaker self-review"]
  },
  "presentation skills": {
    fundamentals: ["Define the message", "Know your audience", "Presentation structure", "Opening slides", "First practice"],
    functions: ["Slide hierarchy", "Speaking notes", "Visual examples", "Transitions", "Rehearsal"],
    data: ["Charts and data stories", "Minimal slides", "Audience interaction", "Q&A", "Remote presenting"],
    projects: ["Five-slide presentation", "Product presentation", "Teaching presentation", "Business update", "Complete presentation"],
    advanced: ["Executive storytelling", "Persuasive decks", "Handling objections", "Live demos", "Presentation review"]
  },
  storytelling: {
    fundamentals: ["What makes a story", "Audience and purpose", "Beginning middle end", "Characters and context", "Tell a one-minute story"],
    functions: ["Specific details", "Emotion", "Dialogue", "Pacing", "Strong endings"],
    data: ["Story from experience", "Story from data", "Business storytelling", "Teaching stories", "Finding the central message"],
    projects: ["Personal story", "Three-minute story", "Presentation story", "Case study", "Complete storytelling project"],
    advanced: ["Subtext", "Audience adaptation", "Editing", "Delivery", "Story review"]
  },
  guitar: {
    fundamentals: ["Guitar parts and posture", "Tuning", "Reading chord diagrams", "First open chord", "First chord exercise"],
    functions: ["Common open chords", "Chord changes", "Strumming basics", "Rhythm counting", "Practice a progression"],
    data: ["Major and minor chords", "Seventh chords", "Chord families", "Progressions", "Play a four-chord song"],
    projects: ["Song structure", "Strumming patterns", "Practice routine", "Playing with a metronome", "Complete beginner song"],
    advanced: ["Barre chord introduction", "Rhythm variations", "Chord embellishments", "Playing cleanly", "Guitar practice review"]
  },
  "guitar chords": {
    fundamentals: ["Guitar posture", "Reading chord diagrams", "Open E and A chords", "Open D and G chords", "First chord exercise"],
    functions: ["Chord transitions", "Strumming basics", "Rhythm counting", "Common progressions", "Play a four-chord progression"],
    data: ["Major chords", "Minor chords", "Seventh chords", "Chord families", "Choosing chords for a song"],
    projects: ["Song practice", "Metronome practice", "Clean chord changes", "Strumming patterns", "Complete chord song"],
    advanced: ["Barre chord basics", "Movable chord shapes", "Chord embellishments", "Rhythm variations", "Chord review"]
  },
  "beginner spanish": {
    fundamentals: ["Greetings", "Introducing yourself", "Numbers", "Days and time", "Build your first sentences"],
    functions: ["Common verbs", "Question words", "Articles and gender", "Everyday vocabulary", "Simple conversations"],
    data: ["Present tense", "Adjectives", "Possessives", "Useful connectors", "Describe your day"],
    projects: ["Restaurant conversation", "Shopping conversation", "Travel conversation", "Self-introduction", "Complete beginner dialogue"],
    advanced: ["Listening habits", "Pronunciation review", "Conversation repair", "Common mistakes", "Spanish learning review"]
  },
  conversation: {
    fundamentals: ["Greetings", "Introductions", "Asking questions", "Answering naturally", "First conversation"],
    functions: ["Useful verbs", "Opinions", "Requests", "Clarifying meaning", "Keeping a conversation going"],
    data: ["Past experiences", "Plans", "Descriptions", "Comparisons", "Longer answers"],
    projects: ["Restaurant dialogue", "Travel dialogue", "Work conversation", "Social conversation", "Complete conversation practice"],
    advanced: ["Listening for context", "Natural connectors", "Repair strategies", "Pronunciation", "Conversation review"]
  },
  grammar: {
    fundamentals: ["Sentence structure", "Nouns and articles", "Pronouns", "Present tense", "Build basic sentences"],
    functions: ["Adjectives", "Questions", "Negatives", "Possessives", "Grammar drills"],
    data: ["Past tense", "Future forms", "Connectors", "Comparisons", "Longer sentences"],
    projects: ["Describe a day", "Tell a short story", "Write a message", "Translate meaningfully", "Complete grammar practice"],
    advanced: ["Common irregular verbs", "Agreement", "Prepositions", "Natural word order", "Grammar review"]
  },
  listening: {
    fundamentals: ["Spanish sounds", "Recognizing familiar words", "Numbers and dates", "Greetings in speech", "First listening routine"],
    functions: ["Listening for keywords", "Question words", "Common phrases", "Connected speech", "Short dialogues"],
    data: ["Main idea", "Details", "Speaker intent", "Context clues", "Longer conversations"],
    projects: ["Restaurant audio practice", "Travel audio practice", "Daily-life audio", "Short story listening", "Complete listening routine"],
    advanced: ["Unknown words", "Fast speech", "Accent awareness", "Shadowing", "Listening review"]
  },
  "watercolour basics": {
    fundamentals: ["Materials", "Brush control", "Water and paint balance", "Flat washes", "Paint your first simple shape"],
    functions: ["Wet-on-dry", "Wet-on-wet", "Layering", "Edges", "Simple object study"],
    data: ["Values", "Light and shadow", "Colour temperature", "Texture", "Painting a small still life"],
    projects: ["Sky study", "Leaf study", "Simple landscape", "Small object painting", "Complete beginner painting"],
    advanced: ["Controlled blooms", "Glazing", "Lifting", "Corrections", "Watercolour review"]
  },
  "colour & mixing": {
    fundamentals: ["Primary colours", "Secondary colours", "Warm and cool colours", "Value", "First colour chart"],
    functions: ["Mixing clean colours", "Neutral colours", "Greens", "Skin and earth tones", "Controlled palette"],
    data: ["Saturation", "Complementary colours", "Colour temperature", "Limited palettes", "Colour matching"],
    projects: ["Colour study", "Fruit study", "Landscape palette", "Still-life palette", "Complete colour project"],
    advanced: ["Subtle neutrals", "Atmospheric colour", "Colour harmony", "Avoiding muddy mixes", "Colour review"]
  },
  techniques: {
    fundamentals: ["Wet-on-wet", "Wet-on-dry", "Flat washes", "Graded washes", "Technique practice sheet"],
    functions: ["Glazing", "Lifting", "Dry brush", "Soft edges", "Texture practice"],
    data: ["Layering", "Negative painting", "Brush variety", "Water control", "Combining techniques"],
    projects: ["Cloud study", "Leaf study", "Wood texture", "Simple landscape", "Complete technique painting"],
    advanced: ["Edge control", "Corrections", "Preserving highlights", "Complex layers", "Technique review"]
  },
  composition: {
    fundamentals: ["Focal point", "Shapes and balance", "Value grouping", "Negative space", "First thumbnail studies"],
    functions: ["Rule of thirds", "Leading lines", "Cropping", "Scale", "Building a clear scene"],
    data: ["Light direction", "Foreground middle ground background", "Depth", "Simplification", "Visual storytelling"],
    projects: ["Landscape thumbnail", "Still-life composition", "Floral composition", "Small painting plan", "Complete composition"],
    advanced: ["Mood", "Complex balance", "Visual rhythm", "Editing a composition", "Composition review"]
  }
};

const MODULES = [
  ["foundations", "Module 1 — Foundations", "Learn the essential ideas before moving to more complex work."],
  ["core", "Module 2 — Core Skills", "Build the main skills through guided examples and repetition."],
  ["structures", "Module 3 — Working with Real Problems", "Connect concepts and learn how to solve practical tasks."],
  ["projects", "Module 4 — Practical Projects", "Apply the skills by building or performing complete small projects."],
  ["advanced", "Module 5 — Next Level", "Strengthen your understanding and prepare for independent practice."]
];

function genericTopics(category, moduleIndex) {
  const name = String(category || "this skill");
  const sets = [
    [`What is ${name}?`, `Key ideas in ${name}`, `Common terms in ${name}`, `How to practise ${name}`, `First ${name} exercise`],
    [`Core technique: ${name}`, `Step-by-step practice in ${name}`, `Common mistakes in ${name}`, `Improve your ${name} workflow`, `Guided ${name} exercise`],
    [`Solving a ${name} problem`, `Choosing the right approach`, `Checking your result`, `Improving quality`, `Independent practice`],
    [`Plan a small ${name} project`, `Build or perform the first part`, `Build or perform the second part`, `Review and improve`, `Finish the project`],
    [`Intermediate ${name} technique`, `Deeper understanding`, `Efficiency and consistency`, `Troubleshooting`, `Final ${name} challenge`]
  ];
  return sets[moduleIndex];
}

export function lessonFor(skill, category, moduleTitle, topicTitle) {
  const key = normalize(category);
  const overview = COURSE_OVERVIEWS[key] || COURSE_OVERVIEWS[normalize(skill)] || `This lesson teaches a practical part of ${category || skill}.`;
  const isArray = /array|list|collection|vector/i.test(topicTitle);
  const subject = category || skill;

  const sections = [
    {
      heading: "1. Start with the idea",
      body: `${topicTitle} is a concept you should understand before trying to memorize syntax or steps. In ${subject}, the goal is to know what the concept does, why it exists, and when it is useful. ${overview}`
    },
    {
      heading: "2. Why does this matter?",
      body: `You will use ${topicTitle.toLowerCase()} whenever a task requires you to organize information, make a decision, create something, communicate clearly, or solve a problem. Learning the reason behind the technique makes it much easier to remember and adapt.`
    },
    {
      heading: "3. Learn it step by step",
      body: `First identify the input or starting situation. Next choose the concept that matches the problem. Then perform one small step at a time and check the result after each step. Finally, explain what happened in your own words. Do not move on just because the example looks familiar.`
    },
    {
      heading: "4. Example",
      body: isArray
        ? `Arrays or array-like collections store multiple related values so you can work with them as a group. Start with a small collection, access one value, change a value, add or remove a value when the language supports it, and then loop through the collection. The exact syntax depends on ${subject}.`
        : `Create a very small example of ${topicTitle.toLowerCase()}. Keep the example focused on one idea. Change one value or step and observe how the result changes. Then recreate the example without looking at the original.`
    },
    {
      heading: "5. Common beginner mistakes",
      body: `Common mistakes include trying to memorize without understanding, skipping the smallest example, changing several things at once, ignoring error messages or feedback, and moving to the next topic before you can explain the current one. When something fails, reduce the example until you can identify exactly which step caused the problem.`
    },
    {
      heading: "6. Guided practice",
      body: `Practice ${topicTitle.toLowerCase()} in three rounds. Round 1: copy a tiny example and explain every line or step. Round 2: rebuild it from memory with one change. Round 3: solve a new but related problem without looking at the lesson. Write down what you found difficult.`
    },
    {
      heading: "7. Check your understanding",
      body: `Before completing this lesson, answer these questions in your own words: What is ${topicTitle.toLowerCase()}? Why would you use it? What are the important steps? What mistake should you avoid? Can you create a small example without copying?`
    },
    {
      heading: "8. Mini challenge",
      body: `Create one small result using ${topicTitle.toLowerCase()}. Keep the task realistic and finishable in about 15–30 minutes. If you get stuck, return to the earlier sections, reduce the problem, and solve the smallest version first.`
    },
    {
      heading: "9. Lesson recap",
      body: `You have learned the purpose of ${topicTitle.toLowerCase()}, how to approach it step by step, how to practise it, and how to check your own understanding. The next lesson should build on this one rather than replace it.`
    }
  ];

  return {
    intro: `Welcome to ${topicTitle}. This is a complete lesson in ${moduleTitle} for ${category || skill}. Read from top to bottom, work through the example, complete the mini challenge, and only then mark the lesson complete.`,
    sections,
    example: isArray
      ? `// Practice example\nconst values = [10, 20, 30, 40];\nconsole.log(values[0]);\n\n// Change the values and practise accessing, updating,\n// adding, removing, or looping depending on your language.`
      : `// SkillSwap practice\n// Topic: ${topicTitle}\n// Write a small example here and explain each step in your own words.`
  };
}

export function buildLessonTopics(skill, category, moduleKey, moduleTitle) {
  const key = normalize(category);
  const set = TOPIC_SETS[key]?.[moduleKey];
  const moduleIndex = MODULES.findIndex(([id]) => id === moduleKey);
  const titles = set || genericTopics(category || skill, Math.max(0, moduleIndex));
  return titles.map((title, index) => ({
    id: `lesson-${normalize(category || skill).replace(/[^a-z0-9]+/g, "-")}-${moduleKey}-${index + 1}`,
    title,
    description: `Complete lesson: ${title}.`,
    lesson: lessonFor(skill, category, moduleTitle, title),
    completed: false
  }));
}
