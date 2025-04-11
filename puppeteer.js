const puppeteer = require('puppeteer');

async function getRepliesFromChatGPT(messages, mood) {
  const formattedMessages = messages.map((msg, i) =>
    `${i % 2 === 0 ? 'Them' : 'You'}: ${msg}`
  ).join('\n');

  const prompt = `
You are a highly experienced, witty, and emotionally aware flirty conversation assistant. Given the chat history below:

${formattedMessages}

Your job is to generate 8–10 short, clever, mood-aligned replies that a smart, flirty person would realistically send next (Mood: ${mood}).

Keep them:
- Realistic and emotionally attuned
- Clever and humorous
- Not cringy or forced
- Short and natural (1–2 lines)

Only output numbered replies like:
1. Hey you 👀...
2. Well someone’s bold today...

Avoid unnecessary text. Just give the replies.
`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://chat.openai.com/', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('textarea', { timeout: 10000 });
  await page.type('textarea', prompt, { delay: 15 });
  await page.keyboard.press('Enter');

  // Wait for "Stop generating" to disappear
  await page.waitForFunction(() => {
    return !Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Stop generating'));
  }, { timeout: 60_000 });

  await page.waitForTimeout(2000); // Ensure it's rendered

  const replyBlock = await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll('.markdown'));
    return containers.pop()?.innerText || '';
  });

  await browser.close();

  const replies = replyBlock
    .split('\n')
    .filter(line => /^\d+\./.test(line))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);

  return replies;
}

module.exports = getRepliesFromChatGPT;
