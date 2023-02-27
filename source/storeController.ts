import fs from "fs";
import path from "path";

import { storeInterface } from "./Istore";

import { ServerResponse, IncomingMessage } from "http";

const getstore = (req: IncomingMessage, res: ServerResponse) => {
  let baseUrl = req.url?.substring(0, req.url.lastIndexOf("/") + 1);
  var uid = req.url?.split("/")[4] as string; //Error occured here solved by adding as string
  const regexV = new RegExp(/^[0-9]+$/);
  let order = require("./store.json");
  return fs.readFile(
    path.join(__dirname, "store.json"),
    "utf8",
    (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      } else if (baseUrl == "/api/store/order/" && !regexV.test(uid)) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            title: "Validation Failed",
            message: "UUID is not valid",
          })
        );
      } else if (baseUrl == "/api/store/order/" && regexV.test(uid)) {
        res.setHeader("Content-type", "application/json");
        let filteredorder = order.filter((singleorder: storeInterface) => {
          return Number(singleorder.id) === Number(uid);
        });
        if (filteredorder.length > 0) {
          res.statusCode = 200;
          res.write(JSON.stringify(filteredorder));
          res.end();
        } else {
          res.statusCode = 404;
          res.write(
            JSON.stringify({ title: "Not Found", message: "Order Not Found" })
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
    }
  );
};

const addstore = (req: IncomingMessage, res: ServerResponse) => {
  let data = "";

  req.on("data", (chunk) => {
    data += chunk.toString();
  });

  req.on("end", () => {
    let order = JSON.parse(data);

    fs.readFile(path.join(__dirname, "store.json"), "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      } else {
        let orders: [storeInterface] = JSON.parse(data);
        let latest_id = orders.reduce(
          (max = 0, pet: storeInterface) =>
            Number(pet.id) > max ? Number(pet.id) : max,
          0
        );
        order.id = latest_id + 1;
        orders.push(order);
        fs.writeFile(
          path.join(__dirname, "store.json"),
          JSON.stringify(orders),
          () => {
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                success: true,
                message: order,
              })
            );
          }
        );
      }
    });
  });
};

const deletestore = (req: IncomingMessage, res: ServerResponse) => {
  let baseUrl = req.url?.substring(0, req.url.lastIndexOf("/") + 1);
  var uid = req.url?.split("/")[4] as string; //Error occured here solved by adding as string
  const regexV = new RegExp(/^[0-9]+$/);
  let order = require("./store.json");
  fs.readFile(path.join(__dirname, "store.json"), "utf8", (err) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: err,
        })
      );
    } else if (baseUrl == "/api/store/order/" && !regexV.test(uid)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          title: "Validation Failed",
          message: "UUID is not valid",
        })
      );
    } else if (baseUrl == "/api/store/order/" && regexV.test(uid)) {
      const index = order.findIndex((orders: storeInterface) => {
        return Number(orders.id) === Number(uid);
      });
      if (index === -1) {
        res.statusCode = 404;
        res.write(
          JSON.stringify({ title: "Not Found", message: "Order Not Found" })
        );
        res.end();
      } else {
        order.splice(index, 1),
          fs.writeFile(
            path.join(__dirname, "store.json"),
            JSON.stringify(order),
            () => {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: true,
                  message: "Deleted the store",
                })
              );
            }
          );
      }
    }
  });
};

export { getstore, addstore, deletestore };
