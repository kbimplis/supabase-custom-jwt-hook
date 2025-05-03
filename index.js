const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// Connect to your Supabase Postgres DB using service role credentials
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post("/", async (req, res) => {
  const { user_id, claims } = req.body;
  console.log("🔔 JWT hook called for user:", user_id);

  try {
    const result = await pool.query(
      "SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1",
      [user_id]
    );

    const user_role = result.rows[0]?.role || null;
    console.log("✅ Injecting user_role:", user_role);

    res.status(200).json({
      claims: {
        ...claims,
        user_role, // top-level
        app_metadata: {
          ...(claims?.app_metadata || {}),
          user_role,
        },
        user_metadata: {
          ...(claims?.user_metadata || {}),
          user_role,
        },
      },
    });
  } catch (err) {
    console.error("❌ Hook DB error:", err.message);
    res.status(200).json({ claims }); // fallback to default claims
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("✅ JWT hook running on port 3000");
});

