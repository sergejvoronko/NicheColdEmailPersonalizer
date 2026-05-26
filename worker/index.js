export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // For development; restrict this in production
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    try {
      const { profileText } = await request.json();

      if (!profileText) {
        return new Response(JSON.stringify({ error: "No profile text provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Formatting the prompt for an AI model (e.g., GPT-4 or Workers AI)
      const prompt = `Based on the following LinkedIn profile content, generate a personalized, short, and engaging cold email for a networking request:

Profile Content:
${profileText.substring(0, 3000)}

The email should be professional yet warm, highlighting a specific detail from their profile.`;

      // Placeholder for AI API call (e.g., using Workers AI or an external API like OpenAI)
      // For now, we'll return a simulated response.
      const generatedEmail = `Subject: Quick question about your work!

Hi there,

I was just reading through your profile and was really impressed by your background. I'd love to connect and learn more about your experience.

Best regards,
[Your Name]`;

      return new Response(JSON.stringify({ email: generatedEmail, prompt_used: prompt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
