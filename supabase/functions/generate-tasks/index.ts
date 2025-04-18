
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal } = await req.json();

    // Extract the OpenAI API key from environment variables
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create prompt for OpenAI
    const prompt = `
    You are an expert in breaking down goals into actionable tasks.
    
    Please create 3-5 practical tasks for this family goal:
    
    Goal Title: ${goal.title}
    Goal Description: ${goal.description || 'No description provided'}
    Goal Category: ${goal.category}
    Target Date: ${goal.target_date || 'No specific date'}
    
    For each task, include:
    1. A clear, actionable title (keep it under 10 words)
    2. A brief description (1-2 sentences)
    
    Format your response as a JSON array with objects containing "title" and "description" fields only.
    Example: [{"title": "Research options", "description": "Spend 30 minutes researching different approaches."}]
    
    IMPORTANT: Return ONLY the JSON array without any markdown formatting, code blocks, or additional text.
    `;

    // Call OpenAI API
    console.log('Calling OpenAI API to generate tasks');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates practical tasks for family goals. Always return valid JSON without any markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate tasks', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    let generatedTasks;
    try {
      const aiResponse = data.choices[0].message.content;
      console.log('AI response:', aiResponse);
      
      // Strip any markdown formatting that might be present
      let cleanedResponse = aiResponse;
      
      // Remove markdown code block markers if present
      cleanedResponse = cleanedResponse.replace(/```json\n|\n```|```/g, '');
      
      // Attempt to parse the response
      generatedTasks = JSON.parse(cleanedResponse);
      
      // Validate the response format
      if (!Array.isArray(generatedTasks)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure each task has the required fields
      generatedTasks = generatedTasks.map(task => ({
        title: String(task.title || '').trim(),
        description: String(task.description || '').trim()
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ tasks: generatedTasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-tasks function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
