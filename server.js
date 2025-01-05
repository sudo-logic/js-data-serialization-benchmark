import express from "express";
import msgpack5 from "msgpack5";
import * as protobuf from "protobufjs";
import PSON from "pson";

const app = express();
const msgpack = msgpack5();
const PORT = 3000;
const pson = new PSON.StaticPair();

function generateItems(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      name: `Item ${i}`,
      description: `This is a description for item ${i}`,
      price: Math.random() * 1000,
      quantity: Math.floor(Math.random() * 100),
      tags: ["tag1", "tag2", "tag3"],
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        category: `Category ${i % 5}`,
      },
    });
  }
  return items;
}

const items = generateItems(100000);
let ItemList;

protobuf
  .load("item.proto")
  .then((root) => {
    ItemList = root.lookupType("ItemList");
    console.log("Protobuf schema loaded successfully");
  })
  .catch((err) => {
    console.error("Failed to load protobuf schema:", err);
    process.exit(1);
  });

app.get("/json", (req, res) => {
  res.json(items);
});

app.get("/msgpack", (req, res) => {
  const packed = msgpack.encode(items);
  res.set("Content-Type", "application/x-msgpack");
  res.send(packed);
});

app.get("/protobuf", (req, res) => {
  const message = ItemList.create({ items: items });
  const buffer = ItemList.encode(message).finish();
  res.set("Content-Type", "application/x-protobuf");
  res.send(buffer);
});

app.get("/pson", (req, res) => {
  const buffer = pson.toBuffer(items);
  res.set("Content-Type", "application/x-pson");
  res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
