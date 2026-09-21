// A plain-English walkthrough of how a meeting actually runs, written for this
// app rather than copied from anywhere. The parliamentary sections describe the
// procedure in Robert's Rules of Order Newly Revised (12th ed.) in our own
// words; the HOSA sections are drawn from the official ILC event guidelines
// dated August 2025 (see HOSA_SOURCE below) — always re-check them against the
// current year's guidelines, and against your own state's, which can differ.

export const HOSA_SOURCE = {
  label: 'HOSA Parliamentary Procedure ILC Guidelines, August 2025',
  url: 'https://hosa.org/wp-content/uploads/2025/09/25-26-PP-Aug31.pdf',
}

export const GUIDE_PARTS = [
  { id: 'meeting', label: 'How a meeting runs' },
  { id: 'hosa', label: 'The HOSA demonstration' },
]

export const MEETING_GUIDE = [
  {
    id: 'why-rules',
    part: 'meeting',
    title: 'Why the rules exist at all',
    paragraphs: [
      'Strip away the vocabulary and parliamentary procedure is one idea: a group of people can only decide something together if they agree in advance on how they will take turns. Without that agreement the loudest person wins, the same argument gets made four times, and nobody is ever quite sure what was decided. The rules are the agreement. They are not there to catch people out, and a meeting where everyone is hunting for technicalities is a meeting that has misunderstood them.',
      'Nearly every rule you will study protects one of four interests at once: the right of the majority to decide, the right of the minority to be heard, the right of each individual member to participate, and the right of members who are absent to not have things sprung on them behind their backs. When you cannot remember what a rule is, you can usually reason your way back to it by asking which of those four it is protecting. That is why a two-thirds vote is needed to cut off debate — you are taking a right away from the minority — and why a motion that was already decided cannot simply be brought up again an hour later by whoever stayed latest.',
      'One more principle runs through everything: one thing at a time. The assembly considers a single question, disposes of it, and moves on. Almost all of the complicated-looking machinery — precedence, secondary motions, what is in order when — is bookkeeping for that one rule.',
    ],
  },
  {
    id: 'before-gavel',
    part: 'meeting',
    title: 'Before the gavel: who is in the room',
    paragraphs: [
      'A meeting needs a presiding officer, a secretary, and a quorum. The presiding officer — the president, or whoever is chairing — runs the meeting but does not run the organization from the chair: they recognize speakers, state motions, keep debate in order, take votes, and announce results. The chair stays impartial while presiding, which is why a chair who badly wants to argue for something will usually step aside and let the vice president take over until that item is finished. The secretary keeps the minutes and is the custodian of the records, and if the chair is absent and there is no vice president, it is the secretary who calls the meeting to order long enough to elect a chair for that meeting.',
      'A quorum is the minimum number of members who have to be present for the group to act at all. If the bylaws do not set one, the default in Robert’s Rules is a majority of the members. Anything the group "decides" without a quorum is not a decision — which is why establishing a quorum is one of the first things a chair does, and why it is worth saying out loud even when everyone can see the room is full.',
      'The other thing that exists before the meeting is the order of business: the list of what will be taken up, and in what sequence. An organization can adopt an agenda for a particular meeting, but most groups simply use the standard order of business, which is the backbone of the next section. Knowing the order matters more than it sounds, because "what is in order right now" is usually answered by "whatever comes next on that list."',
    ],
  },
  {
    id: 'order-of-business',
    part: 'meeting',
    title: 'The standard order of business, start to finish',
    paragraphs: [
      'The chair opens by calling the meeting to order — one tap of the gavel, and a sentence like "The meeting will come to order." Groups that have opening ceremonies, a pledge, or a creed do them here. Then the meeting moves through its items in a fixed order, and the chair announces each one as it comes up rather than asking the room what it would like to do next.',
      'First comes the reading and approval of the minutes. The secretary reads the minutes of the previous meeting, or the chair notes that they were distributed in advance, and the chair asks whether there are any corrections. Corrections are handled by general consent — the chair simply makes the change if nobody objects — and then the chair declares the minutes approved. Notice that nobody moves to approve them: approval of minutes is one of the places where a motion is unnecessary, and a team that moves and seconds it is showing the judges a small mistake.',
      'Next are the reports of officers, boards, and standing committees, in the order they are listed in the bylaws. The treasurer’s report belongs here, and it is the most commonly bungled item in the whole meeting: the treasurer presents it, the chair asks if there are questions, and the chair states that it will be filed for audit. The assembly does not adopt or approve the treasurer’s report, because adopting it would mean the whole group is vouching for numbers it has not audited. What does get adopted is the auditor’s report, once there is one. Reports of special committees follow, and a report that recommends something is followed by the motion to carry that recommendation out, which comes from the reporting member and needs no second because it comes from a committee.',
      'Then come special orders, and then unfinished business and general orders — which is everything left hanging from last time: the item the group was in the middle of when it adjourned, and anything that was postponed to this meeting. The chair announces those items; the chair does not ask "is there any unfinished business?", because the chair, working from the minutes, is the one who knows what there is. After that comes new business, where members bring up anything else, and this is where most motions of the night are actually made. Finally, there are announcements, and then adjournment, which can come from a motion to adjourn or, when there is nothing left, from the chair asking if there is any further business and then declaring the meeting adjourned. The gavel taps once to close.',
    ],
  },
  {
    id: 'motion-life',
    part: 'meeting',
    title: 'How a single motion travels',
    paragraphs: [
      'Every substantive thing a group does starts as a motion, and every motion follows the same eight steps. A member rises and addresses the chair ("Madam President"). The chair recognizes them by name or title, which is what gives them the floor — the floor is granted, not taken. The recognized member makes the motion, always in the form "I move that…", never "I motion" and never "I make a motion to." Another member seconds it without needing to be recognized first, simply by saying "Second." The second only means that a second person thinks it is worth the group’s time to discuss; it is not agreement.',
      'The chair then states the question, and this is the step that people forget and judges listen for: "It is moved and seconded that the chapter purchase new scrubs for the blood drive. Is there any discussion?" Until the chair states the question, the motion is not before the assembly — it still belongs to the maker, who can withdraw it freely. After the chair states it, the motion belongs to the whole group, and withdrawing it takes unanimous consent or a majority vote.',
      'Debate follows, and then the chair puts the question to a vote: "All those in favor of the motion to purchase new scrubs, say aye… Those opposed, say no." Last, and most importantly, the chair announces the result, what it means, and what happens next: "The ayes have it, and the motion is adopted. We will purchase the scrubs. The next business in order is…" A vote that is never announced never happened, procedurally speaking, and an announcement that leaves out the effect of the vote is half an announcement.',
      'That eight-step skeleton — rise, be recognized, move, second, state the question, debate, put the question, announce the result — is the single most valuable thing to have memorized. It is the frame that every other motion hangs on.',
    ],
  },
  {
    id: 'debate',
    part: 'meeting',
    title: 'What debate is supposed to sound like',
    paragraphs: [
      'Debate begins only after the chair has stated the question, and the member who made the motion has the right to speak first. Under the default rules each member may speak twice on the same question on the same day, for up to ten minutes each time, and may not speak a second time while anyone who has not yet spoken wants the floor. Most groups never come close to those limits, but knowing them is what lets you recognize when someone is being cut off unfairly.',
      'Remarks are addressed to the chair, not to each other. That single convention is doing a lot of work: it slows an argument down, keeps it from turning into a back-and-forth between two people, and makes it much harder for a disagreement about an idea to turn into a disagreement about a person. In the same spirit, members refer to each other by title or as "the previous speaker" rather than by name, and debate is confined to the merits of the question — attacking someone’s motives is out of order, and so is wandering off the topic.',
      'Debate must also be germane, meaning it has to be about the motion actually pending. If a member starts arguing about next year’s budget while a motion about scrubs is on the floor, the chair can rule them out of order, or any member can raise a point of order. The chair can also gently keep things moving by alternating between members for and against, which is a courtesy rather than a rule but a good habit when the room is split.',
    ],
  },
  {
    id: 'subsidiary',
    part: 'meeting',
    title: 'Changing a motion while it is on the floor',
    paragraphs: [
      'Once a motion is pending, the group has a set of tools for handling it that do not require voting it up or down as-is. These are the subsidiary motions, and they are the ones that show up constantly in competition. To change the wording, a member moves to amend — insert words, strike out words, or strike out and insert, which is how you swap one phrase for another. An amendment to a main motion is a primary amendment; an amendment to that amendment is a secondary amendment, and that is as deep as it goes. The group votes on the secondary amendment first, then the primary, then the motion as it now reads. Every amendment must be germane to what it is amending, so you cannot amend a motion about scrubs into a motion about a car wash.',
      'To hand a question to a smaller group, a member moves to refer or commit, naming the committee and, if the bylaws are silent, how its members are chosen. To deal with it later, a member moves to postpone to a certain time, and the time has to be definite — "postpone until the next meeting," not "postpone until we feel ready." To speed things up, a member can move to limit debate, or move the previous question, which closes debate immediately and goes straight to the vote. Both of those take a two-thirds vote, because both take a right away from members who still wanted to speak. The previous question is itself voted on first: the chair takes the vote on whether to close debate, and only then takes the vote on the motion underneath.',
      'Lay on the table is the most misused motion in parliamentary procedure. Its real purpose is to set a question aside temporarily because something urgent has come up, with the intention of taking it back up later in the same or the next session. It is not a polite way to kill something, and a chair who realizes that is what a member intends should rule it out of order — the motion for killing something without a direct vote is postpone indefinitely. Anything laid on the table comes back through the motion to take from the table, by majority vote.',
    ],
  },
  {
    id: 'incidental',
    part: 'meeting',
    title: 'When something goes wrong mid-meeting',
    paragraphs: [
      'If a rule is being broken, any member can raise a point of order — without being recognized first, and interrupting if necessary, since the whole point is to catch the error while it is happening. It needs no second. The chair rules on it, and if a member disagrees with that ruling they can appeal from the decision of the chair, which does need a second and is decided by the assembly rather than by the chair. On an appeal, a tie sustains the chair, because a majority is required to overturn the ruling.',
      'If you are simply confused about procedure, the right tool is a parliamentary inquiry — a question to the chair about what is in order or how to do something. If you want a fact about the substance of the motion, that is a request for information. Note the name: the 12th edition renamed what used to be called a point of information, and a fair number of older practice questions still use the old term. Either way you are asking a question, not making a speech, and asking one is not a chance to sneak in an argument.',
      'A few other small tools round the set out. If a voice vote sounds too close to call, any single member can call for a division of the assembly — no second, no vote, no discussion — and the chair retakes the vote by rising. To do something the rules would not normally allow, such as taking an item out of order, a member moves to suspend the rules, which takes two thirds. To pull a motion back after the chair has stated it, the maker asks for unanimous consent to withdraw it. And unanimous consent itself is worth knowing as a general technique: for routine, uncontroversial steps, the chair can say "if there is no objection…" and simply proceed, which saves an enormous amount of time in a real meeting.',
    ],
  },
  {
    id: 'privileged',
    part: 'meeting',
    title: 'Taking care of the room and the clock',
    paragraphs: [
      'A handful of motions are so urgent that they outrank whatever is being discussed. If the room is too loud to hear, the air conditioning has failed, or the meeting has been taken somewhere it should not be, a member raises a question of privilege, which the chair handles immediately. If the group needs a short break, a member moves to recess for a stated length of time. If it is time to stop, a member moves to adjourn, which is not debatable and takes a majority. And if the group wants to guarantee itself another meeting before the next regular one, it moves to fix the time to which to adjourn, which is the highest-ranking motion there is.',
      'One more belongs here: if the meeting has drifted off its schedule and there are items that were supposed to be taken up by now, a single member can call for the orders of the day, which forces the group back on track without a second and without a vote. The chair must then proceed to the proper item unless the assembly votes by two thirds to set the orders aside.',
    ],
  },
  {
    id: 'voting',
    part: 'meeting',
    title: 'Voting, and what the thresholds actually mean',
    paragraphs: [
      'A majority vote means more than half of the votes cast — not half the members present, and not half the membership. Abstentions are not votes, so they do not count toward either side; a member who abstains is choosing to let the voters decide. A tie means the motion fails, because a tie is not more than half. A two-thirds vote means at least twice as many yes votes as no votes, and it is required whenever the assembly is limiting someone’s rights: closing or limiting debate, suspending the rules, taking away a member’s floor, or overturning something the group already decided without prior notice.',
      'The ordinary method is a voice vote, and the chair announces the result by ear. If that is too close, a rising vote settles it, either because the chair calls for one or because a member demands a division. A counted rising vote, a show of hands, a roll call, or a ballot are all available when the group wants a record or wants privacy — a ballot vote is the one to use when the question is personal or contested, and roll call is for when members need to be on record to the people they represent.',
      'The chair, if they are a member of the organization, has the right to vote but by custom does not vote on a voice vote — with two exceptions. The chair votes when the vote is by ballot, because it is secret, and the chair may vote whenever their single vote would change the outcome: to break a tie, or to create one and thereby defeat a motion. Either way, the chair votes once, not twice.',
    ],
  },
  {
    id: 'bring-back',
    part: 'meeting',
    title: 'Changing your mind after the vote',
    paragraphs: [
      'Groups do change their minds, and there is an orderly way to do it. Reconsider is the narrow one: it must be moved on the same day the vote was taken (or the next day at a convention), and only by a member who voted on the prevailing side. That restriction is deliberate — it stops the losing side from simply re-running the vote once a few opponents have gone home, while still letting someone who has genuinely been persuaded reopen the question.',
      'For a decision from an earlier meeting, the motion is rescind, or amend something previously adopted if you want to change it rather than scrap it. Because this undoes something the group already settled, it takes a two-thirds vote, or a majority if previous notice was given, or a majority of the entire membership — any one of those three is enough. There are limits: you cannot rescind something that has already been carried out and cannot be undone, and you cannot rescind an election after the person has been notified and accepted, absent a disciplinary process.',
      'Finally, a question that was laid on the table is brought back with take from the table, by majority vote, during the same session or the next one. After that it dies, and anyone who wants it back has to move it fresh.',
    ],
  },
  {
    id: 'minutes',
    part: 'meeting',
    title: 'What the secretary writes down',
    paragraphs: [
      'Minutes are a record of what was done, not what was said. The temptation is to write a transcript of the debate; resist it. The first paragraph establishes the basics: the kind of meeting, the name of the organization, the date, time and place, whether the regular chair and secretary were present or who stood in, and whether the previous meeting’s minutes were approved.',
      'The body records each main motion in its exact final wording, the name of the member who made it, and what happened to it — adopted, defeated, referred, postponed. Under the 12th edition the seconder’s name is not recorded. Points of order and appeals are recorded along with the chair’s reasoning, because those become precedent. Reports are noted, and their text is attached rather than retyped. The last line gives the time of adjournment, and the secretary signs it.',
      'Opinions, applause, and the secretary’s own commentary stay out. A good test: someone who was not at the meeting should be able to read the minutes and know exactly what the organization is now committed to, and nothing about who was annoyed with whom.',
    ],
  },
  {
    id: 'hosa-format',
    part: 'hosa',
    title: 'What the event actually consists of',
    paragraphs: [
      'HOSA’s Parliamentary Procedure event is a team event of five to eight members, each holding an identified office or standing in for one — a president, a treasurer, a committee chair, ordinary members. It runs in two rounds. Round One is a written test of 50 multiple-choice questions in a maximum of 60 minutes, and its question pool is built entirely from the National Association of Parliamentarians test plan, which is why this app’s categories follow that plan. At the international conference there are no spoken time warnings during the test; you watch your own clock.',
      'Every team member takes the test, and the team’s average score is what qualifies the team for Round Two. That average is then added to the meeting score for final placing, and if two teams tie, the higher test average wins the tie. So the written test is not a gate you pass and forget — it is part of your final score, and one weak test drags the whole team’s average down. Scoring 70% or better also puts you on the list NAP contacts afterward about membership.',
      'Round Two is the meeting demonstration, and only the top teams from Round One advance. The number that advances depends on the scores and on how much room and time the conference has, and finalists are announced on-site.',
    ],
  },
  {
    id: 'hosa-round2',
    part: 'hosa',
    title: 'How the demonstration runs, minute by minute',
    paragraphs: [
      'Your team is called to a preparation room and handed the secret topic — one copy per member. The topic contains one main motion and four subsidiary or privileged motions, and all four of those motions must appear in your meeting. You get 15 minutes to plan. During that 15 minutes you may use Robert’s Rules of Order Newly Revised or In Brief, and HOSA provides a copy of the full book in the prep room, but the book does not come with you to the presentation. A timekeeper calls out when five minutes and when one minute remain. You may write on your copy of the secret topic and take it in with you, notes and all — the topic itself is confidential, and discussing it before the event finishes is a penalty.',
      'You then move to the presentation room. You may bring the minutes of a previous meeting, a treasurer’s report, committee reports, your annotated secret topic, blank paper, and a pencil for the president to take notes. The team is seated so the judges can see everyone. You have 11 minutes, measured from the sound of the gavel opening the meeting to the sound of the gavel closing it. The timekeeper stands and shows a card at one minute left, and at 11 minutes you are stopped wherever you are — an unadjourned meeting loses the adjournment points and looks unfinished, so build the ending into your plan rather than hoping you get there.',
      'The demonstration is supposed to be an ordinary business meeting, call to order through adjournment, with the secret topic’s motions handled inside it. Every member must take an active role; a meeting where the president and one confident member do all the talking loses points on team participation, and so does one where members recite lines without any real discussion. The judges also review your minutes from the previous meeting — those, and only those, are shown to the judges. You are not required to read the minutes aloud: it is acceptable to state that they were distributed in advance, which is usually the right call when 11 minutes is all you have.',
      'On titles: the presiding officer is addressed as Mr. or Madam President when they are the organization’s president or its vice president standing in. If the person presiding holds no office, Mr. or Madam Chairman is the correct form. Business attire or the official HOSA uniform earns bonus points in both rounds, and every member has to be dressed properly for the team to get them.',
    ],
  },
  {
    id: 'hosa-scoring',
    part: 'hosa',
    title: 'What the judges are actually scoring',
    paragraphs: [
      'The Round Two rating sheet is worth 162 points, and it is worth reading like a checklist, because most of it is pass-or-fail on things you control completely. Section A, Proper Order of Business, is 21 points: three points each for calling the meeting to order, approving the minutes, presenting the treasurer’s report, hearing committee reports, taking up unfinished business, taking up the new business from the secret topic, and adjourning. Seven items, each either done or not done. Leaving out unfinished business because you ran out of time is a three-point gift to the teams behind you.',
      'Section B, Motions, is the biggest block at up to 56 points: eight points for a correctly demonstrated main motion, eight for each of the four motions from the secret topic, and eight each for up to two optional extra motions. A motion that is attempted but handled wrongly scores four; one that never appears scores zero. This is where knowing the exact wording pays — "I move that," a second, the chair stating the question, debate, the vote, and the chair announcing the result and its effect.',
      'Section C, General Parliamentary Procedure, is 40 points across four ten-point items: proper recognition of the chair and members, proper use of parliamentary terminology across all four required motions, addressing every agenda item correctly, and the presiding officer’s own skill and confidence. Section D, Presentation Delivery, is 35: five points each for voice, stage presence, and diction and grammar, plus ten each for team participation and for the quality of the discussion — whether you actually accomplished the goals of the secret topic and showed a range of viewpoints. Section E is ten points for the minutes from the previous meeting, which are prepared in advance and are the easiest ten points on the sheet to secure.',
      'Read that distribution again and the strategy falls out of it. The motions block and the general procedure block are 96 of the 162 points, and both reward precise, correct, out-loud procedure over polish. The delivery points reward a meeting that sounds like a real conversation among people who disagree, not a recital. And roughly 31 points — the order of business and the minutes — are earned by preparation and a checklist rather than by any skill at all.',
    ],
  },
  {
    id: 'hosa-plan',
    part: 'hosa',
    title: 'A skeleton for the eleven minutes',
    paragraphs: [
      'A plan that fits reliably looks roughly like this. The president taps the gavel and calls the meeting to order, notes that a quorum is present, and moves straight to the minutes — stating that they were distributed in advance and asking for corrections, then declaring them approved. The treasurer presents the report and the president states that it will be filed for audit. A committee chair gives a short report. That whole opening block should take about two minutes; it is 12 of your points and none of it requires thinking on your feet, so rehearse it until it is automatic.',
      'The president then announces unfinished business — one short item carried over, disposed of quickly — and then new business, which is where the secret topic lives. A member rises, is recognized, and makes the main motion in exact wording. It is seconded, the chair states the question, and debate begins. The four required motions from the topic get woven into that debate in an order that makes sense: an amendment while the main motion is being discussed, a motion to refer or to postpone if the discussion exposes a genuine problem, the previous question when the debate has run its course, a recess or a privileged motion where it fits naturally. Each one gets the full treatment — moved, seconded, stated, voted, result announced with its effect.',
      'Leave 90 seconds at the end. The president asks whether there is any further business, hears announcements, and entertains or declares the adjournment, closing with the gavel. Assign someone other than the president to watch the timekeeper’s one-minute card, because the president will be busy, and agree in advance on what you cut if you are behind — usually a stretch of debate, never one of the four required motions and never the adjournment.',
    ],
  },
]
