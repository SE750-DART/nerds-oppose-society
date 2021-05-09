# NerdsOpposeSociety

## Getting Started

For full functionality, the frontend and backend must both be run in conjunction with a local mongoDB server. Instructions for installing mongoDB can be found [here](https://github.com/SE750-DART/nerds-oppose-society/wiki/Setting-Up-MongoDB).

To start the frontend:

```
cd frontend/
npm ci
npm start
```

To start the backend:

```
cd backend/
npm ci
npm start
```

To start the databases:

```
cd backend/
docker-compose pull
docker-compose up
```

Prerequisites: Docker (docker for desktop prefereably: see the wiki)
