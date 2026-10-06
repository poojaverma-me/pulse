import type { Call, HistoryCall, Speaker, Turn } from "./types";

export const SELLER = { name: "Helio", product: "an AI-powered customer support platform (helpdesk, AI triage, reporting)" };

const t = (speaker: Speaker, text: string): Turn => ({ speaker, text });
const R = (text: string) => t("rep", text);
const C = (text: string) => t("client", text);

export const CALLS: Call[] = [
  {
    id: "brightline",
    company: "Brightline Logistics",
    industry: "Logistics",
    contact: { name: "Mark Davies", title: "Head of Customer Operations" },
    rep: "Sarah Collins",
    seats: 40,
    scheduled: "Today · 10:00",
    hue: 205,
    turns: [
      R("Hi Mark, thanks for making time today. I know you've been looking at options for your support team. What prompted the search?"),
      C("Sure. We're a regional freight company with about forty support agents. Our ticket volume doubled since we added same-day delivery, and our current tool just isn't keeping up."),
      R("That's a big jump. When you say it isn't keeping up, is it the routing, the reporting, or something else?"),
      C("Mostly routing. Tickets sit in a general queue for hours. Drivers call in, customers email, and nobody knows who owns what."),
      R("Helio auto-routes every ticket by intent and urgency in under a second, so a missed delivery goes straight to your dispatch team instead of the general queue."),
      C("That sounds great, honestly. But I'll be upfront, budget is tight this year. What does something like this cost for forty seats?"),
      R("For forty agents on our Growth plan you'd be looking at about seventy-nine dollars per agent per month."),
      C("Hmm. That's quite a bit more than we pay now. We're at around fifty dollars a seat. I'm not sure I can justify a fifty percent increase to our CFO."),
      R("That's completely fair. Can I ask what a delayed ticket costs you today, in refunds or lost accounts?"),
      C("We credited about thirty thousand dollars in late-delivery refunds last quarter. A lot of that was slow responses, not actual late trucks."),
      R("So if faster routing cut even a third of those credits, the platform pays for itself. We could also start you on annual billing at sixty-four per seat and lock that price for two years."),
      C("Sixty-four with a two-year lock. That's a different conversation. Would that include the dispatch integration?"),
      R("Yes, the dispatch and SMS integrations are included, and onboarding is free on annual plans."),
      C("Okay. I'd need to show the CFO the refund math, but I'm the one who signs off on tooling for support."),
      R("Perfect. I'll send a one-page ROI summary with your refund numbers today. Could we aim to have the agreement signed by the end of the month?"),
      C("If the numbers hold up, yes. Let's put thirty minutes on the calendar for Thursday to finalize."),
      R("Great, I'll send the invite for Thursday at ten. Thanks, Mark."),
      C("Thanks, Sarah. Looking forward to it."),
    ],
  },
  {
    id: "northgate",
    company: "Northgate Health",
    industry: "Healthcare",
    contact: { name: "Laura Bennett", title: "Director of Patient Services" },
    rep: "James Porter",
    seats: 25,
    scheduled: "Today · 11:30",
    hue: 160,
    turns: [
      R("Good morning, Laura. Thanks for joining. I understand Northgate is rolling out a new patient support line?"),
      C("Yes, we're consolidating three clinic hotlines into one patient services team. About twenty-five staff."),
      R("What matters most to you in a support platform for patients?"),
      C("Honestly, before anything else, security. We handle protected health information. If you can't sign a BAA and show HIPAA compliance, we can't go any further."),
      R("Understood. We sign BAAs, we're HIPAA compliant and SOC 2 Type II certified, and all patient data is encrypted at rest and in transit."),
      C("Good. Where is the data hosted? Our compliance team will definitely ask about data residency."),
      R("All data stays in US regions, and you can restrict it to a single region. We can share our full security package with your team."),
      C("That would help. My other concern is reliability. If the system goes down, patients can't reach us about urgent things."),
      R("We guarantee 99.95% uptime with a financially backed SLA, and urgent messages can automatically escalate to a phone callback."),
      C("The escalation piece is interesting. How does it decide what's urgent?"),
      R("It classifies each message. Medication issues or post-surgery symptoms get flagged urgent and routed to a nurse queue immediately."),
      C("That could really help our nurses. But I can't make this decision alone. Our CIO and the compliance officer have to approve any new vendor."),
      R("Of course. Would it help if we ran a sixty-day pilot with one clinic, so your CIO can see it working with real tickets?"),
      C("A pilot would make this much easier to approve. Price is less of a concern for us than getting the security review right."),
      R("Then let's start with the security review. I'll send our documentation today and set up a call with your compliance officer next week."),
      C("That works. Send it to me and I'll forward it. If compliance signs off, we can start the pilot in November."),
      R("Excellent. Thanks, Laura. Talk soon."),
    ],
  },
  {
    id: "corvex",
    company: "Corvex Retail",
    industry: "E-commerce",
    contact: { name: "Daniel Shaw", title: "Support Manager" },
    rep: "Emily Hart",
    seats: 30,
    scheduled: "Today · 14:00",
    hue: 15,
    turns: [
      R("Hi Daniel, thanks for taking the call. You downloaded our guide on reducing ticket backlog. What's going on at Corvex?"),
      C("We're an online furniture retailer. We use Deskly today, and it's fine, but our renewal is coming up so I'm looking around."),
      R("Got it. What would you want to be better than it is today?"),
      C("Mostly cost. Deskly raised prices again, and leadership wants us to cut software spend by twenty percent."),
      R("Helio includes AI triage and reporting that most teams pay extra for elsewhere. For thirty agents you'd be around seventy-nine per agent."),
      C("Seventy-nine is actually more than Deskly, even after their increase. We pay sixty-five."),
      R("I understand. The difference is the automation. Teams typically resolve thirty percent more tickets without adding headcount."),
      C("Maybe, but our volume is flat. We're not trying to grow the team, we're trying to spend less."),
      R("Would a smaller starting plan help? We have an Essentials tier at forty-nine per agent."),
      C("What do I lose on Essentials?"),
      R("The AI triage and advanced reporting. You'd keep the shared inbox, macros, and the help center."),
      C("Then it's basically what we have now, and we'd have to migrate everything. Migration alone would take my team weeks."),
      R("We do offer free migration assistance from Deskly. Our team handles the whole import."),
      C("That's helpful, but honestly, Deskly just offered us a two-year renewal at a discount. It's hard to argue for switching."),
      R("Would it be worth a side-by-side trial before you sign?"),
      C("I don't think we have the bandwidth right now. Let's stay in touch and maybe revisit next year."),
      R("Understood, Daniel. I'll check back before your next renewal."),
      C("Sounds good. Thanks, Emily."),
    ],
  },
  {
    id: "lumen",
    company: "Lumen Studios",
    industry: "Gaming",
    contact: { name: "Olivia Grant", title: "Head of Player Support" },
    rep: "Sarah Collins",
    seats: 50,
    scheduled: "Today · 15:30",
    hue: 280,
    turns: [
      R("Hi Olivia! Thanks for jumping on. Your team mentioned you're launching a new game next month?"),
      C("Yes! Our biggest launch yet. We're expecting player support volume to triple in launch week, and our current setup won't survive it."),
      R("Congratulations. What does a great launch week look like for your players?"),
      C("Fast, friendly answers. Players are passionate. If they wait two days for a reply, they go straight to social media. Quality of support is everything for us."),
      R("Helio's AI drafts replies in your brand voice, and it answers the most common questions instantly, like account recovery or refund status."),
      C("Can it handle different languages? A third of our players are in Brazil, Germany and Japan."),
      R("Yes, it detects the language automatically, and your agents can reply in English while players see their own language."),
      C("That would be huge. And we need it live before launch. We have about three weeks."),
      R("Our typical setup for a team your size is ten days, and we can assign a dedicated launch engineer."),
      C("Love that. What about pricing for around fifty agents, plus seasonal contractors?"),
      R("Fifty seats on Growth at seventy-nine each, and contractor seats are flexible month to month, so you only pay during launch."),
      C("That's reasonable. Honestly, the cost of a bad launch is way higher than the software."),
      R("Agreed. Are you the person who signs off, or is anyone else involved?"),
      C("It's my budget. I just need to loop in our security lead for a quick review, but that's a formality."),
      R("Then I'll send the order form and our security summary today, and we can kick off setup on Monday."),
      C("Let's do it. Monday works."),
      R("Fantastic. Welcome aboard, Olivia!"),
    ],
  },
  {
    id: "atlas",
    company: "Atlas Credit Union",
    industry: "Financial services",
    contact: { name: "Thomas Reed", title: "VP of Member Operations" },
    rep: "James Porter",
    seats: 20,
    scheduled: "Tomorrow · 09:30",
    hue: 40,
    turns: [
      R("Hi Thomas, thanks for your time. You mentioned your support team is struggling with response times?"),
      C("Yes. We're a mid-sized credit union. Members wait almost a day for email replies, and complaints are going up."),
      R("What have you tried so far?"),
      C("We added two agents last year, but volume keeps growing. I think we need better tooling, not more people."),
      R("That's exactly where Helio helps. AI triage handles balance questions and card freezes automatically, so agents can focus on complex issues."),
      C("That sounds right. Our members would love faster answers."),
      R("For your team of twenty, you'd be at around seventy-nine per agent, with onboarding included."),
      C("The price itself isn't crazy. The problem is timing. Our budget for this year was locked in January, and there's nothing left for new software."),
      R("Is there any flexibility, maybe a smaller pilot funded from operations?"),
      C("Not really. Every vendor over five thousand dollars goes through the board, and they just froze discretionary spending until next fiscal year."),
      R("When does the next fiscal year start?"),
      C("July. Planning starts in April, so that's when I could put it in the budget."),
      R("Would it help if I put together a business case you could bring to April planning?"),
      C("Maybe. Honestly, I'm not sure it'll be a priority over our core banking upgrade. That project is eating most of the budget."),
      R("Understood. I'll send the business case anyway, and check in with you in March."),
      C("Fine, but I can't promise anything. Thanks for your time."),
    ],
  },
];

