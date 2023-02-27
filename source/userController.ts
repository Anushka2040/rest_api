import fs from "fs";
import path from "path";
import { userInterface } from "./Iuser";
import { ServerResponse, IncomingMessage } from "http";
import bcryptjs from "bcryptjs";
const jwt = require("jsonwebtoken");

const getuser = (req: IncomingMessage, res: ServerResponse) => {
  let baseUrl = req.url?.substring(0, req.url.lastIndexOf("/") + 1);
  var uname = req.url?.split("/")[3] as string; //Error occured here solved by adding as string
  var accessUrl = req.url?.split("?")[0] as string;
  console.log(accessUrl);
  const regexV = new RegExp(/^[A-Za-z0-9]*$/);
  let users = require("./user.json");
  return fs.readFile(path.join(__dirname, "user.json"), "utf8", (err) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: err,
        })
      );
      // } else if (baseUrl === "/api/user/" && !regexV.test(uname)) {
      //   res.writeHead(404, { "Content-Type": "application/json" });
      //   res.end(
      //     JSON.stringify({
      //       success: false,
      //       title: "Validation Failed",
      //       message: "UUID is not valid",
      //     })
      //   );
    } else if (accessUrl === "/api/user/" && regexV.test(uname)) {
      res.setHeader("Content-type", "application/json");
      let filtereduser = users.filter((singleuser: userInterface) => {
        return String(singleuser.username) === String(uname);
      });
      if (filtereduser.length > 0) {
        res.statusCode = 200;
        res.write(JSON.stringify(filtereduser));
        res.end();
      } else {
        res.statusCode = 404;
        res.write(
          JSON.stringify({ title: "Not Found", message: "User Not Found" })
        );
        res.end();
      }
    } else if (accessUrl == "/api/user/login") {
      var query = require("url").parse(req.url, true).query;
      console.log(query);
      var userName = query.username;
      var pass = query.password;
      const findUserById = users.find(
        (user: userInterface) => String(user.username) == String(userName)
      );
      const password = findUserById.password;
      bcryptjs.compare(pass, password).then((match) => {
        console.log(match);
        if (!match) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              error: "Wrong Username and Password Combination!",
            })
          );
        } else {
          const token = jwt.sign({ id: findUserById.id }, "secret_key", {
            expiresIn: 60 * 60 * 60 * 60,
          });
          console.log(token);
          res.statusCode = 200;
          res.setHeader("access-token", token);
          res.end("LOGGED IN!");
        }
      });
    } else if (String(accessUrl) == "/api/user/logout") {
      const authHeader = req.headers["access-token"];
      const token = jwt.sign({ "access-token": authHeader }, "", {
        expiresIn: 1,
      });
      if (token) {
        res.statusCode = 200;
        res.end(JSON.stringify({ mssg: "USER LOGGED OUT!" }));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ mssg: "ERROR!" }));
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          message: "INCORRECT URL",
        })
      );
    }
  });
};

const adduser = (req: IncomingMessage, res: ServerResponse) => {
  let users = require("./user.json");
  let check = req.url?.split("/")[3] as string;
  if (
    String(check) === "createWithArray" ||
    String(check) === "createWithList"
  ) {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk.toString();
    });

    req.on("end", () => {
      let inputUsers = JSON.parse(data);
      fs.readFile(path.join(__dirname, "user.json"), "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: err,
            })
          );
        } else {
          let allUsers: [userInterface] = JSON.parse(data);
          for (let i = 0; i < inputUsers.length; i++) {
            let latest_id = allUsers.reduce(
              (max = 0, user: userInterface) =>
                Number(user.id) > max ? Number(user.id) : max,
              0
            );
            inputUsers[i].id = latest_id + 1;
            bcryptjs
              .hash(inputUsers[i].password, 10)
              .then((hash) => {
                const user = {
                  id: inputUsers[i].id,
                  username: inputUsers[i].username,
                  firstName: inputUsers[i].firstName,
                  lastName: inputUsers[i].lastName,
                  email: inputUsers[i].email,
                  password: hash,
                  phone: inputUsers[i].phone,
                  userStatus: inputUsers[i].userStatus,
                };
                allUsers.push(user);
                fs.writeFile(
                  path.join(__dirname, "user.json"),
                  JSON.stringify(allUsers),
                  () => {
                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(
                      JSON.stringify({
                        success: true,
                        message: inputUsers,
                      })
                    );
                  }
                );
              })
              .catch((err) => {
                if (err) {
                  res.statusCode = 400;
                  res.write(JSON.stringify({ error: err }));
                }
              });
          }
        }
      });
    });
  } else {
    const validateToken = req.headers["access-token"];
    console.log(validateToken);
    jwt.verify(validateToken, "secret_key", () => {
      if (validateToken) {
        let data = "";

        req.on("data", (chunk) => {
          data += chunk.toString();
        });

        req.on("end", () => {
          fs.readFile(
            path.join(__dirname, "user.json"),
            "utf8",
            (err, data) => {
              if (err) {
                res.writeHead(500, {
                  "Content-Type": "application/json",
                });
                res.end(
                  JSON.stringify({
                    success: false,
                    error: err,
                  })
                );
              } else {
                let user = JSON.parse(data);
                let latest_id = users.reduce(
                  (max = 0, user: userInterface) =>
                    Number(user.id) > max ? Number(user.id) : max,
                  0
                );
                user.id = latest_id + 1;
                users.push(user);
                fs.writeFile(
                  path.join(__dirname, "user.json"),
                  JSON.stringify(users),
                  () => {
                    res.writeHead(201, {
                      "Content-Type": "application/json",
                    });
                    res.end(
                      JSON.stringify({
                        success: true,
                        message: users,
                      })
                    );
                  }
                );
              }
            }
          );
        });
      } else {
        res.statusCode = 404;
        res.end(
          JSON.stringify({
            success: false,
            mssg: "USER NOT LOGGED IN!",
          })
        );
      }
    });
  }
};

