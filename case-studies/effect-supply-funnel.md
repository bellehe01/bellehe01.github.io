# A content supply funnel, unblocked: 400x

A five-layer pipeline lost almost every effect for six months. I found the layer, proved the cause and fixed it.

- **Role:** project owner, as a product manager intern on the effect creation tools team
- **Timeline:** January to June 2024
- **Where:** TikTok
- **Tools:** SQL, funnel analysis, dashboards, a weekly plan across five teams

## The problem

TikTok effects have two entrances: the shooting page and the editing page. The team had a top-priority project to bring the existing shooting effects over to the editing page. For more than six months, almost nothing came through.

- **Users wanted far more than they got.** Editing effects had nearly 10 times more share of posts than share of supply.
- **The page looked stale.** A test user who opened the editing page saw the same few old effects every time. New, popular effects never arrived.
- **Everyone saw the result. Nobody could say where it broke.** The pipeline crossed five teams, and each team saw only its own layer.

## Before and after

<div class="beforeafter">
<div>

#### Before

- Almost no new effects reach the editing page
- Five layers, and nobody knows which one loses the effects
- One old rule blocks whole popular categories
- Human review is one person

</div>
<div>

#### After

- New and popular effects arrive every day
- Every layer has a measured pass rate and an owner
- Categories open one at a time, after a person reviews a sample
- A review team with a written procedure

</div>
</div>

## What I did

I owned the plan: the diagnosis, the rule changes I proposed, and the weekly schedule across five teams. Engineers on each team built the changes.

Four decisions did most of the work.

### 1. Measure every layer before changing anything

I split the pipeline into its five layers and measured the pass rate of each one:

<div class="chain"><span>Data warehouse picks effects</span><span>Automatic filter</span><span>QA test</span><span>Human review</span><span>Live on the editing page</span></div>

End to end, only a tiny fraction of effects reached users. The automatic filter lost the most.

### 2. Read the rejection reasons, not the totals

I pulled the rejection reasons with SQL and ranked them. One rule did most of the damage: it blocked every effect that "needs a shooting trigger".

Many of those effects did not need one. Popular beauty and makeup effects were the clearest case: high demand, safe on the editing page, and rejected as a whole category. The filter was not strict. It was out of date.

I rewrote the selection rule to keep those categories, and the filter team removed the old rule.

### 3. Measure again, because the bottleneck moves

With the filter fixed, I measured every layer again. Three new limits showed up:

| Layer | What limited it | What changed |
|---|---|---|
| Data warehouse | It sent a fraction of what the shooting page could supply | Intake raised in stages |
| QA test | Memory and frame-rate limits set for a different page | New limits from a memory budget |
| Human review | One reviewer | A review team and a written procedure |

Fix one leak, then measure before you trust the fix.

### 4. Work backward from the target

The daily target, divided by each layer's pass rate, gives the intake the first layer needs. That one line turned an argument about "more work" into a schedule: each change got an owner, a cost in days and a date.

The QA limit came the same way, from a budget and not a guess: the app's safe memory, minus what the editing page already uses, split across the effects a user can stack. A looser limit passes more effects but can make the page lag, so the QA lead, the engineer and I agreed the risk before the change.

## How it works

1. **Pick.** Each day the data warehouse picks the most-used recent effects that fit the editing page.
2. **Check.** The automatic filter, the QA test and a human reviewer each pass or reject an effect, and every rejection is stored with its reason.
3. **Show.** Approved effects go live in two tabs: Trending, ranked like the shooting page, and New, in the order they were approved.

## Results

<div class="bignums">
<div><b>400x</b><span>more usable effects reached the editing page each day.</span></div>
<div><b>12x</b><span>more effects sent into the pipeline each day, raised in stages.</span></div>
<div><b>5</b><span>parties on one plan, from the data warehouse to human review.</span></div>
</div>

Pass rates at the filter and at QA both rose. The figures on this page are relative changes. Internal numbers are left out.

## What I learned

### Where to change came from my data. How to change was engineering's call.

I was an intern asking five teams to change their rules. I did not argue that a change was safe. I showed the list of rejection reasons, then a person reviewed a sample of each blocked category. The question shrank from "is it safe to open the filter?" to "this category, reviewed, is safe". The disagreement went away.

### Turn "should we?" into "at what pace?"

The upstream team worried about the extra load. I showed the backward calculation from the daily target, split it into stages, and gave the cost of each stage. The talk moved from whether to do it to when.

## What I would do next

Two of my findings were still proposals when I left:

1. **Split the list by country.** One global "top effects" list was unfair to smaller markets. A large market filled the list and a small one got a handful.
2. **Read tags, not hint text.** The rule spotted a "shooting trigger" by reading the on-screen hint text, which is not precise. The effect's own parameters and tags say it better.
