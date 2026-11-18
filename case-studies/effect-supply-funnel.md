# A content supply funnel, unblocked: 400x

A five-layer pipeline lost almost every effect. I found the layer, proved the cause and fixed it.

- **Role:** project owner, as a product manager intern on the effect creation tools team
- **Timeline:** January to June 2024
- **Where:** TikTok
- **Tools:** SQL, funnel analysis, dashboards, a weekly plan across five teams

## Background

TikTok effects have two entrances: the shooting page and the editing page. The team had a top-priority project to bring the existing shooting effects over to the editing page.

For more than six months, almost nothing came through.

- **Users wanted far more than they got.** Editing effects had nearly 10 times more share of posts than share of supply.
- **The page looked stale.** A test user who opened the editing page saw the same few old effects every time. New, popular effects never arrived.
- **Everyone saw the result. Nobody could say where it broke.** The pipeline crossed five teams, and each team saw only its own layer.

## Goal

Find where the pipeline loses effects, fix that layer, and get a steady daily supply of new and popular effects onto the editing page.

## What I did

### 1. Measure every layer

I split the pipeline into its five layers and measured the pass rate of each one:

<div class="chain"><span>Data warehouse picks effects</span><span>Automatic filter</span><span>QA test</span><span>Human review</span><span>Live on the editing page</span></div>

End to end, only a tiny fraction of effects reached users.

### 2. Find the largest leak

One layer lost most of the volume: the automatic filter. That told me where to look. It did not yet tell me why.

### 3. Prove the cause

I pulled the rejection reasons with SQL and ranked them. The largest rule blocked effects that "need a shooting trigger". Many of the effects it blocked did not need one. Popular beauty and makeup effects were the clearest case: high demand, safe on the editing page, and rejected as a whole category.

So the filter was not strict. It was out of date.

### 4. Change one layer at a time

- **Selection and filter rules.** Keep the popular categories that were wrongly blocked. Open each other category only after a person reviewed a sample of it.
- **QA thresholds.** Adjust the memory and frame-rate limits that failed effects which ran well.
- **Human review.** Grow the review capacity and train the reviewers, so the last layer can take the new volume.
- **Intake.** I worked backward from the daily target: target, divided by each layer's pass rate, gives the intake the first layer needs. Then I raised intake in three stages, not in one jump.

### 5. Watch the numbers

A dashboard tracked the conversion of each layer and the accuracy of human review, so a gain in volume could not hide a loss in quality.

### 6. Decide what comes next

Two findings came out of the first rounds, and I raised both:

- One global "top effects" list was unfair to smaller markets. A large market filled the list and a small one got a handful. I proposed a split by country.
- The rule spotted a "shooting trigger" by reading the on-screen hint text, which is not precise. I proposed reading the effect's own parameters and tags.

## Results

<div class="bignums">
<div><b>400x</b><span>more usable effects reached the editing page each day.</span></div>
<div><b>12x</b><span>more effects sent into the pipeline each day, raised in three stages.</span></div>
<div><b>5</b><span>parties on one plan, from the data warehouse to human review.</span></div>
</div>

Pass rates at the filter and at QA both rose. The editing page got new and popular effects every day, after six months of nearly none.

The figures on this page are relative changes. Internal numbers are left out.

## Retrospective

### Where to change came from my data. How to change was engineering's call.

I was an intern asking five teams to change their rules. I did not argue that a change was safe. I showed the list of rejection reasons, then a person reviewed a sample of each blocked category. The question shrank from "is it safe to open the filter?" to "this category, reviewed, is safe". The disagreement went away.

### Turn "should we?" into "at what pace?"

The upstream team worried about the extra load. I showed the backward calculation from the daily target, split it into stages, and gave the cost of each stage. The talk moved from whether to do it to when.

### What stayed a proposal

Two of my findings were proposals, not shipped changes: the split by country, and the move from hint text to tags. This page does not count them as results.
