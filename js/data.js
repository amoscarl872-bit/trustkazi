const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Convert a database row (snake_case) into the shape the page uses (camelCase)
function toOpportunity(row) {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    type: row.type,
    country: row.country,
    city: row.city,
    remote: row.remote,
    deadline: row.deadline,
    description: row.description,
    applyUrl: row.apply_url,
    source: row.source,
    verified: row.verified,
    postedAt: row.posted_at
  };
}

async function fetchOpportunities() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await db
    .from("opportunities")
    .select("*")
    .gte("deadline", today)
    .order("posted_at", { ascending: false });

  if (error) throw error;
  return data.map(toOpportunity);
}