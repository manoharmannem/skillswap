const keyFor = (skill) => String(skill || "").trim().toLowerCase().replace(/\s+/g, " ");

const LESSONS = {
  javascript: {
    intro: "JavaScript runs in the browser and lets a page respond to user actions, transform data, and communicate with services.",
    examples: {
      "Variables, types & functions": ["Use let when a binding may change and const when it should not be reassigned.", "const learner = { name: 'Asha' };\nlet score = 10;\nfunction add(a, b) { return a + b; }\nconsole.log(add(score, 5));"],
      "Arrays, objects & modern syntax": ["Arrays hold ordered values and objects group named properties. Spread syntax creates a new collection without changing the original.", "const user = { name: 'Asha', skills: ['JS', 'React'] };\nconst skills = [...user.skills, 'CSS'];"],
      "DOM and events": ["The DOM represents the page as objects. Event listeners connect user actions to JavaScript.", "const button = document.querySelector('#save');\nbutton.addEventListener('click', () => {\n  document.querySelector('#status').textContent = 'Saved';\n});"],
      "Async JavaScript & APIs": ["Promises represent work that finishes later. async/await makes promise-based code easier to read.", "async function loadUsers() {\n  const response = await fetch('/api/users');\n  return response.json();\n}"],
      "Build a small JavaScript project": ["Combine variables, functions, arrays, DOM events, and asynchronous data into one small feature.", "const tasks = [];\nfunction addTask(title) { tasks.push({ title, done: false }); }\naddTask('Finish lesson');"]
    }
  },
  react: {
    intro: "React applications are built from components. State, props, events, and effects let those components respond to data and interaction.",
    examples: {
      "Components & JSX": ["A component is a reusable UI unit. JSX lets JavaScript describe the elements that should appear on screen.", "function Welcome({ name }) { return <h2>Welcome, {name}</h2>; }"],
      "Props and reusable components": ["Props are inputs passed from a parent to a child component. Keep reusable components focused.", "function SkillCard({ skill, level }) { return <article><b>{skill}</b><span>{level}</span></article>; }"],
      "State and event handling": ["State stores values that change over time. Updating state causes React to render affected UI again.", "const [count, setCount] = useState(0);\n<button onClick={() => setCount(count + 1)}>{count}</button>"],
      "Effects, forms & API calls": ["Effects are useful for synchronizing with external systems such as APIs. Forms should keep input state predictable.", "useEffect(() => { fetch('/api/profile').then(r => r.json()).then(setProfile); }, []);"],
      "Build a complete React feature": ["A complete feature combines a component tree, state, events, validation, and loading/error states.", "function SearchBox({ onSearch }) { const [value, setValue] = useState(''); return <input value={value} onChange={e => setValue(e.target.value)} />;"]
    }
  },
  python: {
    intro: "Python emphasizes readable syntax and is widely used for automation, web development, data work, and scripting.",
    examples: {
      "Syntax, variables & data types": ["Variables point to values. Strings, numbers, booleans, lists, and dictionaries are common building blocks.", "name = 'Asha'\nage = 21\nactive = True\nprint(name, age, active)"],
      "Conditions, loops & functions": ["Conditions choose a path, loops repeat work, and functions package reusable logic.", "def grade(score):\n    if score >= 80: return 'A'\n    return 'Keep practising'"],
      "Collections & modules": ["Lists preserve order, dictionaries map keys to values, and modules organize reusable code.", "profile = {'name': 'Asha', 'skills': ['Python', 'SQL']}\nprint(profile['skills'][0])"],
      "Files, errors & packages": ["Use context managers for files and catch only errors you can handle meaningfully.", "try:\n    with open('notes.txt') as file: text = file.read()\nexcept FileNotFoundError: text = ''"],
      "Build a Python project": ["A small project should have clear inputs, reusable functions, validation, and useful output.", "def add_note(notes, text):\n    notes.append(text)\nnotes = []\nadd_note(notes, 'Review functions')"]
    }
  },
  html: {
    intro: "HTML provides the structure and meaning of a web page. Good HTML makes styling, accessibility, and maintenance easier.",
    examples: {
      "Document structure & semantic HTML": ["Use meaningful elements such as header, nav, main, section, article, and footer.", "<main>\n  <h1>SkillSwap</h1>\n  <section><h2>Practice</h2></section>\n</main>"],
      "Forms, links & media": ["Labels connect instructions to controls. Links should describe destinations, and media should include useful alternatives.", "<label for='email'>Email</label>\n<input id='email' type='email'>"],
      "Accessibility basics": ["Semantic elements, heading order, labels, alt text, and keyboard-friendly controls improve access.", "<img src='chef.jpg' alt='Home chef preparing a meal'>"],
      "Responsive page structure": ["Keep structure independent from presentation so CSS can rearrange it for different screens.", "<header>...</header>\n<main><section>...</section></main>\n<footer>...</footer>"],
      "Build a complete webpage": ["Combine semantic structure, clear navigation, accessible forms, and meaningful content.", "<main><h1>Learn JavaScript</h1><p>Start with the fundamentals.</p></main>"]
    }
  },
  css: {
    intro: "CSS controls presentation: layout, spacing, typography, color, and responsive behavior.",
    examples: {
      "Selectors, box model & cascade": ["Selectors choose elements. The box model explains content, padding, border, and margin.", ".card { width: 320px; padding: 16px; border: 1px solid #ddd; }"],
      "Flexbox layouts": ["Flexbox is useful for one-dimensional alignment such as navigation bars and action rows.", ".actions { display:flex; align-items:center; justify-content:space-between; gap:12px; }"],
      "CSS Grid layouts": ["Grid is useful when rows and columns both matter, such as a responsive card gallery.", ".cards { display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; }"],
      "Responsive design": ["Responsive layouts adapt to available space using flexible units, max-widths, and media queries.", "@media (max-width:700px) { .cards { grid-template-columns:1fr; } }"],
      "Build a responsive interface": ["Combine layout primitives with fluid spacing and purposeful breakpoints.", ".hero { padding:clamp(24px, 6vw, 80px); max-width:1100px; margin:auto; }"]
    }
  },
  sql: {
    intro: "SQL is used to retrieve, transform, summarize, and relate structured data stored in databases.",
    examples: {
      "Tables, keys & basic queries": ["Tables contain rows and columns. A primary key identifies a record, while SELECT chooses information.", "SELECT id, name FROM learners WHERE active = 1;"],
      "Filtering, sorting & grouping": ["WHERE filters rows, ORDER BY sorts them, and GROUP BY creates groups for aggregate calculations.", "SELECT skill, COUNT(*) AS learners FROM profiles GROUP BY skill ORDER BY learners DESC;"],
      "Joins and relationships": ["Joins combine related tables through matching keys. Understand which relationship you are traversing.", "SELECT users.name, skills.name FROM users JOIN skills ON skills.user_id = users.id;"],
      "Aggregations & window functions": ["Aggregates summarize groups. Window functions calculate across related rows while retaining individual records.", "SELECT name, score, AVG(score) OVER () AS average_score FROM results;"],
      "Build practical SQL reports": ["Start with a question, identify tables, build the query step by step, and verify the result.", "SELECT skill, AVG(score) AS avg_score FROM practice_results GROUP BY skill HAVING COUNT(*) >= 5;"]
    }
  }
};

