// Precedence and handling rules for each motion. Rule data, compiled for this app.
export const MOTION_CLASSES = [
  {
    id: 'privileged',
    label: 'Privileged',
    note: 'Highest precedence. These concern the assembly itself, not the pending business.',
    motions: [
      { rank: 1, name: 'Fix the Time to Which to Adjourn', second: 'Yes', debatable: 'No*', amendable: 'Yes', vote: 'Majority' },
      { rank: 2, name: 'Adjourn', second: 'Yes', debatable: 'No', amendable: 'No', vote: 'Majority' },
      { rank: 3, name: 'Recess', second: 'Yes', debatable: 'No', amendable: 'Yes', vote: 'Majority' },
      { rank: 4, name: 'Raise a Question of Privilege', second: 'No', debatable: 'No', amendable: 'No', vote: 'Chair rules' },
      { rank: 5, name: 'Call for the Orders of the Day', second: 'No', debatable: 'No', amendable: 'No', vote: 'Demand of one member' },
    ],
  },
  {
    id: 'incidental',
    label: 'Incidental',
    note: 'No rank among themselves. They arise out of the pending question and are decided first.',
    motions: [
      { rank: null, name: 'Point of Order', second: 'No', debatable: 'No', amendable: 'No', vote: 'Chair rules' },
      { rank: null, name: 'Appeal', second: 'Yes', debatable: 'Usually', amendable: 'No', vote: 'Majority (tie sustains chair)' },
      { rank: null, name: 'Suspend the Rules', second: 'Yes', debatable: 'No', amendable: 'No', vote: 'Two-thirds' },
      { rank: null, name: 'Objection to the Consideration of a Question', second: 'No', debatable: 'No', amendable: 'No', vote: 'Two-thirds against' },
      { rank: null, name: 'Division of the Assembly', second: 'No', debatable: 'No', amendable: 'No', vote: 'No vote — right of one member' },
      { rank: null, name: 'Division of a Question', second: 'Yes', debatable: 'No', amendable: 'Yes', vote: 'Majority' },
      { rank: null, name: 'Parliamentary Inquiry', second: 'No', debatable: 'No', amendable: 'No', vote: 'No vote' },
      { rank: null, name: 'Request for Information', second: 'No', debatable: 'No', amendable: 'No', vote: 'No vote' },
      { rank: null, name: 'Withdraw a Motion', second: 'No', debatable: 'No', amendable: 'No', vote: 'Majority / consent' },
    ],
  },
  {
    id: 'subsidiary',
    label: 'Subsidiary',
    note: 'Applied to a pending motion to dispose of it. Listed highest precedence first.',
    motions: [
      { rank: 1, name: 'Lay on the Table', second: 'Yes', debatable: 'No', amendable: 'No', vote: 'Majority' },
      { rank: 2, name: 'Previous Question', second: 'Yes', debatable: 'No', amendable: 'No', vote: 'Two-thirds' },
      { rank: 3, name: 'Limit or Extend Limits of Debate', second: 'Yes', debatable: 'No', amendable: 'Yes', vote: 'Two-thirds' },
      { rank: 4, name: 'Postpone to a Certain Time', second: 'Yes', debatable: 'Yes (limited)', amendable: 'Yes', vote: 'Majority' },
      { rank: 5, name: 'Commit or Refer', second: 'Yes', debatable: 'Yes (limited)', amendable: 'Yes', vote: 'Majority' },
      { rank: 6, name: 'Amend', second: 'Yes', debatable: 'If motion is', amendable: 'Yes (once)', vote: 'Majority' },
      { rank: 7, name: 'Postpone Indefinitely', second: 'Yes', debatable: 'Yes', amendable: 'No', vote: 'Majority' },
    ],
  },
  {
    id: 'main',
    label: 'Main motion',
    note: 'Lowest precedence. Nothing else may be pending when it is made.',
    motions: [
      { rank: null, name: 'Main Motion', second: 'Yes', debatable: 'Yes', amendable: 'Yes', vote: 'Majority' },
    ],
  },
  {
    id: 'bring_back',
    label: 'Bring a question again before the assembly',
    note: 'Made only when nothing is pending, except Reconsider which may be moved immediately.',
    motions: [
      { rank: null, name: 'Reconsider', second: 'Yes', debatable: 'If motion was', amendable: 'No', vote: 'Majority' },
      { rank: null, name: 'Rescind (with notice)', second: 'Yes', debatable: 'Yes', amendable: 'Yes', vote: 'Majority' },
      { rank: null, name: 'Rescind (no notice)', second: 'Yes', debatable: 'Yes', amendable: 'Yes', vote: 'Two-thirds' },
      { rank: null, name: 'Take from the Table', second: 'Yes', debatable: 'No', amendable: 'No', vote: 'Majority' },
      { rank: null, name: 'Discharge a Committee', second: 'Yes', debatable: 'Yes', amendable: 'Yes', vote: 'Two-thirds, or majority w/ notice' },
    ],
  },
]

export const PRECEDENCE_FOOTNOTE =
  '* Fix the Time to Which to Adjourn is not debatable when made while another question is pending; as a main motion it is debatable.'

// Drilling tiers from the frequency analysis of the Dunbar bank.
export const STUDY_TIERS = [
  {
    tier: 1,
    label: 'Drill first',
    blurb: 'Highest frequency in the question bank and in every sister-org motion list.',
    topics: ['Commit / Refer & Committees', 'Amend (incl. substitute)', 'Main Motion', 'Adjourn'],
  },
  {
    tier: 2,
    label: 'High priority',
    blurb: 'Where the vote-threshold and timing "gotcha" questions cluster.',
    topics: ['Majority vs. two-thirds rules', 'Limit or Extend Debate', 'Minutes', 'Reconsider', 'Recess'],
  },
  {
    tier: 3,
    label: 'Consistently tested',
    blurb: 'Most HOSA sample secret-topic motions live here — judges watch for these by name.',
    topics: ['Bylaws', 'Postpone Indefinitely', 'Previous Question', 'Point of Order', 'Postpone Definitely', 'Nominations / Elections', 'Appeal', 'Quorum', 'Orders of the Day'],
  },
  {
    tier: 4,
    label: 'Separates top scorers',
    blurb: 'Lower frequency, but each is one narrow rule — quick wins once Tiers 1–3 are solid.',
    topics: ['Question of Privilege', 'Fix the Time to Which to Adjourn', 'Withdraw a Motion', 'Rescind / Amend Something Previously Adopted', 'Take from the Table', 'Parliamentary Inquiry', 'Lay on the Table', 'Suspend the Rules', 'Standing Rules', 'Division of the Assembly', 'Objection to Consideration', 'Division of a Question'],
  },
]
