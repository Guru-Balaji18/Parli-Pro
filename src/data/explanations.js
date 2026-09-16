// Explanations for questions teammates have missed. Each source names the exact
// section and paragraph of Robert's Rules of Order Newly Revised (12th ed.) and
// says what that passage says in our own words — the book is under copyright,
// so it is paraphrased rather than quoted. `answer` ties the passage to the
// answer choices; `conflict` flags where Dunbar's key is ambiguous or out of
// step with the 12th edition.
export const EXPLANATIONS = {
  q0740: {
    sources: [
      {
        section: '§46 Nominations and Elections',
        ref: '46:6',
        says: 'When nominations are taken from the floor, a member doesn’t need to be recognized by the chair to nominate someone, unless they also want to debate the nomination at the same time. In a large meeting or convention the member should stand to nominate, though in small groups people often nominate from their seats. A nomination needs no second, although members sometimes second one to show support. No one may ever nominate more people than there are positions to fill.',
      },
    ],
    answer: 'A member need not be recognized (D). A second isn’t required, members in large assemblies should rise, and no one can nominate three people for a single office.',
  },
  q1565: {
    sources: [
      {
        section: '§37 Reconsider',
        ref: '37:35',
        says: 'Reconsideration in a standing or special committee differs from reconsideration in the assembly: it can be moved no matter how much time has passed, and a question can be reconsidered any number of times; any committee member who did not vote on the losing side may move it, even one who didn’t vote or was absent; and it needs a two-thirds vote unless every member who voted on the prevailing side is present or was given reasonable notice that it would be moved.',
      },
      {
        section: '§37 Reconsider',
        ref: '37:9',
        says: 'Among the standard characteristics of Reconsider: it is not amendable, and a vote on a motion to Reconsider cannot itself be reconsidered.',
      },
      {
        section: '§50 Committees',
        ref: '50:25',
        says: 'The relaxed procedures used in small boards apply in the meetings of all standing and special committees, unless the committee has been instructed otherwise.',
      },
      {
        section: '§49 Boards',
        ref: '49:21',
        says: 'One of those relaxed procedures is that motions do not need to be seconded.',
      },
    ],
    answer: 'The false statement is D. Two-thirds is needed only when a member who voted on the winning side is absent and wasn’t notified. A, B and C are all true in a committee.',
  },
  q0516: {
    sources: [
      {
        section: '§32 Request to Be Excused from a Duty',
        ref: '32:1',
        says: 'A member can’t, as a matter of right, refuse a duty such as a committee assignment or demand to be excused from it, but the assembly can grant the member’s request to be excused. The request can be granted by unanimous consent, or someone can move to grant it, and that motion is debatable and amendable.',
      },
      {
        section: '§32 Request to Be Excused from a Duty',
        ref: '32:2',
        says: 'Its standard characteristics include that it requires a majority vote, but it is often settled by unanimous consent.',
      },
    ],
    answer: 'B. No three-fourths vote is involved, and the president’s permission isn’t required.',
  },
  q0569: {
    sources: [
      {
        section: '§37 Reconsider',
        ref: '37:9',
        says: 'The motion to Reconsider needs only a majority vote, whatever vote the motion being reconsidered originally required.',
      },
      {
        section: '§37 Reconsider',
        ref: '37:10',
        says: 'Only a member who voted with the prevailing side may move to reconsider: someone who voted aye if the motion was adopted, or no if it was lost. There are time limits. In a one-day session, such as an ordinary club meeting, it can be moved only on the same day as the vote; in a session lasting more than one day, only on that day or the next day of the session on which a business meeting is held.',
      },
    ],
    answer: 'D is not a characteristic, because Reconsider never requires two-thirds or notice. A, B and C all describe the motion.',
  },
  q0979: {
    sources: [
      {
        section: '§59 Organization of a Convention of an Established Society',
        ref: '59:27',
        says: 'The standing rules of a convention apply to that one convention only. They can’t conflict with the bylaws but may modify rules in the parliamentary authority, and they usually include both parliamentary rules about conducting business and nonparliamentary rules.',
      },
      {
        section: '§59 Organization of a Convention of an Established Society',
        ref: '59:13',
        says: 'A convention is organized by adopting the reports of the Credentials Committee, the Committee on Standing Rules, and the Program Committee. The credentials and program reports need a majority vote; the standing rules report normally needs two-thirds.',
      },
      {
        section: '§59 Organization of a Convention of an Established Society',
        ref: '59:34',
        says: 'A set of proposed standing rules needs a two-thirds vote whenever it includes any rule that would need two-thirds if voted on by itself. Because convention standing rules nearly always include such provisions, adopting them as a package normally takes two-thirds.',
      },
    ],
    answer: 'A is the keyed answer. C is wrong because the standing rules come from the Committee on Standing Rules, not the Credentials Committee, which also rules out D.',
    conflict: 'Going by 59:34, B is normally true as well, since a package of convention standing rules almost always needs two-thirds. Dunbar keys A because B isn’t guaranteed in every case, so expect A to be marked correct.',
  },
  q1148: {
    sources: [
      {
        section: '§2 Rules of an Assembly or Organization',
        ref: '2:9',
        says: 'The articles found in the bylaws of a typical society cover, in order: the name of the organization, its object, members, officers, meetings, the executive board (if needed), committees, the parliamentary authority, and how the bylaws are amended.',
      },
    ],
    answer: 'The first letters spell N-O-M-O-M-E-C-P-A, so the two M’s are Members and Meetings (A).',
  },
  q0183: {
    sources: [
      {
        section: '§6 Description of Classes and Individual Motions',
        ref: '6:15',
        says: 'Incidental motions relate in various ways to the pending business, or to other business at hand. As a class they deal with questions of procedure, most often arising out of another pending motion, and they usually have to be decided right away, before business can go on. Most of them can’t be debated.',
      },
    ],
    answer: 'That is the description of incidental motions (C).',
  },
  q0188: {
    sources: [
      {
        section: '§6 Description of Classes and Individual Motions',
        ref: '6:5',
        says: 'The subsidiary motions are Postpone Indefinitely, Amend, Commit or Refer, Postpone to a Certain Time, Limit or Extend Limits of Debate, Previous Question, and Lay on the Table.',
      },
      {
        section: '§6 Description of Classes and Individual Motions',
        ref: '6:17',
        says: 'Point of Order is listed among the incidental motions: a member who believes the chair isn’t enforcing the rules can raise one when the breach happens, which requires the chair to rule on it.',
      },
    ],
    answer: 'Point of Order (B) is an incidental motion, not a subsidiary one.',
  },
  q0395: {
    sources: [
      {
        section: '§19 Raise a Question of Privilege',
        ref: '19:8',
        says: 'To raise a question of privilege, a member stands, addresses the chair without waiting to be recognized, and announces that they rise to a question of privilege affecting the assembly, or to a question of personal privilege.',
      },
      {
        section: '§19 Raise a Question of Privilege',
        ref: '19:9',
        says: 'The chair, even if someone else has been assigned the floor, then directs the member to state the question of privilege. The member either describes the problem and asks that it be fixed, or makes a motion if formal action is needed. Unless it can be settled quickly, the chair rules on whether it really is a question of privilege and whether it is urgent enough to interrupt.',
      },
      {
        section: '§19 Raise a Question of Privilege',
        ref: '19:6',
        says: 'It is in order when someone else has the floor if the situation is urgent, but only after the floor has been assigned and before that person begins speaking. It can’t interrupt a member who is actually speaking unless waiting would defeat its purpose, and it can never interrupt voting.',
      },
    ],
    answer: 'Dunbar keys B: the member states the request once the chair directs them to. C and D are wrong, since it can be raised while an amendment is pending and the chair rules on it instead of a two-thirds vote.',
    conflict: 'Under 19:6, A is also true in the 12th edition, since a question of privilege generally can’t interrupt someone who is speaking. Expect B on a Dunbar-based test, but know the interruption rule too.',
  },
  q0468: {
    sources: [
      {
        section: '§24 Appeal',
        ref: '24:7',
        says: 'The chair’s judgment about which side won a vote, or whether there was a two-thirds majority, isn’t a ruling, so it can’t be appealed. A member who doubts an announced result should instead call for a Division or move that the vote be counted.',
      },
    ],
    answer: 'Suggest that the member call for a Division (B), since there is nothing to appeal.',
  },
  q0524: {
    sources: [
      {
        section: '§33 Requests and Inquiries',
        ref: '33:6',
        says: 'A Request for Information, also called a Point of Information, is directed to the chair, or through the chair to another officer or member, and asks for information relevant to the business at hand that isn’t about parliamentary procedure.',
      },
    ],
    answer: 'It is directed through the presiding officer (C).',
  },
  q0565: {
    sources: [
      {
        section: '§36 Discharge a Committee',
        ref: '36:9',
        says: 'When a committee is discharged from considering a matter, whether by a motion to discharge it or by its final report, a standing committee continues to exist, but a special committee that was appointed for that matter goes out of existence. Either way, the committee chairman returns the papers on the matter to the secretary.',
      },
    ],
    answer: 'A standing committee continues its existence (A).',
  },
  q0599: {
    sources: [
      {
        section: '§40 Quorum',
        ref: '40:7',
        says: 'Even without a quorum, the assembly may fix the time to which to adjourn, adjourn, recess, or take measures to obtain a quorum. Other motions may also be considered if they relate to those actions or to running the meeting while it lacks a quorum.',
      },
    ],
    answer: 'All three choices are permitted, so the answer is All of the above (D).',
  },
  q0600: {
    sources: [
      {
        section: '§40 Quorum',
        ref: '40:7',
        says: 'Without a quorum, the assembly may still fix the time to which to adjourn, adjourn, recess, or take measures to obtain a quorum.',
      },
      {
        section: '§40 Quorum',
        ref: '40:9',
        says: 'The rule against doing business without a quorum can’t be waived, even by unanimous consent. If important business can’t wait until the next regular meeting, the assembly should set the time for an adjourned meeting and then adjourn.',
      },
    ],
    answer: 'Setting a time for an adjourned meeting (C). Approving the minutes, or going into a committee of the whole or a quasi committee of the whole, would be transacting business.',
  },
  q0673: {
    sources: [
      {
        section: '§43 Rules Governing Debate',
        ref: '43:29',
        says: 'A presiding officer who is a member has the same right to debate as anyone else, but can’t use it while presiding and normally should say nothing on the merits. In the rare case where they feel they must speak, they have to give up the chair, normally to the highest-ranking vice-president present who hasn’t spoken on the question, and they may not return to the chair until the pending main question has been disposed of.',
      },
    ],
    answer: 'Turn the chair over to the vice-president (D).',
  },
  q0887: {
    sources: [
      {
        section: '§52 Committee of the Whole and Its Alternate Forms',
        ref: '52:24',
        says: 'In ordinary societies whose meetings aren’t large, a much simpler alternative to a committee of the whole is to consider a question informally, which only suspends the limit on how many times a member may speak on the main question and its amendments.',
      },
      {
        section: '§52 Committee of the Whole and Its Alternate Forms',
        ref: '52:25',
        says: 'Once informal consideration is adopted, there is no limit to how many times a member can speak on the question or on any amendment.',
      },
      {
        section: '§52 Committee of the Whole and Its Alternate Forms',
        ref: '52:26',
        says: 'Only the number of speeches is informal. All votes are formal, any other motion follows the regular rules of debate, and the proceedings are recorded in the minutes as usual.',
      },
    ],
    answer: 'C is false, because members can speak on amendments as often as they like. A, B and D are true: nothing changes except the limit on speeches, so the regular presiding officer stays in the chair.',
  },
  q1497: {
    sources: [
      {
        section: '§52 Committee of the Whole and Its Alternate Forms',
        ref: '52:19',
        says: 'Quasi committee of the whole is a simpler version of the committee of the whole, convenient in medium-sized assemblies. It isn’t a real committee; it’s the assembly acting as if in committee of the whole.',
      },
      {
        section: '§52 Committee of the Whole and Its Alternate Forms',
        ref: '52:21',
        says: 'The presiding officer doesn’t appoint a chairman, but stays in the chair throughout. The secretary keeps only a temporary memo of what happens, and the minutes record just the report from the quasi committee and the action taken on it.',
      },
      {
        section: '§52 Committee of the Whole and Its Alternate Forms',
        ref: '52:23',
        says: 'The motion to rise isn’t used. When no more amendments are offered, the presiding officer reports to the assembly and states the question on the amendments.',
      },
    ],
    answer: 'The presiding officer remains in the chair throughout (C).',
  },
  q1545: {
    sources: [
      {
        section: '§63 Investigation and Trial',
        ref: '63:33',
        says: 'After some preliminaries (noting that the meeting is in executive session, reading the resolutions about the trial, confirming the accused received the charges, announcing the managers, and asking whether the accused has counsel), the trial proceeds in order. First, the secretary reads the charge and specifications. Second, the chair asks the accused how they plead, guilty or not guilty. A guilty plea means no trial is needed; after a plea of not guilty come opening statements, witnesses, and the rest.',
      },
    ],
    answer: 'Asking the accused how they plead is the second step (C).',
  },
}
