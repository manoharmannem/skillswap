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

const COURSE_SOURCES = {
  c:[{title:"cppreference — C language reference",url:"https://en.cppreference.com/c/language"}],
  "c++":[{title:"cppreference — C++ language reference",url:"https://en.cppreference.com/cpp/language"}],
  java:[{title:"Dev.java — Java learning",url:"https://dev.java/learn/"}],
  python:[{title:"Python — The Python Tutorial",url:"https://docs.python.org/3/tutorial/"}],
  javascript:[{title:"MDN Web Docs — JavaScript",url:"https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting"}],
  html:[{title:"MDN Web Docs — HTML learning",url:"https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content"}],
  css:[{title:"MDN Web Docs — CSS",url:"https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics"}],
  react:[{title:"React — Passing Props",url:"https://react.dev/learn/passing-props-to-a-component"},{title:"React — State",url:"https://react.dev/learn/state-a-components-memory"},{title:"React — Managing State",url:"https://react.dev/learn/managing-state"}],
  sql:[{title:"PostgreSQL — SQL tutorial",url:"https://www.postgresql.org/docs/17/tutorial.html"}],
  excel:[{title:"Microsoft Support — Excel",url:"https://support.microsoft.com/en-us/excel/"}],
  "ui/ux":[{title:"Figma Learn",url:"https://help.figma.com/hc/en-us/"}],
  figma:[{title:"Figma Learn — Design for beginners",url:"https://help.figma.com/hc/en-us/sections/30880632542743-Figma-Design-for-beginners"}],
  "public speaking":[{title:"Toastmasters — Public Speaking Tips",url:"https://www.toastmasters.org/resources/public-speaking-tips"}],
  "presentation skills":[{title:"Toastmasters — Preparing a Speech",url:"https://www.toastmasters.org/resources/public-speaking-tips/preparing-a-speech"}],
  storytelling:[{title:"Toastmasters — Public Speaking Tips",url:"https://www.toastmasters.org/resources/public-speaking-tips"}],
  guitar:[{title:"Fender — Essential Beginner Chords",url:"https://www.fender.com/articles/chords/essential-beginner-chords-g-c-d"},{title:"Fender — Beginner Guitar Scales",url:"https://www.fender.com/articles/scales/5-essential-guitar-scales-for-beginners"}],
  "guitar chords":[{title:"Fender — Essential Beginner Chords",url:"https://www.fender.com/articles/chords/essential-beginner-chords-g-c-d"}],
  "beginner spanish":[{title:"Instituto Cervantes — Spanish A1",url:"https://nuevadelhi.cervantes.es/en/spanish_courses/students/spanish_general_courses/spanish_courses_level_a1.htm"}],
  conversation:[{title:"Instituto Cervantes — Spanish A1",url:"https://nuevadelhi.cervantes.es/en/spanish_courses/students/spanish_general_courses/spanish_courses_level_a1.htm"}],
  grammar:[{title:"Instituto Cervantes — Spanish A1",url:"https://nuevadelhi.cervantes.es/en/spanish_courses/students/spanish_general_courses/spanish_courses_level_a1.htm"}],
  listening:[{title:"Instituto Cervantes — Spanish A1",url:"https://nuevadelhi.cervantes.es/en/spanish_courses/students/spanish_general_courses/spanish_courses_level_a1.htm"}],
  "watercolour basics":[{title:"Royal Talens — Watercolour painting",url:"https://www.royaltalens.com/blogs/watercolour-paint/painting-flowers"}],
  "colour & mixing":[{title:"Royal Talens — Colour mixing chart",url:"https://www.royaltalens.com/blogs/creativity/colour-mixing-chart"}],
  techniques:[{title:"Royal Talens — Watercolour techniques",url:"https://www.royaltalens.com/blogs/watercolour-paint/painting-flowers"},{title:"Winsor & Newton — Wet-on-wet",url:"https://www.winsornewton.com/blogs/how-tos/tate-sargent-watercolour-set"}],
  composition:[{title:"Royal Talens — Watercolour guides",url:"https://www.royaltalens.com/blogs/watercolour-paint"}]
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

const DOMAIN_GUIDES = {
  c:{core:"Focus on variables, control flow, functions, arrays, pointers, structures, and memory. Practise with small console programs.",example:"int scores[3] = {80, 90, 75};\nint total = scores[0] + scores[1] + scores[2];\nprintf(\"%d\\n\", total);",mistakes:"Watch for uninitialized variables, array bounds, incorrect format specifiers, missing braces, and memory leaks."},
  "c++":{core:"Build from C-style fundamentals into classes, the standard library, templates, and modern resource-management patterns.",example:"std::vector<int> scores{80, 90, 75};\nint total = 0;\nfor (int score : scores) total += score;",mistakes:"Watch for lifetime errors, unnecessary raw ownership, accidental copies, and confusing inheritance with composition."},
  java:{core:"Connect syntax to object-oriented design, collections, exceptions, and reusable methods. Use small classes and test one behavior at a time.",example:"List<Integer> scores = List.of(80, 90, 75);\nint total = scores.stream().mapToInt(Integer::intValue).sum();",mistakes:"Watch for null values, oversized classes, weak exception handling, and poor collection choices."},
  python:{core:"Use readable Python syntax to practise variables, functions, collections, files, exceptions, modules, and automation.",example:"scores = [80, 90, 75]\naverage = sum(scores) / len(scores)\nprint(average)",mistakes:"Watch for mutable-default-argument traps, confusing strings with numbers, broad exception handling, and long functions."},
  javascript:{core:"Learn values, functions, objects, arrays, DOM events, asynchronous work, and APIs. Separate data from UI behavior.",example:"const scores = [80, 90, 75];\nconst average = scores.reduce((sum, score) => sum + score, 0) / scores.length;",mistakes:"Watch for accidental type coercion, async assumptions, unexpected mutation, and mixed responsibilities."},
  html:{core:"Use semantic HTML to describe document meaning and structure. Start with headings and landmarks, then links, media, forms, and accessible labels.",example:"<main>\\n  <h1>SkillSwap</h1>\\n  <p>Learn by practising.</p>\\n  <a href=\"/practice\">Start</a>\\n</main>",mistakes:"Avoid choosing elements only for appearance, missing form labels, vague links, and unnecessary div nesting."},
  css:{core:"Think of CSS as a system: selectors choose elements, the box model controls space, layout systems arrange content, and media queries adapt the design.",example:".card { display:grid; gap:1rem; padding:1rem; }\\n@media (max-width:700px){.card{grid-template-columns:1fr;}}",mistakes:"Avoid excessive !important, fixed widths that break on small screens, and duplicated styles."},
  react:{core:"React describes UI from data. Props pass information into components, state stores changing information, and shared state needs a clear owner.",example:"function Counter(){\\n const [count,setCount]=useState(0);\\n return <button onClick={()=>setCount(count+1)}>{count}</button>;\\n}",mistakes:"Avoid duplicated derived state, direct mutation, unnecessary global state, and effects used for ordinary rendering logic."},
  sql:{core:"Use SQL to ask structured questions of relational data. Start with SELECT and filtering, then aggregate, join, and validate results.",example:"SELECT department, AVG(score) AS average_score\\nFROM results\\nGROUP BY department\\nORDER BY average_score DESC;",mistakes:"Check join conditions, understand WHERE versus HAVING, and investigate unexpected duplicate rows."},
  excel:{core:"Build worksheets around clean tables, clear formulas, consistent references, and visible outputs. Practise formulas, lookups, tables, PivotTables, and charts.",example:"=IF(C2>=50,\"Pass\",\"Review\")\\n=XLOOKUP(E2,A:A,B:B,\"Not found\")",mistakes:"Watch for broken references, inconsistent types, hidden spaces, hard-coded values, and messy chart ranges."},
  "ui/ux":{core:"Begin with the user problem rather than decoration. Map the task, identify content, sketch the flow, then refine hierarchy, interaction, accessibility, and consistency.",example:"Task: book a meeting → choose skill → choose tutor → choose time → confirm → show success.",mistakes:"Avoid designing without a user goal, hiding important actions, over-decoration, and ignoring empty/loading/error states."},
  figma:{core:"Learn Figma by building real screens. Frames establish layout, auto layout responds to content, components create reusable UI, and prototypes connect interactions.",example:"Create a mobile card → add title → apply auto layout → make a component → create variants → prototype the tap state.",mistakes:"Avoid manually spacing repeated elements, inconsistent styles, and prototype links that do not match the user flow."},
  "visual design":{core:"Use hierarchy, alignment, contrast, repetition, proximity, typography, color, and whitespace to make information easy to scan.",example:"Create one poster with one dominant headline, one supporting message, one focal image, and one clear action.",mistakes:"Avoid too many fonts, weak contrast, inconsistent spacing, random alignment, and making everything loud."},
  "public speaking":{core:"Build a clear opening, main points, and summary for a specific audience. Rehearse aloud and use pacing, pauses, eye contact, and purposeful gestures.",example:"Opening → problem → three useful ideas → example → takeaway → call to action.",mistakes:"Avoid reading slides word-for-word, rushing, filling silence, and presenting without timing a rehearsal."},
  "presentation skills":{core:"Design the story before the slides. Keep one main message per visual, rehearse transitions, and prepare for questions.",example:"Slide 1 outcome → Slide 2 problem → Slide 3 evidence → Slide 4 solution → Slide 5 next step.",mistakes:"Avoid dense paragraphs, decorative slides, inconsistent terms, and weak context."},
  storytelling:{core:"Give the audience a reason to care, enough context, meaningful change or tension, and a clear ending.",example:"Before → challenge → decision → consequence → lesson. Replace generic statements with one concrete detail.",mistakes:"Avoid too much background, unrelated details, weak stakes, and endings that introduce a new idea."},
  guitar:{core:"Begin with posture and tuning, then open chords, clean changes, steady rhythm, and short musical pieces. Slow metronome practice builds reliable movement.",example:"Practise G → C → D: hold each chord, strum four slow beats, switch, then repeat.",mistakes:"Avoid pressing too hard, collapsing fingers, inconsistent rhythm, skipping tuning, and rushing tempo."},
  "guitar chords":{core:"Chord learning is shape, clean notes, transition speed, and rhythm. Start with accessible open chords such as G, C, and D.",example:"G → C → D. Form each chord, check strings, strum slowly, then practise the transition without stopping the beat.",mistakes:"Avoid memorizing shapes without checking sound, muting neighboring strings, squeezing too hard, and practising only at full speed."},
  "beginner spanish":{core:"Start with useful phrases, introductions, numbers, time, everyday verbs, and short sentences. Instituto Cervantes describes A1 around frequent expressions, simple phrases, introductions, and basic interaction.",example:"Hola. Me llamo Ana. Soy de India. Vivo en Hyderabad. ¿Cómo estás? — Estoy bien, gracias.",mistakes:"Avoid translating every sentence word-for-word, ignoring pronunciation, and memorizing isolated words without sentences."},
  conversation:{core:"Conversation practice is interactive: listen for meaning, answer, add one detail, and ask a related question. Use repair phrases when needed.",example:"¿De dónde eres? → Soy de India. Vivo en Hyderabad. ¿Y tú?",mistakes:"Avoid one-word answers, prepared monologues, ignoring the other speaker, and stopping when one word is unknown."},
  grammar:{core:"Grammar is a pattern system. Learn one pattern, see it in several sentences, change subject or time, then produce your own examples.",example:"Yo vivo en Hyderabad. Tú vives en Delhi. Ellos viven en Madrid.",mistakes:"Avoid memorizing tables without examples and practising only recognition instead of producing sentences."},
  listening:{core:"Build listening through repeated exposure at a manageable level: topic first, keywords second, details third. Replay short audio and shadow phrases.",example:"Listen once for the idea, again for names/places/numbers, then repeat one short sentence aloud.",mistakes:"Avoid trying to understand every word and using material far above your level."},
  "watercolour basics":{core:"Watercolour depends on water, pigment, paper, and drying time. Beginner guides emphasize transparent layers and preserving paper highlights.",example:"Paint a light wash, let it dry, then add a darker layer only where the form turns away from light.",mistakes:"Avoid too much pigment early, disturbing wet paper, covering every white area, and adding dark details too soon."},
  "colour & mixing":{core:"Record mixtures instead of guessing. Build a colour chart, vary water and pigment, compare warm/cool versions, and use limited palettes.",example:"Create a grid of colour pairs, mix controlled proportions, and record the result.",mistakes:"Avoid dirty water, too many pigments, judging only wet colour, and skipping value comparison."},
  techniques:{core:"Practise wet-on-wet, wet-on-dry, washes, glazing, lifting, dry brush, and edge control one at a time.",example:"Wet one square, add a transparent wash, and compare its edge with the same mark on dry paper.",mistakes:"Avoid changing paper, brush, pigment, and water simultaneously when diagnosing a technique."},
  composition:{core:"Composition arranges shapes, values, space, and focal points so the viewer knows where to look. Thumbnail sketches test structure before detail.",example:"Make three tiny landscape thumbnails and move the darkest value and focal point in each.",mistakes:"Avoid equal detail everywhere, ignoring negative space, accidental focal points, and starting with tiny details."}
};
function guideFor(category, skill) {
  const key = normalize(category);
  return DOMAIN_GUIDES[key] || {
    core:"Break " + (category || skill) + " into a small goal, practise the essential technique, review the result, and repeat with one controlled change.",
    example:"Choose one small " + (category || skill) + " activity, complete it once with guidance, then repeat it without looking.",
    mistakes:"Avoid skipping fundamentals, changing too many things at once, and moving ahead before you can explain and reproduce the basic technique."
  };
}
export function lessonFor(skill, category, moduleTitle, topicTitle) {
  const key=normalize(category), guide=guideFor(category,skill);
  const overview=COURSE_OVERVIEWS[key] || COURSE_OVERVIEWS[normalize(skill)] || ("This lesson teaches a practical part of " + (category || skill) + ".");
  return {
    intro:"Welcome to " + topicTitle + ". This complete lesson belongs to " + moduleTitle + " in " + (category || skill) + ". Read from beginning to end, practise the example, complete the mini challenge, and then mark the lesson complete.",
    sections:[
      {heading:"1. Start with the idea",body:topicTitle+" is a skill to understand and use, not just memorize. "+guide.core+" "+overview},
      {heading:"2. Why does this matter?",body:"This topic appears in real "+(category || skill)+" work because it helps you complete a task more reliably. Connect the idea to a practical result you can create, explain, or perform yourself."},
      {heading:"3. Learn it step by step",body:"Step 1 — identify the goal. Step 2 — choose the smallest example. Step 3 — perform one action at a time. Step 4 — inspect the result. Step 5 — change one variable and repeat. Step 6 — recreate the result without copying."},
      {heading:"4. Practical example",body:guide.example},
      {heading:"5. Common beginner mistakes",body:guide.mistakes},
      {heading:"6. Guided practice",body:"Round 1: follow the example and explain each step aloud. Round 2: rebuild it with one small change. Round 3: solve a related problem without looking. Record the difficult part and repeat it slowly."},
      {heading:"7. Check your understanding",body:"What is "+topicTitle.toLowerCase()+"? When would you use it? What are the key steps? What can go wrong? Can you reproduce the example without copying?"},
      {heading:"8. Mini challenge",body:"Spend about 15–30 minutes making one small result with "+topicTitle.toLowerCase()+". Keep the scope small enough to finish and make the result demonstrate the concept."},
      {heading:"9. Lesson recap",body:"You learned the purpose of "+topicTitle.toLowerCase()+", a practical approach, an example, common mistakes, and a repeatable practice routine. Explain the idea and reproduce a small example before moving on."}
    ],
    example:guide.example,
    sources:COURSE_SOURCES[key] || []
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
