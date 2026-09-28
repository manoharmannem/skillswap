# SkillSwap — real user-to-user skill exchange

SkillSwap is a React + Vite frontend with an Express + MongoDB backend. Registered members become the real Explore directory: each account stores skills they can teach and skills they want to learn.

## Run on Windows

### 1. Frontend

Open PowerShell in the project root:

```powershell
npm install
npm run dev
```

### 2. Backend

Open a second PowerShell window:

```powershell
cd backend
npm install
npm run dev
```

Create `backend/.env` from `backend/.env.example` and set:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=use-a-long-random-secret
```

In the root `.env`, use:

```env
VITE_API_URL=http://localhost:5000
```

## Real community data

Registration stores:

- `skills` — what the member can teach
- `learningSkills` — what the member wants to learn
- email — used for transactional notifications
- profile/bio/credits — persisted in MongoDB

Explore, Skill Details, Tutor Profiles, Dashboard suggestions, Meetings, Connections, Messages and quiz assignment use the registered-member directory rather than a fixed tutor list.

## Connection email notifications

When Member A sends Member B a connection request, the backend emails the address Member B used during registration. When B accepts, A receives an acceptance email.

Configure SMTP in `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASS=your-google-app-password
EMAIL_FROM="SkillSwap <your-email@example.com>"
```

For Gmail, use a Google App Password, not your normal Gmail password. Never commit `backend/.env` or put real credentials in the ZIP/GitHub repository.

If SMTP is not configured, the database operation still works and the backend logs that the email was skipped.

## Meetings

Meetings are private to accepted connections. The creator chooses the connected member, skill, date, time and optional meeting URL. The meeting is stored in MongoDB and email notifications are sent to the participants when SMTP is configured.

## Private quizzes

The quiz system is designed for a real skill exchange:

1. Two members become connected.
2. The member who wants to test the other member creates a quiz.
3. The creator writes and edits the questions and options.
4. The creator selects the correct answer for every question.
5. The creator assigns the quiz to the connected member.
6. The assigned member receives an email and sees only the questions/options.
7. The correct answer is **not** returned by the participant API.
8. The participant submits the complete test.
9. The backend calculates the score using the private answer key.
10. The score is saved to the participant's quiz history and added to their Dashboard credits.
11. The creator can review the score, correct answers and the participant's submitted answers.

The score calculation happens on the server, not in React, so the participant cannot get the answer key by inspecting the frontend data.

Editing a quiz resets its previous attempt because the answer key/question set has changed.

## Important files

```text
src/
  context/AuthContext.jsx
  context/ConnectionsContext.jsx
  pages/Explore.jsx
  pages/Connections.jsx
  pages/Meetings.jsx
  pages/Quizzes.jsx
  pages/Dashboard.jsx
  components/QuizPlayer.jsx

backend/
  models/user.js
  models/connection.js
  models/meeting.js
  models/quiz.js
  controllers/connectionController.js
  controllers/meetingController.js
  controllers/quizController.js
  services/emailService.js
  routes/connectionRoutes.js
  routes/meetingRoutes.js
  routes/quizRoutes.js
```

## Security notes

- Passwords are stored as bcrypt hashes.
- JWT authentication protects the private API.
- Quiz answer keys are filtered server-side for participants.
- Quiz scoring is performed server-side.
- Quiz creation/assignment requires an accepted connection.
- Meeting creation requires an accepted connection.
- SMTP credentials stay in environment variables.

## Deployment trigger

The `main` branch is the source of truth for the Vercel deployment. This marker commit is intentionally harmless and exists only to trigger the connected Git deployment after the latest application changes.


Deployment verification trigger: 2026-09-28 Practice hierarchy fixes.
