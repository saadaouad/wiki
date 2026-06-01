const SUMMARY_SYSTEM =
  'You are an assistant that writes concise factual summaries.';

const buildSummaryPrompt = (title: string, article: string) =>
  `Summarize the following wiki article in 1-2 concise sentences. Focus on the main idea and the most important details a reader should remember. Do not add opinions or unrelated information. Your goal is inform users of what the gist of a wiki article is so they can decide if they want to read more or not.

<title>
${title}</title>

<wiki_content>
${article}</wiki_content>`;

type OpenRouterChatResponse = {
  choices?: { message?: { content?: string } }[];
};

export const summarizeArticle = async (
  title: string,
  article: string
): Promise<string> => {
  if (!article?.trim()) {
    throw new Error('Article content is required to generate a summary.');
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim();

  const res = await fetch(process.env.OPENROUTER_URL ?? 'https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_APP_NAME ?? 'wiki'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM },
        { role: 'user', content: buildSummaryPrompt(title, article) }
      ],
      max_tokens: 150,
      temperature: 0.3
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as OpenRouterChatResponse;
  const text = data.choices?.[0]?.message?.content ?? '';
  const summary = text.trim();

  if (!summary) {
    throw new Error('OpenRouter returned an empty summary');
  }

  return summary;
}

export default summarizeArticle;
