import { DataStore } from './types/internalTypes';

import fs from 'node:fs';

const DATA_FILE = 'data.json';

// YOU MAY MODIFY THIS OBJECT BELOW
const data: DataStore = {
  users: [],
  nextUserId: 1,
  quizzes: [],
  nextQuizId: 1,
  sessions: [],
  games: [],
  players: [],
  nextGameId: 1,
  nextPlayerId: 1,
};

// YOU MAY MODIFY THIS OBJECT ABOVE

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
  let store = getData()
  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

  store.names.pop() // Removes the last name from the names array
  store.names.push('Jake') // Adds 'Jake' to the end of the names array

  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
*/

// Use getData() to access the data
export function getData() {
  return data;
}

/** Save data helper. Call this whenever the data changes */
export function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(getData(), null, 2));
}

/** Load data helper. Call this **ONLY ONCE** when the server starts */
export function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    // If file doesn’t exist, start with empty data and create it
    const initialData = {
      users: [],
      nextUserId: 1,
      quizzes: [],
      nextQuizId: 1,
      sessions: [],
      games: [],
      players: [],
      nextGameId: 1,
      nextPlayerId: 1,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }

  const data: DataStore = getData();
  const newData = JSON.parse(fs.readFileSync(DATA_FILE, { encoding: 'utf-8' }));
  data.users = newData.users;
  data.nextUserId = newData.nextUserId;
  data.quizzes = newData.quizzes;
  data.nextQuizId = newData.nextQuizId;
  data.sessions = newData.sessions;
  data.games = newData.games;
  data.players = newData.players;
  data.nextGameId = newData.nextGameId;
  data.nextPlayerId = newData.nextPlayerId;

  // Any other fields added to datastore
}
