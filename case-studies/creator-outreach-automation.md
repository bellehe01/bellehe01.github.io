# A creator outreach engine, built in-house

From zero to 30,000+ invitations a day in two weeks.

- **Role:** product owner and main builder
- **Timeline:** two weeks, November 2026
- **Where:** a TikTok Shop agency serving 300+ e-commerce brands
- **Tools:** Claude Code, TikTok Shop API, SQL, GitHub

## The problem

![Four-panel comic. / 1. An account manager: "Our creator list lives in someone else's tool. And we pay for it." / 2. Belle's first version: a wall of red crosses. "Failed. Failed. Failed. But why?" / 3. Belle and a robot helper read a long receipt. "Save the exact answer every time. Then fix what it says." / 4. A chart climbs. "30,000 invitations today. Under 1% failed."](../images/comics/outreach.png)

The agency invites creators to promote its clients' products. That outreach ran through an outside tool, and our own version did not work yet: on the one pilot shop, more invitations failed than succeeded, and no failure came with a reason.

I built our own engine directly on the TikTok Shop API. Three reasons:

- **Cost.** No more monthly subscription for something we were able to build.
- **Confidentiality.** Client and creator data stays inside our own system, not in another company's.
- **A data moat.** Every send and every answer lands in our own database of 80,000+ creators. That record is ours to learn from. With a rented tool, it belongs to the vendor.

## Before and after

<div class="beforeafter">
<div>

#### Before

- Outreach runs in an outside tool
- 1 pilot shop on our platform
- More failures than successes
- Nobody knows why an invitation failed

</div>
<div>

#### After two weeks

- Outreach runs on our own platform
- 30+ shops
- Under 1% of invitations fail
- Every failure is stored with TikTok's exact reason

</div>
</div>

## What I did

I set the requirements, reviewed every plan, checked production data before each merge and wrote most of the changes with AI coding agents: about 150 in two weeks. Each change went through engineering review before it merged.

Four decisions did most of the work.

### 1. Send first, and record the exact answer

Failed invitations had no reason attached. I had the system store TikTok's answer word for word. Every later decision came from reading those answers.

### 2. One job per shop

A single job worked through every shop in turn, and one pass took 48 minutes. I gave each shop its own job. A slow shop no longer holds up the others.

### 3. Fifty creators per invitation

We sent one creator per invitation. The API accepts 50. Grouping them means the same quota reaches far more creators.

### 4. A change I reversed

Several features share one TikTok rate limit. I raised the outreach share from 20% to 30% to send faster. One day later I read the data:

| | Share at 20% | Share at 30% |
|---|---|---|
| Rate-limit errors | 0.22% | 0.56% |
| Time saved per send | | 0.4 seconds |

Errors more than doubled for a 0.4-second gain. I put the share back to 20%.

## How it works

1. **A person sets the rule.** Which creators, which product, what message. Outreach that an AI agent proposes needs a person's approval first.
2. **The system sends.** One job per shop, 50 creators per invitation, inside the shared rate limit.
3. **The system keeps score.** It stores every answer, counts sends and failures each day, and raises an alarm when a deploy changes the numbers.

## Results

<div class="bignums">
<div><b>30,000+</b><span>invitations a day, up from zero. The best days reach 50,000.</span></div>
<div><b>30+</b><span>shops running on it, up from one pilot shop.</span></div>
<div><b>&lt;1%</b><span>of invitations fail. At the start, most did.</span></div>
</div>

These numbers count invitations sent, not replies. Reply rate is the next thing to measure. A teammate shipped the change that opened the system to every shop.

## What I learned

### My users should not be my alarm

On 13 November the failure rate jumped to 12%. Account managers noticed before I did. I had opened the system to every shop without an automatic check on the numbers. Now an alarm compares sending before and after every deploy. Next time the alarm comes before the rollout, not after.

### The safety net needs a test too

The 12% came from the fallback, not the main path. When TikTok refused a group of 50, the system resent each creator alone. TikTok counts invitations, so one bad creator used the weekly quota about 50 times faster. I had tested the path where things work. The fix splits a refused group in half, again and again, until it finds the one bad creator.

### Faster is not better until the data says so

I was sure a bigger share of the rate limit would help. It saved 0.4 seconds per send and more than doubled the errors. I only know that because I looked the next day. Now every "obvious" speed-up gets a number to beat and a date to check it.

## What I would do next

People write the invitation text today. The next step is to let an LLM draft a different message for each creator from what the database knows about them, then test it against the human-written version on reply rate.
