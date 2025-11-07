# How to start application
The k8s scripts and start up process need refinement. The easiest way to start the application right now will be to open 3 terminal tabs, cd into the project's root directory and use the makefile
---
## 1. Start the database and run migration
```bash
make start-db
make migrate
``` 
## 2. Start the backend application in one tab
```bash
make start-backend
```

## 3. Start the frontend application in another tab
```bash
make start-frontend
```
---
### Find the application at `localhost:4200`