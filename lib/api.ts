import { client } from './supabase/client'

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ─── Types ──────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  points: number
  rank: number
}

export interface Team {
  id: string
  name: string
  code: string // e.g. "MEX", "ARG"
  flag: string // emoji flag or URL
  group: string
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: string        // ISO string
  group: string       // "A" | "B" | ... | "Cuartos" | "Semis" | "Final"
  stage: string       // "Fase de grupos" | "Eliminatoria"
  status: 'upcoming' | 'live' | 'finished'
  homeScore?: number
  awayScore?: number
  firstGoalScorer?: string
}

export interface Prediction {
  id: string
  matchId: string
  userId: string
  homeScore: number
  awayScore: number
  firstGoalScorer: string
  points?: number
  createdAt: string
  match?: Match
}

export interface LeaderboardEntry {
  rank: number
  user: User
  points: number
  correctScores: number
  correctResults: number
}

export interface AuthResponse {
  token: string
  user: User
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email: string): Promise<void> {
  await client.auth.signInWithOtp({ email });
}

export async function register(name: string, email: string): Promise<void> {
  const result = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        display_name: name
      }
    }
  });

  // Verificar si hubo error
  if (result.error) {
    console.error('Error al registrar (detalle completo):', result.error)
    throw new Error(result.error.message || result.error.code || JSON.stringify(result.error))
  }

  // Si llegó aquí, el email fue enviado exitosamente
  console.log('Email de verificación enviado')


}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function getMatches(token: string): Promise<Match[]> {
  if (!BASE_URL) return mockMatches()
  const res = await fetch(`${BASE_URL}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Error al cargar partidos')
  return res.json()
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export async function getMyPredictions(token: string): Promise<Prediction[]> {
  if (!BASE_URL) return mockPredictions()
  const res = await fetch(`${BASE_URL}/predictions/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Error al cargar predicciones')
  return res.json()
}

export async function savePrediction(
  token: string,
  prediction: Omit<Prediction, 'id' | 'userId' | 'createdAt' | 'points'>
): Promise<Prediction> {
  if (!BASE_URL) return mockSavePrediction(prediction)
  const res = await fetch(`${BASE_URL}/predictions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prediction),
  })
  if (!res.ok) throw new Error('Error al guardar predicción')
  return res.json()
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getLeaderboard(token: string): Promise<LeaderboardEntry[]> {
  if (!BASE_URL) return mockLeaderboard()
  const res = await fetch(`${BASE_URL}/leaderboard`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Error al cargar tabla de posiciones')
  return res.json()
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

function mockLogin(email: string, name?: string): AuthResponse {
  return {
    token: 'mock-token-123',
    user: {
      id: '1',
      name: name ?? email.split('@')[0],
      email,
      points: 47,
      rank: 3,
    },
  }
}

const TEAMS: Team[] = [
  { id: '1', name: 'Mexico', code: 'MEX', flag: '🇲🇽', group: 'A' },
  { id: '2', name: 'Argentina', code: 'ARG', flag: '🇦🇷', group: 'A' },
  { id: '3', name: 'Brasil', code: 'BRA', flag: '🇧🇷', group: 'B' },
  { id: '4', name: 'Francia', code: 'FRA', flag: '🇫🇷', group: 'B' },
  { id: '5', name: 'Alemania', code: 'GER', flag: '🇩🇪', group: 'C' },
  { id: '6', name: 'España', code: 'ESP', flag: '🇪🇸', group: 'C' },
  { id: '7', name: 'Portugal', code: 'POR', flag: '🇵🇹', group: 'D' },
  { id: '8', name: 'Inglaterra', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'D' },
  { id: '9', name: 'Colombia', code: 'COL', flag: '🇨🇴', group: 'E' },
  { id: '10', name: 'Uruguay', code: 'URU', flag: '🇺🇾', group: 'E' },
  { id: '11', name: 'Estados Unidos', code: 'USA', flag: '🇺🇸', group: 'F' },
  { id: '12', name: 'Canadá', code: 'CAN', flag: '🇨🇦', group: 'F' },
]

function mockMatches(): Match[] {
  const now = new Date()
  return [
    {
      id: '1',
      homeTeam: TEAMS[0],
      awayTeam: TEAMS[1],
      date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      group: 'A',
      stage: 'Fase de grupos',
      status: 'upcoming',
    },
    {
      id: '2',
      homeTeam: TEAMS[2],
      awayTeam: TEAMS[3],
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      group: 'B',
      stage: 'Fase de grupos',
      status: 'upcoming',
    },
    {
      id: '3',
      homeTeam: TEAMS[4],
      awayTeam: TEAMS[5],
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      group: 'C',
      stage: 'Fase de grupos',
      status: 'upcoming',
    },
    {
      id: '4',
      homeTeam: TEAMS[6],
      awayTeam: TEAMS[7],
      date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      group: 'D',
      stage: 'Fase de grupos',
      status: 'upcoming',
    },
    {
      id: '5',
      homeTeam: TEAMS[8],
      awayTeam: TEAMS[9],
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      group: 'E',
      stage: 'Fase de grupos',
      status: 'finished',
      homeScore: 2,
      awayScore: 1,
      firstGoalScorer: 'James Rodríguez',
    },
    {
      id: '6',
      homeTeam: TEAMS[10],
      awayTeam: TEAMS[11],
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      group: 'F',
      stage: 'Fase de grupos',
      status: 'finished',
      homeScore: 1,
      awayScore: 1,
      firstGoalScorer: 'Pulisic',
    },
    {
      id: '7',
      homeTeam: TEAMS[0],
      awayTeam: TEAMS[4],
      date: new Date(now.getTime() + 0.5 * 60 * 60 * 1000).toISOString(),
      group: 'A',
      stage: 'Fase de grupos',
      status: 'live',
      homeScore: 1,
      awayScore: 0,
    },
  ]
}

function mockPredictions(): Prediction[] {
  const matches = mockMatches()
  return [
    {
      id: 'p1',
      matchId: '5',
      userId: '1',
      homeScore: 2,
      awayScore: 0,
      firstGoalScorer: 'James Rodríguez',
      points: 5,
      createdAt: new Date().toISOString(),
      match: matches[4],
    },
    {
      id: 'p2',
      matchId: '6',
      userId: '1',
      homeScore: 1,
      awayScore: 1,
      firstGoalScorer: 'Pulisic',
      points: 7,
      createdAt: new Date().toISOString(),
      match: matches[5],
    },
    {
      id: 'p3',
      matchId: '1',
      userId: '1',
      homeScore: 2,
      awayScore: 1,
      firstGoalScorer: 'Messi',
      points: undefined,
      createdAt: new Date().toISOString(),
      match: matches[0],
    },
  ]
}

function mockSavePrediction(
  prediction: Omit<Prediction, 'id' | 'userId' | 'createdAt' | 'points'>
): Prediction {
  return {
    ...prediction,
    id: Math.random().toString(36).slice(2),
    userId: '1',
    points: undefined,
    createdAt: new Date().toISOString(),
  }
}

function mockLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, user: { id: '2', name: 'Carlos Mendez', email: 'carlos@ex.com', points: 82, rank: 1 }, points: 82, correctScores: 4, correctResults: 10 },
    { rank: 2, user: { id: '3', name: 'Ana Torres', email: 'ana@ex.com', points: 74, rank: 2 }, points: 74, correctScores: 3, correctResults: 9 },
    { rank: 3, user: { id: '1', name: 'Tu Cuenta', email: 'me@ex.com', points: 47, rank: 3 }, points: 47, correctScores: 2, correctResults: 6 },
    { rank: 4, user: { id: '4', name: 'Luis Gomez', email: 'luis@ex.com', points: 41, rank: 4 }, points: 41, correctScores: 1, correctResults: 7 },
    { rank: 5, user: { id: '5', name: 'Maria Lopez', email: 'maria@ex.com', points: 38, rank: 5 }, points: 38, correctScores: 2, correctResults: 5 },
    { rank: 6, user: { id: '6', name: 'Pedro Ruiz', email: 'pedro@ex.com', points: 29, rank: 6 }, points: 29, correctScores: 0, correctResults: 6 },
    { rank: 7, user: { id: '7', name: 'Sofia Diaz', email: 'sofia@ex.com', points: 22, rank: 7 }, points: 22, correctScores: 1, correctResults: 3 },
    { rank: 8, user: { id: '8', name: 'Roberto Vega', email: 'rob@ex.com', points: 15, rank: 8 }, points: 15, correctScores: 0, correctResults: 4 },
  ]
}
