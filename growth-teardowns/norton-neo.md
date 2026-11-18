# Growth teardown: Norton Neo browser

- **What this is:** an outside view of how I would model and test growth for Neo, the browser from Norton.
- **What I looked at:** the public landing page at neobrowser.ai, on 17 November 2026.
- **What I did not have:** any internal data. Every rate below is something to measure, not something I know.

## 1. Growth as one equation

A browser wins when people keep it as their default. So I would count this:

> **Weekly active users who have Neo as their default browser**

It breaks into steps that multiply:

<div class="chain"><span>Reach: ads, content, UGC, SEO, community</span><span>Landing page visit</span><span>Click Download</span><span>Install complete</span><span>First launch</span><span>First visible value: ad blocked, tracker report, VPN on, AI answer</span><span>Import data and set as default</span><span>Still active on day 1, 7, 30</span><span>Tells someone, which feeds Reach again</span></div>

| Step | Rate to measure | Counter metric |
|---|---|---|
| Visit to download click | by channel and by landing variant | bounce rate |
| Download to install complete | by operating system | install errors |
| Install to first launch | same day | none |
| First launch to first visible value | within the first session | time to first value |
| First value to set as default | within day 1 | prompt dismissals, day-1 uninstalls |
| Default to retained | day 7 and day 30 | switches back to the old default |
| Retained to referral | shares per active user, installs per share | none |

Because the steps multiply, the weakest step limits the whole chain. The first job is to find it.

## 2. What the landing page does today

Facts from the page:

- **One promise:** security. The headline says the web is not built to protect you, and Neo is.
- **One action:** a "Download now" button at the top and again at the bottom.
- **Three separate products inside one page:** an ad and tracker blocker, a built-in VPN (with a streaming angle), and private AI.
- **Proof:** a third-party anti-phishing test and a table that compares data handling across AI assistants.
- **One interactive piece:** a 4-question check about where AI conversations go.
- **A careful footnote:** the anti-phishing test covered a different Norton browser that shares the same detection technology.

My reading: the page serves a visitor who already wants "a safer browser". A visitor who clicked an ad about streaming abroad, or about private AI, has to scroll to find their reason.

## 3. Three experiments

### Experiment 1: match the page to the reason for the click

- **Hypothesis:** a visitor converts better when the first screen repeats the reason they clicked.
- **Change:** three landing variants with the same product and a different opening: block ads, VPN, private AI. Route each ad group and each search intent to its variant.
- **Primary metric:** download click rate, then install completion, per variant.
- **Counter metric:** day-7 retention per variant. A VPN-first page may bring people who want a free VPN and never browse.
- **Decision rule:** keep a variant only if it wins on installs and does not lose on day-7 retention.

### Experiment 2: ask for "default" after the first visible value

- **Hypothesis:** people agree to set a default browser after they have seen it do something for them, not before.
- **Change:** show a small count in the first session ("12 ads and 31 trackers blocked on this page"), then ask to set Neo as default.
- **Primary metric:** share of new users who set Neo as default within day 1.
- **Counter metric:** prompt dismissals and day-1 uninstalls.
- **Why this step:** it is the step that turns an install into a habit.

### Experiment 3: turn two existing assets into a loop

- **Hypothesis:** people share a result about themselves more than they share a product.
- **Change A:** the 4-question AI privacy check ends with a result card that is easy to post.
- **Change B:** the weekly protection report gets a share option ("blocked 1,240 trackers this week").
- **Primary metric:** shares per active user, and installs per share.
- **Counter metric:** share of users who turn the report off.

## 4. Which parts an agent can run

| Work | Agent | Person |
|---|---|---|
| Draft landing and ad variants for each intent | drafts | approves every security claim |
| Watch the funnel daily and flag the weakest step | does it | sets the alert thresholds |
| Write the weekly experiment readout | drafts with the numbers and their source | decides ship, repeat or stop |
| Answer community questions | drafts | sends |

The rule I use in my own work: an agent drafts and reads; a person approves anything that goes out. The footnote on the anti-phishing claim shows why. A wrong security claim costs more than a slow one.

## 5. What I would need on day one

- Events for each step in section 1, with channel, campaign and landing variant attached to the install.
- One table with one row per install, so every report reads the same numbers.
- Test installs flagged at creation and kept out of every count.

I built the same three things for an acquisition funnel at work: [case study](../case-studies/acquisition-funnel.md).
