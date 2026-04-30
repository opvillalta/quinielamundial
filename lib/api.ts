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
  firstGoalScorerId?: string
}

export interface Prediction {
  id: string
  matchId: string
  userId: string
  homeScore: number
  awayScore: number
  firstGoalScorer: string
  firstGoalScorerId?: string
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

// ─── Database Types (Snake Case) ─────────────────────────────────────────────

interface DBTeam {
  id: string
  name: string
  country_code: string
  flag_url: string | null
  group_stage: string
}

interface DBMatch {
  id: string
  home_team_id: string
  away_team_id: string
  stage: string
  match_date: string
  home_score: number | null
  away_score: number | null
  first_goal_team_id: string | null
  status: string
  Teams_home: DBTeam
  Teams_away: DBTeam
  Teams_first_goal?: DBTeam
}

interface DBPrediction {
  id: string
  profile_id: string
  match_id: string
  predicted_home: number
  predicted_away: number
  predicted_first_goal: string
  points_earned: number | null
  created_at: string
  matches?: DBMatch
  Teams_first_goal?: DBTeam
}

interface DBProfile {
  id: string
  username: string
  avatar_url: string | null
  total_points: number
  rank: number | null
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

const getFlagUrl = (code: string) => `https://flagcdn.com/w160/${code.toLowerCase().slice(0, 2)}.png`

const mapTeam = (db: DBTeam): Team => ({
  id: db.id,
  name: db.name,
  code: db.country_code,
  flag: db.flag_url || getFlagUrl(db.country_code),
  group: db.group_stage
})

const mapMatch = (db: any): Match => {
  const home = mapTeam(db.Teams_home)
  const away = mapTeam(db.Teams_away)
  return {
    id: db.id,
    homeTeam: home,
    awayTeam: away,
    date: db.match_date,
    group: home.group,
    stage: db.stage,
    status: db.status === 'scheduled' ? 'upcoming' : (db.status === 'live' ? 'live' : 'finished'),
    homeScore: db.home_score ?? undefined,
    awayScore: db.away_score ?? undefined,
    firstGoalScorer: db.Teams_first_goal?.name ?? undefined,
    firstGoalScorerId: db.Teams_first_goal?.id ?? undefined
  }
}

const mapPrediction = (db: any): Prediction => ({
  id: db.id,
  matchId: db.match_id,
  userId: db.profile_id,
  homeScore: db.predicted_home,
  awayScore: db.predicted_away,
  firstGoalScorer: db.Teams_first_goal?.name ?? '',
  firstGoalScorerId: db.predicted_first_goal,
  points: db.points_earned ?? undefined,
  createdAt: db.created_at,
  match: db.matches ? mapMatch(db.matches) : undefined
})

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email: string): Promise<void> {
  await client.auth.signInWithOtp({ 
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });
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

  if (result.error) {
    throw new Error(result.error.message)
  }
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function getMatches(_token?: string): Promise<Match[]> {
  const { data, error } = await client
    .from('matches')
    .select(`
      *,
      Teams_home:home_team_id(*),
      Teams_away:away_team_id(*),
      Teams_first_goal:first_goal_team_id(*)
    `)
    .order('match_date', { ascending: true })

  if (error) throw error
  return (data as any[]).map(mapMatch)
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export async function getMyPredictions(_token?: string): Promise<Prediction[]> {
  const { data: { user } } = await client.auth.getUser()
  if (!user) return []

  const { data, error } = await client
    .from('predictions')
    .select(`
      *,
      matches(*, Teams_home:home_team_id(*), Teams_away:away_team_id(*)),
      Teams_first_goal:predicted_first_goal(*)
    `)
    .eq('profile_id', user.id)

  if (error) throw error
  return (data as any[]).map(mapPrediction)
}

export async function savePrediction(
  _token: string,
  prediction: Omit<Prediction, 'id' | 'userId' | 'createdAt' | 'points'>
): Promise<Prediction> {
  const { data: { user } } = await client.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await client
    .from('predictions')
    .upsert({
      profile_id: user.id,
      match_id: prediction.matchId,
      predicted_home: prediction.homeScore,
      predicted_away: prediction.awayScore,
      predicted_first_goal: prediction.firstGoalScorer,
    }, { 
      onConflict: 'profile_id,match_id' 
    })
    .select(`
      *,
      Teams_first_goal:predicted_first_goal(*)
    `)

  if (error) {
    console.error('Supabase Error:', error)
    throw error
  }
  
  if (!data || data.length === 0) throw new Error('No se pudo guardar la predicción')
  return mapPrediction(data[0])
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getLeaderboard(_token?: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('total_points', { ascending: false })
    .limit(100)

  if (error) throw error

  return (data as any[]).map((p, index) => ({
    rank: p.rank ?? (index + 1),
    points: p.total_points,
    correctScores: 0, // Estas métricas podrían venir de una vista o calcularse
    correctResults: 0,
    user: {
      id: p.id,
      name: p.username,
      email: '', // No exponemos email en el leaderboard por privacidad
      avatar: p.avatar_url,
      points: p.total_points,
      rank: p.rank ?? (index + 1)
    }
  }))
}
