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
    const result = await pool.query(
      "SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1",
      [user_id]
    );

    const user_role = result.rows[0]?.role || null;

    res.json({
      claims: {
        ...claims,
        user_role,
      },
    });
  } catch (err) {
    console.error("Error in JWT hook:", err);
    res.status(500).json({ claims });
  }
});

app.listen(3000, () => {
  console.log("✅ JWT hook running on port 3000");
});
