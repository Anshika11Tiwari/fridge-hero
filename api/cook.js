export default async function handler(req, res) {
  try {
    // Allow only POST request
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed" });
    }

    // Get ingredients from frontend
    const { ing1, ing2, ing3 } = req.body;

    // Validate input
    if (!ing1 || !ing2 || !ing3) {
      return res.status(400).json({ error: "All ingredients are required" });
    }

    // 🔥 Strong prompt (very important)
    const prompt = `
You are a professional chef.

Using ONLY these ingredients:
${ing1}, ${ing2}, ${ing3}

Create a creative dish.

Return response in EXACT format:

Dish Name: <creative name>

Recipe:
1. Step one
2. Step two
3. Step three
`;

    // 🔐 Call Gemini API (stable model)
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

    // 🧪 Debug log (check in Vercel logs if needed)
    console.log("Gemini API Response:", JSON.stringify(data, null, 2));

    // ✅ Safe extraction logic
    let output = "No response from AI";

    if (
      data &&
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      output = data.candidates[0].content.parts
        .map(part => part.text)
        .join(" ");
    }

    // Send response back to frontend
    return res.status(200).json({ output });

  } catch (error) {
    console.error("Error:", error);

    return res.status(500).json({
      error: "Something went wrong while generating recipe"
    });
  }
}
