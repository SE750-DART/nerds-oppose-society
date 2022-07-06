# NerdsOpposeSociety

## Getting Started

### Database

For full functionality, the frontend and backend must both be run in conjunction with a local mongoDB server. Instructions for installing mongoDB can be found [here](https://github.com/SE750-DART/nerds-oppose-society/wiki/Setting-Up-MongoDB).

### Monorepo tooling

This project is managed as a monorepo using [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). You must initially `npm i` from the root of the project to properly setup tooling, including git hooks through [husky](https://typicode.github.io/husky/#/). Calling `npm i` from the root will install all required packages of `backend/` and `frontend/`. After the initial install from the root you are able to use `npm i` from subdirecties `backend/` and `frontend/` to update and install new packages.

### Frontend

To start:

```sh
cd frontend/
npm i
npm start
```

### Backend

To start:

```sh
cd backend/
npm i
npm start
```
