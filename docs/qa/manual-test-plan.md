# Manual Test Plan — MVP (Phase 6)

Written 2026-10-08 (Europe/Prague). Anyone can run these cases in Chrome on the laptop without developer knowledge.

**Status: not yet executed.** Each case has an empty result column. The automated proof that already exists for every requirement is listed in `requirements-traceability-matrix.md`. These cases add a human check on the real target, which matters most for MT-16..MT-19.

## Setup

1. Back up first: in `backend`, run `npm run backup` (NFR-10). The stack may hold the owner's data.
2. Start the stack: in `backend`, run `npm run stack:up`. Open `http://localhost:8081` (child) and `/admin` (admin).
3. Use **self-authored content only**: a blank PDF you made yourself and tasks you wrote yourself. Never use workbook pages (NFR-4). Do not enter the child's real name anywhere you will screenshot (NFR-3).
4. When you finish, restore the backup with `npm run restore` and remove the test PDF from the storage volume (the same cleanup as `../backend/docs/qa/evidence/slice9-compose-smoke.md`, step 9).

## Cases

| MT | Requirements | Steps | Expected result | Result |
|---|---|---|---|---|
| MT-01 | FR-1, NFR-17 | Admin, Sources: upload your PDF with publisher, edition, grade and subject. Then try a 60 MB PDF and a .docx file. | The source is listed with its page count. Both bad files are refused with a clear message. | |
| MT-02 | FR-2, FR-3, NFR-8 | New task: the PDF shows beside the editor. Go to a page and enter a single-part task. Time yourself. | Source and page stay filled in (sticky). The task saves in 60 s or less. | |
| MT-03 | FR-4, FR-5, FR-6, FR-7, FR-8 | Add 2 images and reorder them. Add 2 parts with different answer types, 3 hints and a Ukrainian translation. Save. | Everything shows again in the same order after a reload. | |
| MT-04 | FR-10, FR-12 | Open Preview and type a correct answer and a wrong answer in the tester. | You see the verdict and how the input was read (e.g. `0,5` read as 0.5). | |
| MT-05 | FR-11, FR-13 | Filter the task list. Open a task's source page from the list. | The filter works, and the PDF opens at the task's page. | |
| MT-06 | FR-9, FR-55, FR-56, FR-57 | Create a mission, reorder its tasks and publish it while some tasks are DRAFT. Then try to delete a source that tasks use. | Publishing is refused with links to the DRAFT tasks. After you publish the tasks, publishing works. Deleting the source is refused and the referencing tasks are listed. | |
| MT-07 | FR-14..FR-23 | Child: answer with a comma decimal, extra spaces, an equivalent form and gibberish. | Equivalent answers are accepted. Gibberish gets a "can't read that" message and does not count as a wrong attempt. | |
| MT-08 | FR-24, FR-25, FR-26, NFR-7 | Child HQ: start a mission. Count the clicks. | You reach the first task in 2 clicks or fewer. Enter submits the answer. | |
| MT-09 | FR-27, FR-28, FR-29, FR-30 | Answer wrong twice, open the hints, switch to the translation, report the task. | The answer is revealed after the allowed attempts. Hints come in order. The report is confirmed. | |
| MT-10 | FR-31, FR-32, FR-33 | Leave in the middle of a mission and come back. Finish it, then replay it. | You resume where you left off. The completion screen shows; the replay works. | |
| MT-11 | FR-34..FR-38 | Earn XP until you rank up. | XP and rank change. The rank-up animation plays, and it does not play with reduced motion on (NFR-13). | |
| MT-12 | FR-39, FR-58 | Look at the HQ skin in light and in dark OS mode. | Both themes are fully painted, readable and original (no third-party characters). | |
| MT-13 | FR-40, FR-42 | Admin Stats. | The weekly table and first-try rates match what you did in MT-07..MT-10. | |
| MT-14 | FR-41 | Admin Reports: fix the answer in a reported task and re-evaluate it. | The report becomes FIXED, the child's XP is corrected, and repeating the action is refused. | |
| MT-15 | FR-43, FR-44 | Set the child profile's secondary task locale to `uk`, then to none. Try to pick the GUIDED answer mode. Then answer a task wrong. | The translation offer appears with `uk` and disappears with none. GUIDED cannot be chosen (only DIRECT). After the wrong answer you get the same feedback every time: the verdict, a hint pointer, and the reveal once you run out of attempts. | |
| MT-16 | NFR-1, NFR-15, NFR-16 | Open `/admin` without signing in. Sign in, then stay idle (or check the cookie flags in DevTools). | You are asked to sign in. The cookie is HttpOnly and SameSite=Strict. The session expires after 8 h of inactivity. | |
| MT-17 | NFR-2 | From another device on the LAN, open the app. From outside the LAN (e.g. a phone on mobile data), try the laptop's public address. | It works on the LAN and cannot be reached from the internet. | |
| MT-18 | NFR-5, NFR-6 | On the owner's laptop, in Chrome, Edge and Firefox at 1280x720 or larger, open a task and submit an answer. | The task loads in under 1.5 s and the answer check feels instant (under 300 ms). | |
| MT-19 | NFR-9, NFR-10 | Check that the child UI is Czech and the admin UI is English. Run `npm run backup` and then `npm run restore`. | The languages are correct, and the data is unchanged after the restore. | |
