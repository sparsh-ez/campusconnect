
# CampusConnect
<img width="1345" height="728" alt="image" src="https://github.com/user-attachments/assets/3db04961-3a79-4298-b50a-78c969c6c03d" />
<img width="1340" height="730" alt="image" src="https://github.com/user-attachments/assets/7554fb4d-d0fe-4d82-be4c-572e526eb13a" />
<img width="1917" height="1025" alt="image" src="https://github.com/user-attachments/assets/ed4c346a-7e6a-4b7c-849e-6864bcb7103f" />
<img width="1917" height="1036" alt="image" src="https://github.com/user-attachments/assets/0d8527b9-a3a6-404f-a993-0085a2f9c523" />
<img width="1917" height="1052" alt="image" src="https://github.com/user-attachments/assets/dc525031-803f-43ac-8e86-687b84a96f60" />


CampusConnect is a centralized campus event discovery platform that helps students stay informed about events happening across their college. Instead of checking multiple club social media pages, students can discover events, monitor campus clubs, and explore event-related resources from one dashboard.

Built for students and campus communities, CampusConnect brings event discovery and campus engagement into a single interface.

## The Problem

Campus events are often announced across different club Instagram pages and social channels. Students may miss hackathons, workshops, cultural events, and other opportunities because announcements are scattered and difficult to track.

CampusConnect addresses this by organizing event information into one searchable and filterable platform.

## Features

- **Campus Dashboard** — View monitored clubs, upcoming events, ongoing events, and recently discovered activities.
- **Discover Events** — Browse event cards with details such as event name, organizer, category, date, venue, and registration status.
- **Monitored Clubs** — Add and manage campus clubs and their social media handles.
- **AI Event Discovery** — Initiate event discovery workflows for monitored clubs.
- **Event Search and Filters** — Find events by name and filter by club, category, source, or event status.
- **Campus Community** — Share event discussions and coordinate with other students.
- **Campus Resources** — Access event organization guidelines, registration templates, and useful campus links.

## TinyFish Integration

CampusConnect uses TinyFish as the foundation for its social-media-based event discovery workflow.

The intended workflow is to identify a club's social profile, access relevant posts, extract event information, and present discovered events in a structured format.

The TinyFish tools contribute to the workflow as follows:

- **Search** — Locate relevant club or event information.
- **Fetch** — Retrieve accessible content for processing.
- **Agent** — Coordinate the event discovery workflow.
- **Monitor** — Support repeated discovery for monitored clubs.
- **Browser** — Access browser-based social content where available.

The application also includes a discovery interface with scan actions and event results. Availability of source content depends on the platform's access and authentication requirements. Demo events are used where live source data is unavailable.

## Tech Stack

- React
- TypeScript
- Vite
- Supabase
- TinyFish
- Lucide React

## Project Structure

```text
CampusConnect/
├── src/          # Frontend application
├── server/       # Backend API and data logic
├── supabase/     # Supabase configuration and database assets
├── public/       # Static assets
├── package.json
└── vite.config.ts
```

## Run Locally

### Requirements

- Node.js
- npm

### Installation

```bash
git clone <your-repository-url>
cd CampusConnect
npm install
```

Create a `.env` file and add the environment variables required by the application. Do not commit secrets or API keys.

### Start the frontend

```bash
npm run dev
```

### Build the frontend

```bash
npm run build
```

### Build the backend

```bash
npm run build:server
```

## Deployment

The frontend is deployed on Vercel and the backend API is deployed on Render.

- **Live Application:** https://campusconnect-gamma-seven.vercel.app
- **Backend API:** https://campusconnect-1-muj5.onrender.com

The backend exposes a status endpoint at:

```text
/api/status
```

## Project

CampusConnect was developed for TinyFish × GeeksforGeeks GCET TinyHacks, with the goal of making campus event discovery more accessible and organized for students.

