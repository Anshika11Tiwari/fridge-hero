export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { ing1, ing2, ing3 } = req.body;

    const prompt = `You are a helpful cooking assistant.

Using ONLY these ingredients:
${ing1}, ${ing2}, ${ing3}

Give output in this format:

Dish Name: <name>

Recipe:
1. Step one
2. Step two
3. Step three
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));

    // 🔥 SAFE EXTRACTION (prevents crash)
    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    res.status(200).json({ output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
