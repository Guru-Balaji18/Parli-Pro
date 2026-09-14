// Ordered to match the HOSA Round 1 written-test plan (official-rules.md).
// "General Parliamentary Procedure" catches background/mixed questions that
// don't hinge on one named motion.
export const CATEGORIES = [
  { id: 'why_rules', name: 'Why Have Rules', short: 'Why Rules' },
  { id: 'meeting', name: 'What Happens at a Meeting?', short: 'Meetings' },
  { id: 'handling_motions', name: 'Handling Motions', short: 'Handling Motions' },
  { id: 'debate', name: 'Debate', short: 'Debate' },
  { id: 'amendments', name: 'Amendments', short: 'Amendments' },
  { id: 'postpone_refer', name: 'Postponing & Referring to a Committee', short: 'Postpone/Refer' },
  { id: 'change_mind', name: 'How a Group Can Change Its Mind', short: 'Change Its Mind' },
  { id: 'voting_elections', name: 'Voting and Elections', short: 'Voting/Elections' },
  { id: 'bylaws', name: 'Bylaws and Other Rules', short: 'Bylaws' },
  { id: 'enforce_suspend', name: 'How Rules Are Enforced & Suspended', short: 'Enforce/Suspend' },
  { id: 'officers_committees', name: 'Officers, Committee Chairman or Member', short: 'Officers/Committees' },
  { id: 'general', name: 'General Parliamentary Procedure', short: 'General' },
]

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))
