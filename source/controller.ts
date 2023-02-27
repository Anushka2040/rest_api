import fs from "fs";
import path from "path";
import { ServerResponse, IncomingMessage } from "http";
import { petInterface } from "./Ipet";

const getpet = (req: IncomingMessage, res: ServerResponse) => {
  let baseUrl = req.url?.substring(0, req.url.lastIndexOf("/") + 1);
  var uid = req.url?.split("/")[3] as string; //Error occured here solved by adding as string
  const regexV = new RegExp(/^[0-9]+$/);
  let pets = require("./pet.json");
  return fs.readFile(path.join(__dirname, "pet.json"), "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: err,
        })
      );
    } else if (baseUrl == "/api/pet/" && !regexV.test(uid)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          title: "Validation Failed",
          message: "UUID is not valid",
        })
      );
    } else if (baseUrl == "/api/pet/" && regexV.test(uid)) {
      res.setHeader("Content-type", "application/json");
      let filteredpet = pets.filter((singlepet: petInterface) => {
        return Number(singlepet.id) === Number(uid);
      });
      if (filteredpet.length > 0) {
        res.statusCode = 200;
        res.write(JSON.stringify(filteredpet));
        res.end();
      } else {
        res.statusCode = 404;
        res.write(
          JSON.stringify({ title: "Not Found", message: "Pet Not Found" })
        );
        res.end();
      }
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: JSON.parse(data),
        })
      );
    }
  });
};

const addpet = (req: IncomingMessage, res: ServerResponse) => {
  let data = "";

  req.on("data", (chunk) => {
    data += chunk.toString();
  });

  req.on("end", () => {
    let pet = JSON.parse(data);

    fs.readFile(path.join(__dirname, "pet.json"), "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      } else {
        let pets: [petInterface] = JSON.parse(data);
        let latest_id = pets.reduce(
          (max = 0, pet: petInterface) =>
            Number(pet.id) > max ? Number(pet.id) : max,
          0
        );
        pet.id = latest_id + 1;
        pets.push(pet);
        fs.writeFile(
          path.join(__dirname, "pet.json"),
          JSON.stringify(pets),
          () => {
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                message: pet,
              })
            );
          }
        );
      }
    });
  });
};

const updatepet = (req: IncomingMessage, res: ServerResponse) => {
  let baseUrl = req.url?.substring(0, req.url.lastIndexOf("/") + 1);
  var uid = req.url?.split("/")[3] as string; //Error occured here solved by adding as string
  const regexV = new RegExp(/^[0-9]+$/);
  let pets = require("./pet.json");
  let data = "";
  req.on("data", (chunk) => {
    data += chunk.toString();
  });
  req.on("end", () => {
    let pet = JSON.parse(data);
    fs.readFile(path.join(__dirname, "pet.json"), "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      } else {
        if (baseUrl == "/api/pet/" && !regexV.test(uid)) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              success: false,
              title: "Validation Failed",
              message: "UUID is not valid",
            })
          );
        } else if (baseUrl == "/api/pet/" && regexV.test(uid)) {
          let index = pets.findIndex((pet: petInterface) => {
            return Number(pet.id) === Number(uid);
          });
          pet.id = uid;
          pets[index] = pet;
          if (index == -1) {
            res.statusCode = 404;
            res.write(
              JSON.stringify({ title: "Not Found", message: "Pet Not Found" })
            );
            res.end();
          } else {
            fs.writeFile(
              path.join(__dirname, "pet.json"),
              JSON.stringify(pets),
              () => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: true,
                    message: pet,
                  })
                );
              }
            );
          }
        }
      }
    });
  });
};

const deletepet = (req: IncomingMessage, res: ServerResponse) => {
  let baseUrl = req.url?.substring(0, req.url.lastIndexOf("/") + 1);
  var uid = req.url?.split("/")[3] as string; //Error occured here solved by adding as string
  const regexV = new RegExp(/^[0-9]+$/);
  let pets = require("./pet.json");
  fs.readFile(path.join(__dirname, "pet.json"), "utf8", (err) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: err,
        })
      );
    } else if (baseUrl == "/api/pet/" && !regexV.test(uid)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          title: "Validation Failed",
          message: "UUID is not valid",
        })
      );
    } else if (baseUrl == "/api/pet/" && regexV.test(uid)) {
      const index = pets.findIndex((pet: petInterface) => {
        return Number(pet.id) === Number(uid);
      });
      if (index === -1) {
        res.statusCode = 404;
        res.write(
          JSON.stringify({ title: "Not Found", message: "Pet Not Found" })
        );
        res.end();
      } else {
        pets.splice(index, 1),
          fs.writeFile(
            path.join(__dirname, "pet.json"),
            JSON.stringify(pets),
            () => {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: true,
                  message: "Deleted the pet",
                })
              );
            }
          );
      }
    }
  });
};

export { getpet, addpet, updatepet, deletepet };
