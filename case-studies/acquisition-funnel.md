# An acquisition funnel you can measure

Every new brand in one row, every step counted, every new lead claimed with one tap.

- **Role:** product owner and main builder for the stage model, funnel report and lead hand-off
- **Timeline:** October to November 2026
- **Where:** a TikTok Shop agency serving 300+ e-commerce brands
- **Tools:** Claude Code, SQL, Lark Open API, GitHub

## The problem

![Four-panel comic. / 1. A manager asks: "Where do new brands drop out?" The team: "...No idea." / 2. A "New lead!" message scrolls away in a busy group chat. "Hello? Anyone?" / 3. Belle and a robot helper: "One row per brand. One button: I'll take it." / 4. A funnel on the whiteboard, one step circled. "This step loses the most. We test here first."](../images/comics/funnel.png)

The agency started to win clients through a self-serve funnel. A brand clicks an ad, fills in a form, connects its TikTok Shop, gets a free AI shop check, books a call and buys a paid consultation.

The funnel existed. Two questions had no answer:

- **Where do brands drop out?** Leads came in through 5 channels. Each channel kept its own idea of "status", and the same brand appeared more than once.
- **How fast does a person contact a new lead?** A new lead was one message in a busy group chat.

## Before and after

<div class="beforeafter">
<div>

#### Before

- 5 channels, 5 ideas of "status"
- The same brand appears more than once
- Nobody can say which step loses brands
- A new lead waits until someone notices it

</div>
<div>

#### After

- One row per brand, one stored stage
- Every screen and report reads the same stage
- A 16-step report shows the drop at each step
- A lead card with one button, and an owner within minutes

</div>
</div>

## What I did

### 1. One stored stage per lead

A rule table works out the stage, and the furthest matching stage wins. One row per brand, with a guard against duplicates.

### 2. A 16-step funnel report

The report follows three paths: shop, call and consultation. Each step shows two numbers: percent of all forms, and percent of the previous step. A user can filter by period, by channel and by ad source.

The second number is the useful one. It points to the single step that loses the most brands, which is where the next experiment belongs.

### 3. A lead card the team claims with one tap

The target is first human contact within 10 business minutes. Each new lead posts one card in the team chat. The card updates itself as the lead moves, so the team reads one message, not a thread.

### 4. Clean counts

Test leads are flagged when they are created. They get no deadline and no messages, and they are left out of every count. Without this, every test of the funnel would have changed the conversion numbers.

### 5. AI drafts, people decide

- When a call is booked, an LLM writes a call brief. Code then overwrites the shop numbers from the database, so the model cannot invent them.
- An LLM summarises the notes on a lead. A person's edit is never overwritten unless someone asks for a refresh.
- An agent in the team chat answers questions about a lead. It can read, not write.

## How it works

1. **The lead arrives.** One form creates one row and one card.
2. **Someone owns it.** A person taps "I'll take it". Until then the lead has an automatic owner, and the team gets an alert if nobody makes contact within 10 business minutes.
3. **The stage moves by itself.** Shop connected, call booked, paid: the system records each one, and the report counts it.

## Results

<div class="bignums">
<div><b>5 to 1</b><span>five channels now feed one list, with one row per brand.</span></div>
<div><b>16</b><span>funnel steps counted, each against the step before it.</span></div>
<div><b>10 min</b><span>target for first human contact, in business hours.</span></div>
</div>

Another developer built the first version of the prospects screen. I built the stage model, the board, the funnel and calls views, the lead card and test-lead isolation. A teammate set the 10-minute target and built the first follow-up alert and owner rotation. I repaired both when they stopped working in production. Each change went through engineering review before it merged.

## What I learned

### A number that waits for a person to click is not a number

The first report showed far fewer calls held than calls booked. The calls happened. After each call, someone had to mark it as held, and people are busy and forget. I had built a careful count on top of a step that depended on memory. Now I ask one question about every number first: does the system record this, or does a person? If it is a person, I look for a way to let the system do it.

## What I would do next

1. Record "call held" from the meeting itself, not from a click.
2. Read the "percent of the previous step" column and find the largest drop.
3. Change one thing at that step, with the variant recorded on the lead.
4. Compare the two variants, and check a counter metric (for example, call no-show rate) so a gain in one step does not hide a loss in the next.
