# Dining Philosophers Café

One page. Pick a problem or a fix in the sidebar; each one runs its own live simulation.

```
npm install
npm run dev
```

- **Deadlock:** Naive (the problem) · Resource ordering · Room semaphore · Waiter · Try-lock + back-off
- **Starvation:** Greedy priority (the problem) · FIFO queue · Chandy–Misra

Every fork shows who holds it (name + colour), every philosopher shows what they are doing
and what they are waiting for. Space pauses/resumes. Light/dark toggle is top right.

Code: `src/sim/` is the engine (one strategy per lab), `src/components/Table.jsx` draws the table,
`src/data/catalog.js` lists the labs shown in the sidebar.