function fallbackLesson(skill, title) {
  return {
    intro: `This lesson introduces a practical part of ${skill}. Read the explanation, study the example, and complete the checkpoint before marking the topic complete.`,
    sections: [
      { heading: "Core idea", body: `Understand the purpose of ${title.toLowerCase()} and where it appears in real ${skill} work.` },
      { heading: "Practice method", body: "Start with a small example, inspect the result, change one part, and observe what changes. This makes the concept easier to remember than reading alone." },
      { heading: "Checkpoint", body: `Explain ${title.toLowerCase()} in your own words and identify one situation where you would use it.` }
    ],
    example: `// SkillSwap practice example\n// Topic: ${title}`
  };
}

export function lessonFor(skill, title) {
  const course = LESSONS[keyFor(skill)];
  const entry = course?.examples?.[title];
  if (!entry) return fallbackLesson(skill, title);
  return {
    intro: course.intro,
    sections: [
      { heading: "Core idea", body: entry[0] },
      { heading: "Example", body: "Study the example below, then rewrite it from memory with one small change." },
      { heading: "Practice", body: `Create a tiny exercise using ${title.toLowerCase()}. Keep it small enough to finish in 10–15 minutes.` },
      { heading: "Checkpoint", body: "Before completing this topic, make sure you can explain the idea and reproduce the example without copying it line by line." }
    ],
    example: entry[1]
  };
}
