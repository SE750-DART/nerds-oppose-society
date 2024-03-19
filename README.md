# Nerds Oppose Society

## Working in a monorepo

This project is managed as a monorepo using [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). You must initially `npm i` _from the root of the project_ to properly setup tooling, including git hooks through [husky](https://typicode.github.io/husky/#/). This will install all required packages of `backend`, `frontend` and `frontend-v2`.

Once installed from the root, be mindful of your current working directory when executing npm commands. `npm start` will not work in the root; only from `backend` or `frontend`. If you wish to not `cd` into the relevant package, you can use the `-w` flag like so: `npm run -w backend start`; this tells npm which package to execute the script in.

Similarly, when installing new packages, the directory you're in will determine if the dependency is added to a particular package or the root. You should avoid installing packages in the root unless you're sure that both the backend and frontend need them.

Basically ensure your terminal is in the right directory when using npm.

## Running locally

### Database

For full functionality, the frontend and backend must both be run in conjunction with a local mongoDB server. To install mongoDB via Docker:

1. Install Docker for Desktop and ensure that it's running
2. Open a terminal and run `docker pull mongo`
3. Open Docker for Desktop, navigate to Images, find the `mongo:latest` image, and click `run` (play icon)
4. In the dialog window, open Optional settings and configure as follows:
   i. Container name: `nos-db`
   ii. Host port: `27017` - this must be manually set, don't leave it as 27017/tcp
5. Click `Run`

### Frontend

The legacy frontend was spun up with create-react-app & Babel. Will eventually be retired.

```sh
cd frontend
npm start
```

### Frontend v2

The v2 frontend was spun up with vite & SWC. Freshly in development, not yet at feature parity.

```sh
cd frontend-v2
npm dev
```

### Backend

```sh
cd backend
npm start
```

## Optional tools

### [better-commits](https://github.com/Everduin94/better-commits)

The [Conventional Commits standard](https://www.conventionalcommits.org/en/v1.0.0/) keeps commits clean and predictable. We like that, but we don't like how it can be tedious and error-prone to write manually. Thankfully, there's a FOSS tool available to structure conventional commits for us.

Simply follow the linked instructions to install [better-commits](https://github.com/Everduin94/better-commits) and you can create a commit with `better-commits` and also branches with `better-branch` (this enables autofilling of some commit fields). A local config exists in this repo with sensible defaults for commit types and scopes, as well as emojis enabled 😎

When prompted for a `ticket/issue number`, feel free to write the GitHub issue number `#123` if one exists - if you do this GitHub will understand to link the issue to the PR automatically.

_Usage of this tool or the conventional commits standard is not required or enforced_, we just like it.