const updateuser = (req: IncomingMessage, res: ServerResponse) => {
  const validateToken = req.headers["access-token"];
  console.log(validateToken);
  jwt.verify(validateToken, "secret_key", () => {
    if (validateToken) {
      let baseUrl = req.url?.substring(0, req.url.lastIndexOf("/") + 1);
      var uid = req.url?.split("/")[3] as string; //Error occured here solved by adding as string
      const regexV = new RegExp(/^[0-9]+$/);
      let users = require("./user.json");
      let data = "";
      req.on("data", (chunk) => {
        data += chunk.toString();
      });
      req.on("end", () => {
        let user = JSON.parse(data);
        fs.readFile(path.join(__dirname, "user.json"), "utf8", (err, data) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: false,
                error: err,
              })
            );
          } else {
            if (baseUrl == "/api/user/" && !regexV.test(uid)) {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  title: "Validation Failed",
                  message: "UUID is not valid",
                })
              );
            } else if (baseUrl == "/api/pet/" && regexV.test(uid)) {
              let index = users.findIndex((user: userInterface) => {
                return Number(user.id) === Number(uid);
              });
              user.id = uid;
              users[index] = user;
              if (index == -1) {
                res.statusCode = 404;
                res.write(
                  JSON.stringify({
                    title: "Not Found",
                    message: "USER NOT FOUND",
                  })
                );
                res.end();
              } else {
                fs.writeFile(
                  path.join(__dirname, "user.json"),
                  JSON.stringify(users),
                  () => {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(
                      JSON.stringify({
                        success: true,
                        message: user,
                      })
                    );
                  }
                );
              }
            }
          }
        });
      });
    } else {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          success: false,
          mssg: "USER NOT LOGGED IN!",
        })
      );
    }
  });
};

const deleteuser = (req: IncomingMessage, res: ServerResponse) => {
  const validateToken = req.headers["access-token"];
  console.log(validateToken);
  jwt.verify(validateToken, "secret_key", () => {
    if (validateToken) {
      let baseUrl = req.url?.substring(0, req.url.lastIndexOf("/") + 1);
      var uid = req.url?.split("/")[3] as string; //Error occured here solved by adding as string
      const regexV = new RegExp(/^[0-9]+$/);
      let users = require("./user.json");
      fs.readFile(path.join(__dirname, "user.json"), "utf8", (err) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              error: err,
            })
          );
        } else if (baseUrl == "/api/user/" && !regexV.test(uid)) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              title: "Validation Failed",
              message: "UUID is not valid",
            })
          );
        } else if (baseUrl == "/api/user/" && regexV.test(uid)) {
          const index = users.findIndex((user: userInterface) => {
            return Number(user.id) === Number(uid);
          });
          if (index === -1) {
            res.statusCode = 404;
            res.write(
              JSON.stringify({ title: "Not Found", message: "user Not Found" })
            );
            res.end();
          } else {
            users.splice(index, 1),
              fs.writeFile(
                path.join(__dirname, "user.json"),
                JSON.stringify(users),
                () => {
                  res.writeHead(200, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({
                      success: true,
                      message: "Deleted the user",
                    })
                  );
                }
              );
          }
        }
      });
    } else {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          success: false,
          mssg: "USER NOT LOGGED IN!",
        })
      );
    }
  });
};

export { getuser, adduser, updateuser, deleteuser };
