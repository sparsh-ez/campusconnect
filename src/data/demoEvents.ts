export interface DemoEventTemplate {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  registrationDeadline: string;
  registrationUrl: string;
  sourcePostUrl: string;
  sourceCaption: string;
  image: string;
  classification: 'upcoming' | 'ongoing' | 'past' | 'unconfirmed';
  confidence: number;
}

// Preconfigured demo dataset keyed by normalized clean handle / name keywords
export const CLUB_DEMO_DATASET: Record<string, DemoEventTemplate[]> = {
  // 1. GeeksforGeeks GCET — 4 Configured Events
  'geeksforgeeks_gcet': [
    {
      title: 'CodeClash 2026: Algorithmic Sprint',
      description: 'Annual competitive programming contest with dynamic algorithmic challenges, data structure problems, and industry placement mock rounds.',
      date: '2026-11-14',
      time: '10:00 AM - 02:00 PM',
      venue: 'Computer Center Lab 3 & 4, GCET',
      category: 'Technical',
      registrationDeadline: '2026-11-12',
      registrationUrl: 'https://gfg-gcet.dev/codeclash-2026',
      sourcePostUrl: 'https://www.instagram.com/geeksforgeeks_gcet/p/codeclash2026/',
      sourceCaption: 'Are you ready for the ultimate coding sprint? CodeClash 2026 is here! Solve tricky algorithms, top the leaderboard, and win exciting cash rewards. Link in bio to register!',
      image: '/events/disha.jpg',
      classification: 'upcoming',
      confidence: 0.96,
    },
    {
      title: 'DSA Masterclass: Graphs & Dynamic Programming',
      description: 'Intensive 3-hour weekend masterclass breaking down tree traversals, shortest path algorithms, and DP memoization patterns for campus interview prep.',
      date: '2026-11-08',
      time: '02:00 PM - 05:00 PM',
      venue: 'Seminar Hall 2, Block B',
      category: 'Workshop',
      registrationDeadline: '2026-11-07',
      registrationUrl: 'https://gfg-gcet.dev/dsa-bootcamp',
      sourcePostUrl: 'https://www.instagram.com/geeksforgeeks_gcet/p/dsa-bootcamp/',
      sourceCaption: 'Struggling with Dynamic Programming? Join our expert-led session this Sunday in Seminar Hall 2. Free registration for all GCET students!',
      image: '/events/abhivyakti.jpg',
      classification: 'upcoming',
      confidence: 0.94,
    },
    {
      title: 'Open Source Sprint & Git Masterclass',
      description: 'Hands-on practical workshop covering Git branch management, open-source pull request best practices, and building student community projects.',
      date: '2026-11-20',
      time: '11:00 AM - 03:30 PM',
      venue: 'Incubation & Tinkering Lab, GCET',
      category: 'Workshop',
      registrationDeadline: '2026-11-19',
      registrationUrl: 'https://gfg-gcet.dev/git-sprint',
      sourcePostUrl: 'https://www.instagram.com/geeksforgeeks_gcet/p/git-masterclass/',
      sourceCaption: 'Level up your developer portfolio! Learn how to contribute to real open source repositories, manage branches, and collaborate effectively. Bring your laptops!',
      image: '/events/range_bharat.jpg',
      classification: 'upcoming',
      confidence: 0.91,
    },
    {
      title: 'HackNight 2026: AI & Web3 Sprint',
      description: 'Flagship 12-hour overnight campus hackathon building real-world AI agent utilities and decentralized web applications. Mentors and meals provided.',
      date: '2026-12-05',
      time: '06:00 PM - 06:00 AM',
      venue: 'Main Auditorium, GCET Campus',
      category: 'Hackathon',
      registrationDeadline: '2026-12-01',
      registrationUrl: 'https://gfg-gcet.dev/hacknight',
      sourcePostUrl: 'https://www.instagram.com/geeksforgeeks_gcet/p/hacknight2026/',
      sourceCaption: 'Get your teams together! HackNight 2026 brings 12 hours of non-stop innovation, developer mentorship, swags, and prizes. Register before seats fill up!',
      image: '/hero-illustration.png',
      classification: 'upcoming',
      confidence: 0.98,
    },
  ],

  // 2. Lingua Franca — Anhad 2026
  'linguafranca.gcet': [
    {
      title: 'Anhad 2026 — Annual Literary & Cultural Fest',
      description: 'The flagship literary and cultural festival of GCET featuring Hindi and English poetry slams, parliamentary debates, stage drama (Nukkad Natak), and open mic music sessions.',
      date: '2026-11-28',
      time: '03:00 PM - 08:30 PM',
      venue: 'Main Campus Amphitheatre',
      category: 'Cultural',
      registrationDeadline: '2026-11-26',
      registrationUrl: 'https://linguafranca.gcet.edu.in/anhad2026',
      sourcePostUrl: 'https://www.instagram.com/linguafranca.gcet/p/anhad2026/',
      sourceCaption: 'Lingua Franca proudly presents ANHAD 2026 — where verses ignite and voices echo! Join us for poetry, open mics, and dramatic theatrical performances at the Amphitheatre.',
      image: '/events/range_bharat.jpg',
      classification: 'upcoming',
      confidence: 0.97,
    },
  ],
};

// Helper to look up demo events for any club
export function getDemoEventsForClub(
  clubHandle: string,
  clubName: string
): DemoEventTemplate[] {
  const normHandle = clubHandle.toLowerCase().replace(/[@\s]/g, '').replace(/https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
  const normName = clubName.toLowerCase();

  // Match GeeksforGeeks GCET
  if (
    normHandle.includes('geeksforgeeks') ||
    normHandle.includes('gfg') ||
    normName.includes('geeksforgeeks') ||
    normName.includes('gfg')
  ) {
    return CLUB_DEMO_DATASET['geeksforgeeks_gcet'] || [];
  }

  // Match Lingua Franca
  if (
    normHandle.includes('linguafranca') ||
    normHandle.includes('lingua') ||
    normName.includes('lingua franca') ||
    normName.includes('lingua')
  ) {
    return CLUB_DEMO_DATASET['linguafranca.gcet'] || [];
  }

  // Check direct clean handle match
  if (CLUB_DEMO_DATASET[normHandle]) {
    return CLUB_DEMO_DATASET[normHandle];
  }

  // Clubs with no preconfigured events return empty
  return [];
}