export const CALL_BY_ID = Object.fromEntries(CALLS.map((c) => [c.id, c]));

/** Seconds a turn takes to say out loud (~2.7 words/s) plus a short pause. */
export const turnSeconds = (turn: Turn) => turn.text.split(/\s+/).length / 2.7 + 0.8;

/* ───────────── 30 days of call history for the library ───────────── */

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const COMPANIES = [
  ["Harbourview Hotels", "Hospitality"], ["Kestrel Insurance", "Financial services"], ["Maple & Co", "E-commerce"], ["Orbit Telecom", "Telecom"],
  ["Summit Outdoor", "E-commerce"], ["Riverside Clinics", "Healthcare"], ["Foxglove Software", "SaaS"], ["Granite Bank", "Financial services"],
  ["Bluebird Airlines", "Travel"], ["Cobalt Energy", "Utilities"], ["Willow Pet Supplies", "E-commerce"], ["Ironclad Security", "SaaS"],
  ["Meridian Property", "Real estate"], ["Oakridge University", "Education"], ["Puffin Games", "Gaming"], ["Silverline Couriers", "Logistics"],
  ["Thornbury Foods", "Retail"], ["Vantage Fitness", "Consumer"], ["Westbrook Council", "Public sector"], ["Zephyr Mobility", "Travel"],
  ["Ashford Legal", "Professional services"], ["Beacon Pharmacy", "Healthcare"], ["Crescent Media", "Media"], ["Driftwood Rentals", "Travel"],
  ["Elmstead Insurance", "Financial services"], ["Fairway Golf", "Consumer"], ["Glenmore Water", "Utilities"], ["Highgate Schools", "Education"],
  ["Juniper Health", "Healthcare"], ["Lighthouse Software", "SaaS"], ["Marlow Fashion", "E-commerce"], ["Nightingale Care", "Healthcare"],
  ["Pembroke Motors", "Automotive"], ["Quayside Logistics", "Logistics"], ["Redwood Analytics", "SaaS"], ["Stonegate Pubs", "Hospitality"],
] as const;
const CONTACTS = ["Rachel Stone", "Peter Walsh", "Hannah Price", "George Mills", "Sophie Turner", "Andrew Lane", "Lucy Ford", "Michael Grant", "Emma Hayes", "Oliver Brooks", "Charlotte Kerr", "William Barnes"];
const REPS = ["Sarah Collins", "James Porter", "Emily Hart", "Ryan Fletcher"];
const PRIORITIES = ["Price / budget", "Service quality", "Speed to launch", "Security & compliance", "Integrations", "Features"];
const DROPOFFS = ["Price too high", "Chose a competitor", "No budget this cycle", "No decision-maker buy-in", "Missing feature", "Bad timing"];

