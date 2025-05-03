const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post("/", async (req, res) => {
  const { user_id, claims } = req.body;
  console.log("🔔 Hook called for user:", user_id);

  try {
    const result = await pool.query(
      "SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1",
      [user_id]
    );
    const user_role = result.rows[0]?.role || null;
    console.log("✅ user_role:", user_role);

    // ✅ REQUIRED structure
    res.status(200).json({
      claims: {
        ...claims,
        user_role,
      },
    });
  } catch (err) {
    console.error("❌ Hook DB error:", err.message);
    res.status(200).json({ claims }); // Still respond 200 to avoid breaking login
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("✅ JWT hook running on port 3000");
});

