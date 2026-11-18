# Belle He: portfolio

I build AI agents that run the workflow, so people can run the business. From the first stakeholder request to the live product.

- 2,000+ pull requests merged to production with Claude Code, for an agency serving 300+ TikTok Shop brands
- A creator outreach engine built in-house on the TikTok Shop API: zero to 30,000+ invitations a day in two weeks
- A creator CRM across 80,000+ creators, and a planning tool that cut brand planning from a month to 7 days

**Live site:** https://bellehe01.github.io/

## What is here

| | What it is |
|---|---|
| [Shop check](shop-audit/) | A demo you can run in a phone frame. A seller connects a made-up shop and gets one page: five numbers, the top problem, and what each AI helper found. |
| [A creator outreach engine, built in-house](case-studies/creator-outreach-automation.md) | Zero to 30,000+ invitations a day in two weeks, under 1% failing, and one change I reversed after reading the data. |
| [A content supply funnel, unblocked: 400x](case-studies/effect-supply-funnel.md) | At TikTok, a five-layer pipeline lost almost every effect. I found the layer, proved the cause and fixed it. |
| [An acquisition funnel you can measure](case-studies/acquisition-funnel.md) | One row per brand, every step counted, every new lead claimed with one tap. |
| [A creator growth plan: better hours, not more hours](case-studies/music-creator-growth-plan.md) | A take-home case for TikTok LIVE: five creators, $80,000 and eight weeks to a festival. |
| [Growth teardown: Norton Neo browser](growth-teardowns/norton-neo.md) | Growth as one equation, and three experiments with a counter metric each. |

Also open source: [lark-daily-digest](https://github.com/bellehe01/lark-daily-digest), which reads a team's group chats, sorts them by urgency with an LLM and sends one summary card each morning.

## Run it

The site is plain HTML, CSS and JavaScript, with no build step.

```bash
python3 -m http.server 4173
```

The shop check has tests:

```bash
cd shop-audit && npm test
```

## Contact

[LinkedIn](https://www.linkedin.com/in/beierhe) · [Tableau Public](https://public.tableau.com/app/profile/beier.he/vizzes) · bellehe01@gmail.com
