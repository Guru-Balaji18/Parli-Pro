// Study notes for questions teammates have missed. Written in our own words from
// Robert's Rules of Order Newly Revised (12th ed.); `cite` gives its paragraph
// numbers. `conflict` flags where Dunbar's answer key is ambiguous or out of
// step with the 12th edition, instead of arguing for the key.
export const EXPLANATIONS = {
  q0740: {
    why: 'A member making a nomination from the floor doesn’t need to be recognized by the chair first, unless they also want to speak in debate on it. The other choices are wrong: a nomination never needs a second (members sometimes second one just to show support), a member in a large meeting should stand to nominate, and no one may nominate more people than there are places to fill, so never three for a single office.',
    cite: 'RONR (12th ed.) 46:6',
  },
  q1565: {
    why: 'In a standing or special committee, Reconsider needs a two-thirds vote only when a member who voted on the winning side is absent and wasn’t given reasonable notice. If they’re all present or were notified, a majority is enough, so “always requires two-thirds” is the false statement. The others hold: committees don’t require seconds, a vote on a motion to Reconsider can’t itself be reconsidered, and Reconsider isn’t amendable. Committees also drop the time limit and let anyone who didn’t vote on the losing side make the motion.',
    cite: 'RONR (12th ed.) 37:35, 37:9, 49:21, 50:25',
  },
  q0516: {
    why: 'A member can’t simply refuse a duty such as a committee assignment, but the assembly can excuse them. The request is normally granted by unanimous consent; if someone objects, a motion to grant it is debated and voted on like an ordinary motion, by majority vote. There’s no three-fourths requirement and no need for the president’s permission.',
    cite: 'RONR (12th ed.) 32:1–2',
  },
  q0569: {
    why: 'Reconsider needs only a majority vote, whatever vote the original motion required and with no notice, so D is not one of its characteristics. The others are: in an ordinary one-day meeting it can be moved only on the same day as the vote (in a multi-day convention, that day or the next business day), and only by someone who voted with the prevailing side, meaning “aye” if the motion passed or “no” if it failed.',
    cite: 'RONR (12th ed.) 37:9, 37:10',
  },
  q0979: {
    why: 'A convention’s standing rules usually combine parliamentary rules about conducting business, such as a limit on debate, with nonparliamentary rules, and they last only for that one convention. They’re reported by the Committee on Standing Rules, not the Credentials Committee, so C is wrong, which also rules out “All of the above.”',
    conflict: 'Under the 12th edition, B is normally true as well: a package of convention standing rules needs a two-thirds vote whenever it includes any rule that would need two-thirds on its own, and in practice it almost always does. Dunbar keys A because B isn’t guaranteed in every case, so expect A to be the keyed answer.',
    cite: 'RONR (12th ed.) 59:13, 59:27, 59:34–35',
  },
  q1148: {
    why: 'RONR’s typical bylaws run in this order: Name, Object, Members, Officers, Meetings, Executive Board, Committees, Parliamentary Authority, Amendment of Bylaws. The mnemonic takes each first letter (N-O-M-O-M-E-C-P-A), so the two M’s are Members and Meetings.',
    cite: 'RONR (12th ed.) 2:9',
  },
  q0183: {
    why: 'That wording is RONR’s description of incidental motions. They handle questions of procedure arising out of other business, usually the pending motion (Point of Order, Appeal, Division of the Assembly), and most have to be settled right away. Subsidiary motions instead help the assembly dispose of a main motion, and privileged motions deal with urgent matters unrelated to the pending business.',
    cite: 'RONR (12th ed.) 6:15',
  },
  q0188: {
    why: 'The seven subsidiary motions are Postpone Indefinitely, Amend, Commit or Refer, Postpone to a Certain Time, Limit or Extend Limits of Debate, Previous Question, and Lay on the Table. Point of Order is an incidental motion: it calls attention to a breach of the rules and requires the chair to rule on it.',
    cite: 'RONR (12th ed.) 6:5, 6:17',
  },
  q0395: {
    why: 'To raise a question of privilege, a member rises and addresses the chair without waiting for recognition: “I rise to a question of privilege.” The member states the actual request only when the chair directs them to, which is the step choice B describes. It doesn’t need a two-thirds vote (the chair rules on whether it’s admissible and urgent), and because it’s privileged it can be raised while an amendment is pending.',
    conflict: 'Under the 12th edition, A is also true: a question of privilege generally can’t interrupt a member who is actually speaking. It can come after the floor has been assigned but before the speaker begins, and it can interrupt a speech only if waiting would defeat its purpose. Dunbar keys B, so expect B on a Dunbar-based test, but know the interruption rule too.',
    cite: 'RONR (12th ed.) 19:6, 19:8–9',
  },
  q0468: {
    why: 'The chair’s announcement of which side won a vote isn’t a ruling, so it can’t be appealed. A member who doubts the result should call for a Division, which makes the chair retake the vote as a standing vote, or move that the vote be counted. The chair shouldn’t ignore the member; the right response is to point them to a Division.',
    cite: 'RONR (12th ed.) 24:7',
  },
  q0524: {
    why: 'A Request for Information, which the 12th edition notes is also called a Point of Information, is directed to the chair, or through the chair to another officer or member. Members don’t question each other directly. It asks for facts relevant to the business at hand; a question about procedure is a Parliamentary Inquiry instead.',
    cite: 'RONR (12th ed.) 33:6; 43:22',
  },
  q0565: {
    why: 'Discharging a committee takes only that one matter away from it. A standing committee keeps existing and keeps its other work; a special (ad hoc) committee that was appointed for that matter goes out of existence. Either way, the committee chairman returns the papers on the matter to the secretary.',
    cite: 'RONR (12th ed.) 36:9',
  },
  q0599: {
    why: 'Without a quorum an assembly can’t transact business, but it can still take the steps needed to end or rescue the meeting: fix the time to which to adjourn, adjourn, recess, or take measures to obtain a quorum. Every choice listed is allowed, so the answer is All of the above.',
    cite: 'RONR (12th ed.) 40:7',
  },
  q0600: {
    why: 'Setting the time for an adjourned meeting is one of the few things allowed without a quorum, so urgent business can be taken up soon. Approving the minutes is business, so it isn’t allowed. Going into a committee of the whole or a quasi committee of the whole is a form of referring the question, which is business too. Not even unanimous consent can waive the quorum requirement.',
    cite: 'RONR (12th ed.) 40:7, 40:9',
  },
  q0673: {
    why: 'A presiding officer who wants to debate must leave the chair, normally handing it to the highest-ranking vice-president present who hasn’t spoken on the question. They can’t return to the chair until that main question is disposed of, because they’ve shown they’re on a side. RONR says this should be extremely rare.',
    cite: 'RONR (12th ed.) 43:29',
  },
  q0887: {
    why: 'Informal consideration removes only the limit on how many times members may speak, on the main question and on its amendments, so “can only debate amendments one time” is the false statement. Everything else runs normally: it suits meetings that aren’t large, the regular presiding officer stays in the chair, votes are formal decisions of the assembly, and the proceedings go in the minutes.',
    cite: 'RONR (12th ed.) 52:24–26',
  },
  q1497: {
    why: 'A quasi committee of the whole isn’t a real committee; it’s the assembly acting as if in committee of the whole, so the presiding officer stays in the chair throughout. The secretary keeps only a temporary memo, and the minutes record just the report and the action taken on it. There’s no motion to rise; the chair reports once no more amendments are offered.',
    cite: 'RONR (12th ed.) 52:19, 52:21, 52:23',
  },
  q1545: {
    why: 'After a few preliminaries (reading the resolutions about the trial, confirming the accused received the charges, announcing the managers, asking about counsel), the trial itself starts in order: first the secretary reads the charge and specifications, then the chair asks the accused how they plead. Opening statements, witnesses, and closing arguments come only after a plea of not guilty.',
    cite: 'RONR (12th ed.) 63:33',
  },
}
