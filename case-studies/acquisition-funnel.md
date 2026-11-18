# An acquisition funnel you can measure

Every new brand in one row, every step counted, every new lead owned from the first form.

- **Role:** product owner and main builder for the stage model, funnel report and lead card
- **Timeline:** October to November 2026
- **Where:** a TikTok Shop agency serving 300+ e-commerce brands
- **Tools:** Claude Code, SQL, Lark Open API, GitHub

## The problem

![Four-panel comic. / 1. A manager asks: "Where do new brands drop out?" The team: "...No idea." / 2. A "New lead!" message scrolls away in a busy group chat. "Hello? Anyone?" / 3. Belle and a robot helper: "One row per brand. One button: I'll take it." / 4. A funnel on the whiteboard, one step circled. "This step loses the most. We test here first."](../images/comics/funnel.png)

The agency started to win clients through a self-serve funnel. A brand clicks an ad, fills in a form, connects its TikTok Shop, gets a free AI shop check, books a call and buys a paid consultation.

The funnel existed. The record of it did not:

- **Brands came in through seven forms.** Each form kept its own idea of "status", and the same brand appeared more than once.
- **Sales saw a brand late.** A lead reached the sales pipeline only after the brand booked a call or paid. A brand that signed without a booked call had no lead at all.
- **A new lead was one line in a busy group chat:** a name, an email, a source. The brand's answers arrived 30 seconds to 46 minutes later and never reached the team.
- **Several steps were not recorded anywhere,** so nobody could count them.

Two questions had no answer:

1. **Where do brands drop out?** Every step from form to contract, counted the same way on every screen.
2. **Who owns a new lead, and how fast do they reach it?** The target, set by leadership, was first human contact within 10 business minutes.

## Before and after

<div class="beforeafter">
<div>

#### Before

- Seven forms, seven ideas of "status"
- Sales sees a brand after it books or pays
- No lead is given an owner by the system
- 242 follow-up alerts fail in 17 hours
- Nobody can say which step loses brands

</div>
<div>

#### After

- One row per brand, one stored stage
- Sales sees a brand from the first form
- Every real lead has an owner at creation
- Follow-up alerts send
- A 16-step report shows the drop at each step

</div>
</div>

## What I did

I set the requirements, checked production data before each change and wrote most of the changes with AI coding agents. Another developer built the first version of the prospects screen. Each of my changes went through engineering review before it merged.

Six decisions did most of the work.

### 1. One row per brand, from the first form

Every form now creates a sales lead at once. A rule table works out one stored stage per lead, and the furthest matching stage wins. The stage is recomputed on every event, so no stage change depends on a person remembering.

### 2. A funnel report with 16 steps

The report follows three paths: shop, call and consultation. Each step shows two numbers: percent of all forms, and percent of the previous step. A step that nothing records yet shows "not recorded yet", not a zero.

The second number is the useful one. It points to the single step that loses the most brands, which is where the next experiment belongs.

### 3. One lead card that updates itself

Each new lead posts one card in the team chat, with what the brand told us, a status tag and an owner. The card updates as the lead moves, so the team reads one message, not a thread. Anyone can take the lead with one tap on "I'll take it".

### 4. Two repairs in production

A teammate had built an owner rotation and a follow-up alert. I read production and found that neither one worked:

- **The rotation had never assigned anyone.** Its settings named two people by ids that did not exist in the chat app. I changed the lookup to email, and extended it from one form to every form.
- **The alert had failed 242 times in 17 hours.** It sent its message inside an open database lock, which the message sender refuses. I moved the send outside the lock.

### 5. Count only real brands and real clicks

Two things inflated the numbers, and I removed both:

- **Test leads.** They are flagged when they are created. They get no owner, no deadline and no messages, and they are left out of every count.
- **Clicks that no person made.** Email security tools open every link the moment a message arrives. The report had counted those as brands clicking. Now a click counts only when it comes from a browser, at least a minute after the email went out.

### 6. One record of "first contact"

Sales recorded a contact in 12 different places, and each report read a different one. In one two-week sample, 15 of 16 new leads showed no contact anywhere. The ad platforms had never received a single "this lead was good" signal, so they had nothing to learn from.

I made one writer for first contact. A call, a text, an email or a status change all write the same record, with who and how.

## How it works

1. **The lead arrives.** Any form creates one row, one stage and one card in the team chat.
2. **Someone owns it.** The lead has an owner at once. Anyone can take it with one tap, and the team gets an alert if nobody makes contact in time.
3. **The stage moves by itself.** Shop connected, call booked, paid: the system records each one, and the report counts it.

## Results

<div class="bignums">
<div><b>7 to 1</b><span>seven forms now feed one list, with one row per brand.</span></div>
<div><b>16</b><span>funnel steps counted, each against the step before it.</span></div>
<div><b>0 to all</b><span>new leads with an owner at creation. Before, the system assigned none.</span></div>
</div>

What this page does not claim: a lift in conversion. The funnel became measurable in October. The first experiment on the weakest step is the next piece of work.

## What I learned

### A number that waits for a person to click is not a number

The first report showed far fewer calls held than calls booked. The calls happened. After each call, someone had to mark it as held, and people are busy and forget. I had built a careful count on top of a step that depended on memory. Now I ask one question about every number first: does the system record this, or does a person? If it is a person, I look for a way to let the system do it.

### Switched on is not the same as working

The rotation and the alert were both live, and both had been silent since the day they shipped. Nobody noticed, because a missing message looks like a quiet day. I found both by reading production data, not the code. The lesson: check a new feature the day after it ships. Did it do the thing, how many times, for whom?

## What I would do next

1. Record "call held" from the meeting itself, not from a click.
2. Measure time to first contact per lead, and report it against the 10-minute target.
3. Read the "percent of the previous step" column and find the largest drop.
4. Change one thing at that step, with the variant recorded on the lead, and check a counter metric so a gain in one step does not hide a loss in the next.
