# project-frontend

[TOC]

## Instructions

1. Run your backend on port 49153
    ```sh
    PORT=49153 npm start            # make sure you are in your backend repository
    ```

2. Clone this repository at another location (not within your project-backend), then `cd` into it
    ```sh
    git clone <REPLACE_WITH_SSH_CLONE_LINK>
    cd project-frontend
    ```

3. Run the frontend on port 3000
    ```sh
    ./run_frontend.sh 49153 3000
    ```
4. Open your browser (e.g. google chrome or firefox) at the URL `http://localhost:3000`

## Changing Ports

You can specify the backend and frontend port as when running the frontend as follows:
```
./run_frontend.sh BACKEND_PORT FRONTEND_PORT
```
