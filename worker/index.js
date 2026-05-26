export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    try {
      const { profileText } = await request.json();

      if (!profileText) {
        return new Response(JSON.stringify({ error: "No profile text provided in request body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === "REPLACE_ME") {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured. Please run 'wrangler secret put GEMINI_API_KEY'." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const prompt = `Based on the following LinkedIn profile content, generate a personalized, short, and engaging cold email for a networking request. 
      Keep it under 150 words. Focus on their specific achievements or interests.
      
      Profile Content:
      ${profileText.substring(0, 5000)}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      
      const aiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const aiData = await aiResponse.json();
      
      if (!aiResponse.ok) {
        return new Response(JSON.stringify({ 
          error: "Gemini API Error", 
          details: aiData.error?.message || "Unknown Gemini error" 
        }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!aiData.candidates || aiData.candidates.length === 0 || !aiData.candidates[0].content) {
        return new Response(JSON.stringify({ 
          error: "No response from AI", 
          details: "Gemini returned an empty candidate list. This might be due to safety filters." 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const generatedEmail = aiData.candidates[0].content.parts[0].text;

      return new Response(JSON.stringify({ email: generatedEmail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ 
        error: "Worker Internal Error", 
        details: err.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
