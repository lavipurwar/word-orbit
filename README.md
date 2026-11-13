# Word Orbit

This is a static app. No npm install, build command, API key, or backend is needed.

## Blocky Blast Puzzle

Each correct quiz answer earns one puzzle piece. Open Blocky Blast from the
quiz feedback or the button above any page. Select an earned piece, then select
its top-left square on the 8×8 board. You can also drag pieces with a finger,
mouse, or pen. A green preview shows a valid drop; red shows a blocked placement.
On touch screens the piece lifts above your finger so the target stays visible.
Invalid drops return the piece to the tray. Drag near a screen edge to scroll;
swipe outside a piece to scroll normally. Pieces do not rotate. Complete rows and
columns clear together: earn 10 points per placed square and 100 per cleared line.
Successful placements play a snap chime; invalid drops play a soft low tone.
Line clears play a rising chime and show a blast celebration, with an extra
all-clear message when the board empties. Sound on/off is saved with progress.
Sounds are generated locally in the browser; no audio downloads are needed.
Animations respect the device's reduced-motion preference.
Return to learning at any time without leaving the current quiz question.

The board, unused pieces, round score, and best score save with vocabulary
progress and are included in progress backups. Older backups start with an empty
puzzle. A fresh board resets the round score but keeps unused pieces and the best
score. Revisiting an answered question cannot earn another piece.

Publish `puzzle.js`, `puzzle-ui.js`, and `puzzle.css` alongside the existing files.
Run the puzzle checks with `node puzzle.test.cjs`.

10 days, 100 words each, 5 batches of 20 per day.
Includes study cards, pronunciation via browser speech synthesis, batch quizzes,
daily challenges, review scheduling, search, and progress backup/restore.

## Progress and moving to this version

Each browser saves its own progress in localStorage. Hosting does not add cloud sync.
Before switching, click Export progress at the bottom of the original app.
On the GitHub-hosted app, use Restore backup and select the downloaded JSON.
Progress does not transfer automatically between domains or devices.


## New in this update

- Previous and Next controls on study cards, review cards, and quiz questions.
- Open any word as a review card and browse the complete filtered list.
- Previous/Next pagination for the word bank and long review lists.
- Backtracking preserves answered questions and never counts an answer twice.
- You can skip a quiz question and return to it; all questions must be answered before finishing.
- 1,000 newly written example templates with 576 named scenario variations per word.
- Review sessions automatically use fresh sentence variations.
- New sentence buttons on review examples and revealed cards.
- Sentence variations run entirely in your browser, without an API key or a server.

Existing saved progress remains compatible. Upload ALL app files in this update,
including the NEW examples.json. Keep the filenames and root folder arrangement.

## Updating

Upload replacement files to the same repository and commit to main.
GitHub Pages will publish those changes automatically.

## Official help

https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
