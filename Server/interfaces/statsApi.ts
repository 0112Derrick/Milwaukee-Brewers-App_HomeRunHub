const statsApi = [
  {
    Endpoint: "attendance",
    URL: "https://statsapi.mlb.com/api/${ver}/attendance",
  },
  {
    Endpoint: "awards",
    URL: `https://statsapi.mlb.com/api/{ver}/awards{awardId}{recipients}`,
  },
  {
    Endpoint: "conferences",
    URL: `https://statsapi.mlb.com/api/{ver}/conferences`,
  },
  {
    Endpoint: "divisions",
    URL: `https://statsapi.mlb.com/api/{ver}/divisions`,
  },
  {
    Endpoint: "draft",
    URL: `https://statsapi.mlb.com/api/{ver}/draft{prospects}{year}{latest}`,
  },
  {
    Endpoint: "game",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/feed/live`,
  },
  {
    Endpoint: "game_diff",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/feed/live/diffPatch`,
  },
  {
    Endpoint: "game_timestamps",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/feed/live/timestamps`,
  },
  {
    Endpoint: "game_changes",
    URL: `https://statsapi.mlb.com/api/{ver}/game/changes`,
  },
  {
    Endpoint: "game_contextMetrics",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/contextMetrics`,
  },
  {
    Endpoint: "game_winProbability",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/winProbability`,
  },
  {
    Endpoint: "game_boxscore",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/boxscore`,
  },
  {
    Endpoint: "game_content",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/content`,
  },
  {
    Endpoint: "game_color",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/feed/color`,
  },
  {
    Endpoint: "game_color_diff",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/feed/color/diffPatch`,
  },
  {
    Endpoint: "game_color_timestamps",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/feed/color/timestamps`,
  },
  {
    Endpoint: "game_linescore",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/linescore`,
  },
  {
    Endpoint: "game_playByPlay",
    URL: `https://statsapi.mlb.com/api/{ver}/game/{gamePk}/playByPlay`,
  },
  {
    Endpoint: "game_uniforms",
    URL: `https://statsapi.mlb.com/api/{ver}/uniforms/game`,
  },
  {
    Endpoint: "gamePace",
    URL: `https://statsapi.mlb.com/api/{ver}/gamePace`,
  },
  {
    Endpoint: "highLow",
    URL: `https://statsapi.mlb.com/api/{ver}/highLow/{orgType}`,
  },
  {
    Endpoint: "homeRunDerby",
    URL: `https://statsapi.mlb.com/api/{ver}/homeRunDerby/{gamePk}{bracket}{pool}`,
  },
  {
    Endpoint: "league",
    URL: `https://statsapi.mlb.com/api/{ver}/league`,
  },
  {
    Endpoint: "league_allStarBallot",
    URL: `https://statsapi.mlb.com/api/{ver}/league/{leagueId}/allStarBallot`,
  },
  {
    Endpoint: "league_allStarWriteIns",
    URL: `https://statsapi.mlb.com/api/{ver}/league/{leagueId}/allStarWriteIns`,
  },
  {
    Endpoint: "league_allStarFinalVote",
    URL: `https://statsapi.mlb.com/api/{ver}/league/{leagueId}/allStarFinalVote`,
  },
  {
    Endpoint: "people",
    URL: `https://statsapi.mlb.com/api/{ver}/people`,
  },
  {
    Endpoint: "people_changes",
    URL: `https://statsapi.mlb.com/api/{ver}/people/changes`,
  },
  {
    Endpoint: "people_freeAgents",
    URL: `https://statsapi.mlb.com/api/{ver}/people/freeAgents`,
  },
  {
    Endpoint: "person",
    URL: `https://statsapi.mlb.com/api/{ver}/people/{personId}`,
  },
  {
    Endpoint: "person_stats",
    URL: `https://statsapi.mlb.com/api/{ver}/people/{personId}/stats/game/{gamePk}`,
  },
  {
    Endpoint: "jobs",
    URL: `https://statsapi.mlb.com/api/{ver}/jobs`,
  },
  {
    Endpoint: "jobs_umpires",
    URL: `https://statsapi.mlb.com/api/{ver}/jobs/umpires`,
  },
  {
    Endpoint: "jobs_umpire_games",
    URL: `https://statsapi.mlb.com/api/{ver}/jobs/umpires/games/{umpireId}`,
  },
  {
    Endpoint: "jobs_datacasters",
    URL: `https://statsapi.mlb.com/api/{ver}/jobs/datacasters`,
  },
  {
    Endpoint: "jobs_officialScorers",
    URL: `https://statsapi.mlb.com/api/{ver}/jobs/officialScorers`,
  },
  {
    Endpoint: "schedule",
    URL: `https://statsapi.mlb.com/api/{ver}/schedule`,
  },
  {
    Endpoint: "schedule_tied",
    URL: `https://statsapi.mlb.com/api/{ver}/schedule/games/tied`,
  },
  {
    Endpoint: "schedule_postseason",
    URL: `https://statsapi.mlb.com/api/{ver}/schedule/postseason`,
  },
  {
    Endpoint: "schedule_postseason_series",
    URL: `https://statsapi.mlb.com/api/{ver}/schedule/postseason/series`,
  },
  {
    Endpoint: "schedule_postseason_tuneIn",
    URL: `https://statsapi.mlb.com/api/{ver}/schedule/postseason/tuneIn`,
  },
  {
    Endpoint: "seasons",
    URL: `https://statsapi.mlb.com/api/{ver}/seasons{all}`,
  },
  {
    Endpoint: "season",
    URL: `https://statsapi.mlb.com/api/{ver}/seasons/{seasonId}`,
  },
  {
    Endpoint: "sports",
    URL: `https://statsapi.mlb.com/api/{ver}/sports`,
  },
  {
    Endpoint: "sports_players",
    URL: `https://statsapi.mlb.com/api/{ver}/sports/{sportId}/players`,
  },
  {
    Endpoint: "standings",
    URL: `https://statsapi.mlb.com/api/{ver}/standings`,
  },
  {
    Endpoint: "stats",
    URL: `https://statsapi.mlb.com/api/{ver}/stats`,
  },
  {
    Endpoint: "stats_leaders",
    URL: `https://statsapi.mlb.com/api/{ver}/stats/leaders`,
  },
  {
    Endpoint: "stats_streaks",
    URL: `https://statsapi.mlb.com/api/{ver}/stats/streaks`,
  },
  {
    Endpoint: "teams",
    URL: `https://statsapi.mlb.com/api/{ver}/teams`,
  },
  {
    Endpoint: "teams_history",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/history`,
  },
  {
    Endpoint: "teams_stats",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/stats`,
  },
  {
    Endpoint: "teams_affiliates",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/affiliates`,
  },
  {
    Endpoint: "team",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/{teamId}`,
  },
  {
    Endpoint: "team_alumni",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/{teamId}/alumni`,
  },
  {
    Endpoint: "team_coaches",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/{teamId}/coaches`,
  },
  {
    Endpoint: "team_personnel",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/{teamId}/personnel`,
  },
  {
    Endpoint: "team_leaders",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/{teamId}/leaders`,
  },
  {
    Endpoint: "team_roster",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/{teamId}/roster`,
  },
  {
    Endpoint: "team_stats",
    URL: `https://statsapi.mlb.com/api/{ver}/teams/{teamId}/stats`,
  },
  {
    Endpoint: "team_uniforms",
    URL: `https://statsapi.mlb.com/api/{ver}/uniforms/team`,
  },
  {
    Endpoint: "transactions",
    URL: `https://statsapi.mlb.com/api/{ver}/transactions`,
    ex: "https://statsapi.mlb.com/api/v1/transactions?teamId=114&startDate=2025-03-01&endDate=2025-08-31&limit=10&order=desc",
  },
  {
    Endpoint: "venue",
    URL: `https://statsapi.mlb.com/api/{ver}/venues`,
  },
  {
    Endpoint: "meta",
    URL: `https://statsapi.mlb.com/api/{ver}/{type}`,
  },
];
