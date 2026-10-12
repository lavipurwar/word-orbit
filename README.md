# Word Orbit

This is a static app. No npm install, build command, API key, or backend is needed.

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
