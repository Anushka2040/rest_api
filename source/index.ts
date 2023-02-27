import http from "http";

import { getpet, addpet, updatepet, deletepet } from "./controller";
import { getstore, addstore, deletestore } from "./storeController";
import { getuser, adduser, updateuser, deleteuser } from "./userController";

const expressionStore = new RegExp("^/api/store/?[A-z0-9-]?");
const expressionPet = new RegExp("^/api/pet/?[A-z0-9-]?");
const expressionUser = new RegExp("^/api/user/?[A-z0-9-]?");

const server = http.createServer((req, res) => {
  // get request
  if (req.method == "GET") {
    if (expressionPet.test(String(req.url))) {
      return getpet(req, res);
    } else if (expressionStore.test(String(req.url))) {
      return getstore(req, res);
    } else {
      return getuser(req, res);
    }
  }

  // post request
  if (req.method == "POST") {
    if (expressionPet.test(String(req.url))) {
      return addpet(req, res);
    } else if (expressionStore.test(String(req.url))) {
      return addstore(req, res);
    } else {
      return adduser(req, res);
    }
  }

  // put request
  if (req.method == "PUT") {
    if (expressionPet.test(String(req.url))) {
      return updatepet(req, res);
    }
    if (expressionUser.test(String(req.url))) {
      return updateuser(req, res);
    }
  }

  // delete request
  if (req.method == "DELETE") {
    if (expressionPet.test(String(req.url))) {
      return deletepet(req, res);
    } else if (expressionStore.test(String(req.url))) {
      return deletestore(req, res);
    } else {
      return deleteuser(req, res);
    }
  }
});

// set up the server port and listen for connections
server.listen(3000, () => {
  console.log("Server is running on port 3000. Go to http://localhost:3000/");
});
