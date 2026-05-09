# hns-recorder

## Hub & Spoke Recorder Web App
A front-end–only web application for the Hub & Spoke Speech Collection project that presents visual or text-based stimuli to participants and records their spoken responses. The application captures audio using the [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder?utm_source=chatgpt.com) and, on supported browsers, uses the [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API?utm_source=chatgpt.com) to save recordings as WAV files directly to the participant’s local machine. Browser compatibility for the File System API can be found on [Can I Use](https://caniuse.com/?search=File+System+API&utm_source=chatgpt.com).

Live website:
https://nu-speech-communication-research-group.github.io/hns-recorder/

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup
Clone this Github respository then run:
```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in a browser to test locally

### Compile and Minify for Production

```sh
npm run build
```

### Github pages deployment
- Commit to the `main` branch
- Github actions will build and deploy to Github pages automatically

In the event that a code revert is needed

```sh
git log --oneline
git revert <commit-sha>
git push
```

## Testing
Note: testing is still a work in progress

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
