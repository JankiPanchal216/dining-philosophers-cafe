export const CATALOG = [
  {
    id: 'deadlock',
    title: 'Deadlock',
    labs: [
      {
        id: 'naive',
        strategy: 'naive',
        kind: 'problem',
        title: 'Naive: left, then right',
        short: 'Everyone grabs left first',
        summary:
          'Every philosopher picks up the left fork, then waits for the right one. All five end up holding one fork each, waiting on a neighbour who is also waiting.',
      },
      {
        id: 'ordering',
        strategy: 'ordering',
        kind: 'solution',
        title: 'Resource ordering',
        short: 'Lowest-numbered fork first',
        breaks: 'Circular wait',
        uses: 'Mutex per fork',
        summary:
          'Forks are numbered and everyone must take the lower-numbered fork first. P5 therefore reaches for F1 before F5, so a cycle of waiting can never close.',
      },
      {
        id: 'room',
        strategy: 'room',
        kind: 'solution',
        title: 'Room semaphore',
        short: 'At most 4 at the table',
        breaks: 'Circular wait',
        uses: 'Counting semaphore (N−1)',
        summary:
          'A semaphore only lets four philosophers sit down at once. With five forks and four people, at least one of them can always finish eating.',
      },
      {
        id: 'waiter',
        strategy: 'waiter',
        kind: 'solution',
        title: 'Waiter',
        short: 'Both forks or none',
        breaks: 'Hold and wait',
        uses: 'Central arbiter',
        summary:
          'A waiter hands out both forks in one step, or none. Nobody ever holds a single fork while waiting for the other.',
      },
      {
        id: 'try-lock',
        strategy: 'tryLock',
        kind: 'solution',
        title: 'Try-lock + back-off',
        short: 'Give up and retry later',
        breaks: 'No preemption',
        uses: 'try-lock, random delay',
        summary:
          'If the second fork is busy, the philosopher puts the first one back and waits a random time before trying again. Random delays stop everyone retrying in lockstep.',
      },
    ],
  },
  {
    id: 'starvation',
    title: 'Starvation',
    labs: [
      {
        id: 'greedy',
        strategy: 'greedy',
        kind: 'problem',
        title: 'Greedy priority',
        short: 'P1 is always last',
        summary:
          'Forks go to the highest-priority hungry neighbour. P2 and P5 take turns, so one of P1’s forks is always in use. There is no deadlock, yet P1 never eats.',
      },
      {
        id: 'fifo',
        strategy: 'fifo',
        kind: 'solution',
        title: 'FIFO queue',
        short: 'First come, first served',
        breaks: 'Unbounded waiting',
        uses: 'Ticket queue',
        summary:
          'Requests are served in arrival order and nobody may overtake a neighbour who asked earlier. P1’s wait is now bounded.',
      },
      {
        id: 'chandy-misra',
        strategy: 'chandy',
        kind: 'solution',
        title: 'Chandy–Misra',
        short: 'Clean and dirty forks',
        breaks: 'Unbounded waiting',
        uses: 'Request tokens, no arbiter',
        summary:
          'Forks are always owned by someone and are clean or dirty. A used (dirty) fork must be handed over when a neighbour asks, so nobody can hog one.',
      },
    ],
  },
];

export const FIRST_LAB = `/${CATALOG[0].id}/${CATALOG[0].labs[0].id}`;

export function findLab(problemId, labId) {
  const problem = CATALOG.find((p) => p.id === problemId);
  const lab = problem?.labs.find((l) => l.id === labId);
  return lab ? { problem, lab } : null;
}