function makeHistory(): HistoryCall[] {
  const r = rng(20261003);
  const out: HistoryCall[] = COMPANIES.map(([company, industry], i) => {
    const rep = REPS[Math.floor(r() * REPS.length)];
    const repSkill = { "Sarah Collins": 0.18, "James Porter": 0.05, "Emily Hart": -0.05, "Ryan Fletcher": 0 }[rep] ?? 0;
    const conversion = Math.max(0.03, Math.min(0.97, r() * 0.9 + repSkill));
    const outcome: HistoryCall["outcome"] = conversion > 0.62 ? "Won" : conversion > 0.38 ? "Follow-up" : "Lost";
    const priority = PRIORITIES[Math.floor(Math.pow(r(), 1.3) * PRIORITIES.length)];
    const dropoff =
      outcome === "Won"
        ? null
        : priority === "Price / budget" && r() < 0.7
          ? "Price too high"
          : DROPOFFS[Math.floor(r() * DROPOFFS.length)];
    const day = 1 + Math.floor(r() * 29);
    const d = new Date(2026, 8, day, 9 + Math.floor(r() * 8), r() < 0.5 ? 0 : 30);
    return {
      id: `h${i}`,
      company,
      industry,
      contact: CONTACTS[Math.floor(r() * CONTACTS.length)],
      rep,
      date: d.toISOString(),
      minutes: 12 + Math.floor(r() * 34),
      outcome,
      priority,
      dropoff,
      conversion,
      sentiment: Math.max(0, Math.min(4, conversion * 3.2 + r() * 1.2)),
    };
  });
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export const HISTORY: HistoryCall[] = makeHistory();
