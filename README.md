# Lean Screen

A minimalist screen-time tracking application designed for team competition and personal accountability. Track your daily screen usage, maintain streaks, and compete with your team on the leaderboard.

## Features

- 🕒 **Screen Time Logging** - Track daily screen time with notes
- 📊 **Dashboard** - View today, weekly, and monthly statistics
- 🏆 **Leaderboard** - Compete with your team across different time periods
- 🔥 **Streak Tracking** - Build consistency with daily logging streaks
- 👤 **Profile Management** - Customize your display name and settings
- 🌙 **Dark Mode** - Easy on the eyes interface
- 📱 **Responsive Design** - Works seamlessly on all devices

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd lean-screen
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these values:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public** key

### 4. Database Setup

The database schema has already been created via migration. Your Supabase database includes:

- **users** - User profiles and authentication data
- **screen_time_logs** - Daily screen time entries
- **user_settings** - User preferences and privacy settings
- **user_streaks** - Streak tracking and calculations

All tables have Row Level Security (RLS) enabled for data protection.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 6. Create Your First Account

1. Navigate to the app in your browser
2. Click "Sign Up" to create an account
3. Enter your display name, email, and password
4. Start logging your screen time!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication forms
│   ├── layout/            # Layout components and navigation
│   └── shared/            # Reusable UI components
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── lib/
│   ├── env.ts            # Environment variable validation
│   └── supabase.ts       # Supabase client configuration
├── pages/
│   ├── AuthPage.tsx      # Login/signup page
│   ├── DashboardPage.tsx # Main dashboard
│   ├── LogsPage.tsx      # Screen time logs management
│   ├── LeaderboardPage.tsx # Team leaderboard
│   ├── ProfilePage.tsx   # User profile
│   └── SettingsPage.tsx  # App settings
├── types/
│   ├── database.ts       # Database type definitions
│   └── index.ts          # Application types
├── App.tsx               # Main app component with routing
└── main.tsx             # Application entry point
```

## Usage Guide

### Logging Screen Time

1. Navigate to the **Logs** page
2. Click **Add Log**
3. Select the date and enter hours/minutes
4. Optionally add notes
5. Click **Save**

### Viewing the Leaderboard

1. Go to the **Leaderboard** page
2. Switch between Daily, Weekly, Monthly, or All-Time views
3. See your ranking highlighted in blue
4. View other team members' stats and streaks

### Managing Your Profile

1. Visit the **Profile** page
2. Update your display name
3. View your account information

### Adjusting Settings

1. Go to **Settings**
2. Toggle leaderboard visibility
3. Manage email notification preferences
4. Choose your theme preference

## Security Features

- Row Level Security (RLS) on all database tables
- Users can only access their own data
- Soft delete pattern for data retention
- Secure authentication with Supabase Auth
- Protected routes requiring authentication

## Building for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

## Troubleshooting

### Environment Variables Not Working

Make sure your `.env` file is in the root directory and variables are prefixed with `VITE_`.

### Database Connection Issues

1. Verify your Supabase URL and anon key are correct
2. Check that your Supabase project is active
3. Ensure the database migration has been applied

### Can't See Other Users on Leaderboard

Make sure:
- Other users have logged screen time for the selected period
- Users have "Show on Leaderboard" enabled in Settings
- You're authenticated and have logged at least one entry

## Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Database & Auth:** Supabase
- **Icons:** Lucide React

## Contributing

This is an internal team project. For questions or issues, please contact the development team.

## Docker Deployment

You can run the application using Docker for a containerized deployment.

### Using Docker Compose (Recommended)

1. Make sure Docker and Docker Compose are installed on your system
2. Set up your `.env` file with Supabase credentials
3. Build and run the container:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:3000`

To stop the container:

```bash
docker-compose down
```

### Using Docker directly

Build the image:

```bash
docker build -t lean-screen .
```

Run the container:

```bash
docker run -d -p 3000:80 --name lean-screen lean-screen
```

**Note:** The Docker build process requires your `.env` file to be present during the build. The environment variables are baked into the production build at build-time (this is how Vite works with environment variables).

For production deployments, consider using build arguments or a CI/CD pipeline to inject environment variables securely.

## License

Private - Internal Use Only
