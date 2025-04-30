const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post("/", async (req, res) => {
  const { user_id, claims } = req.body;

  try {
    const { rows } = await pool.query(
      "SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1",
      [user_id]
    );

    const user_role = rows[0]?.role ?? null;

    res.json({
      claims: {
        ...claims,
        user_role,
      },
    });
  } catch (err) {
    console.error("❌ DB query failed:", err);
    res.status(200).json({ claims }); // fallback if query fails
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("✅ JWT hook running on port 3000");
});

