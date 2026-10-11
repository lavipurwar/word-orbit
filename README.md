# Word Orbit — GitHub Pages setup

This is a static app. No npm install, build command, API key, or backend is needed.

1. Extract this ZIP.
2. Visit https://github.com/new and create a repository named word-orbit.
   Choose Public for free GitHub Pages hosting and enable Add README.
3. In the repository, select Add file > Upload files.
4. Upload the extracted files directly to the repository root:
   index.html, styles.css, app.js, vocab.json, icon.svg, README.md, and .nojekyll.
   Do not upload the ZIP or put index.html inside an extra folder.
   .nojekyll may be hidden in your file manager; it is included as a convenience.
5. Commit the files to main.
6. Open Settings > Pages. Under Build and deployment, select:
   Source: Deploy from a branch
   Branch: main
   Folder: /(root)
   Click Save.
7. Wait for deployment and use the live URL shown in Settings > Pages:
   https://YOUR-USERNAME.github.io/word-orbit/
   It can take up to 10 minutes. If it fails, inspect the Actions tab.

## Progress and moving to this version

Each browser saves its own progress in localStorage. Hosting does not add cloud sync.
Before switching, click Export progress at the bottom of the original app.
On the GitHub-hosted app, use Restore backup and select the downloaded JSON.
Progress does not transfer automatically between domains or devices.

## App content

10 days, 100 words each, 5 batches of 20 per day.
990 words and definitions/examples from the supplied PDF plus 10 marked bonus words.
Includes study cards, pronunciation via browser speech synthesis, batch quizzes,
daily challenges, review scheduling, search, and progress backup/restore.

## Updating

Upload replacement files to the same repository and commit to main.
GitHub Pages will publish those changes automatically.

## Official help

https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
