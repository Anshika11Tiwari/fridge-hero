export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { ing1, ing2, ing3 } = req.body;

    const prompt = `
You are a professional chef.

Using ONLY:
${ing1}, ${ing2}, ${ing3}

Create:

Dish Name: <name>

Recipe:
1. Step one
2. Step two
3. Step three
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    console.log("Gemini Response:", JSON.stringify(data, null, 2));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    let output = "No response from AI";

    if (data.candidates?.length > 0) {
      output = data.candidates[0].content.parts
        .map(p => p.text)
        .join(" ");
    }

    res.status(200).json({ output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
