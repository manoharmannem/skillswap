# SkillSwap — MongoDB Connected Version

## 1. Backend `.env`
Open `backend/.env` and replace:

```env
MONGO_URI=PASTE_YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE
JWT_SECRET=change_this_to_a_long_random_secret
```

Use the exact MongoDB Atlas driver URI for the `skillswap` database.

## 2. Install dependencies
Open PowerShell in the project root:

```powershell
npm install
cd backend
npm install
```

## 3. Start backend
From `backend`:

```powershell
npm run dev
```

Expected:

```text
MongoDB connected successfully
SkillSwap seed data checked
SkillSwap server running on http://localhost:5000
```

## 4. Start frontend
Open a second PowerShell window:

```powershell
cd C:\Users\YOUR_NAME\Downloads\SkillSwap-MongoDB-Connected-Full\skillswap-react-updated
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

## 5. MongoDB collections used by this version
The application uses the `skillswap` database:

- `users` — registration, login identity, skills, credits, practice progress, quiz scores
- `profiles` — profile information linked to each user
- `skills` — SkillSwap skill catalogue
- `quizzes` — quiz definitions/questions
- `meetings` — scheduled sessions
- `messages` — chat messages
- `connections` — connection requests and accepted connections

## 6. What is no longer stored in browser localStorage
The actual application data is not stored in localStorage anymore. Only the JWT token is stored there so the browser can remain signed in.

A one-time compatibility migration also reads the old `skillswap:users` browser data after login and sends the matching user's old skills/bio to MongoDB. It then removes that old browser user store.

## 7. Existing `test` database
Do not use `test` for this project. The correct database is:

```text
skillswap
```

If Atlas currently shows `test.profiles`, that is a separate database/collection and is not where this application writes its new profile records.
