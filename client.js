import axios from "axios";
import msgpack5 from "msgpack5";
import * as protobuf from "protobufjs";
import PSON from "pson";

const msgpack = msgpack5();
const pson = new PSON.StaticPair();

async function runTest() {
  const root = await protobuf.load("item.proto");
  const ItemList = root.lookupType("ItemList");

  console.log("Starting performance test...\n");

  const jsonStart = process.hrtime.bigint();
  const jsonResponse = await axios.get("http://localhost:3000/json");
  const jsonTransferEnd = process.hrtime.bigint();
  const jsonParseStart = process.hrtime.bigint();
  const jsonData = jsonResponse.data;
  const jsonEnd = process.hrtime.bigint();
  const jsonTransferTime = Number(jsonTransferEnd - jsonStart) / 1000000;
  const jsonParseTime = Number(jsonEnd - jsonParseStart) / 1000000;
  const jsonSize = Buffer.from(JSON.stringify(jsonData)).length;

  const msgpackStart = process.hrtime.bigint();
  const msgpackResponse = await axios.get("http://localhost:3000/msgpack", {
    responseType: "arraybuffer",
  });
  const msgpackTransferEnd = process.hrtime.bigint();
  const msgpackParseStart = process.hrtime.bigint();
  const msgpackBuffer = Buffer.from(msgpackResponse.data);
  const msgpackData = msgpack.decode(msgpackBuffer);
  const msgpackEnd = process.hrtime.bigint();
  const msgpackTransferTime =
    Number(msgpackTransferEnd - msgpackStart) / 1000000;
  const msgpackParseTime = Number(msgpackEnd - msgpackParseStart) / 1000000;
  const msgpackSize = msgpackBuffer.length;

  const protobufStart = process.hrtime.bigint();
  const protobufResponse = await axios.get("http://localhost:3000/protobuf", {
    responseType: "arraybuffer",
  });
  const protobufTransferEnd = process.hrtime.bigint();
  const protobufParseStart = process.hrtime.bigint();
  const protobufBuffer = Buffer.from(protobufResponse.data);
  const protobufData = ItemList.decode(protobufBuffer).items;
  const protobufEnd = process.hrtime.bigint();
  const protobufTransferTime =
    Number(protobufTransferEnd - protobufStart) / 1000000;
  const protobufParseTime = Number(protobufEnd - protobufParseStart) / 1000000;
  const protobufSize = protobufBuffer.length;

  const psonStart = process.hrtime.bigint();
  const psonResponse = await axios.get("http://localhost:3000/pson", {
    responseType: "arraybuffer",
  });
  const psonTransferEnd = process.hrtime.bigint();
  const psonParseStart = process.hrtime.bigint();
  const psonBuffer = Buffer.from(psonResponse.data);
  const psonData = pson.decode(psonBuffer);
  const psonEnd = process.hrtime.bigint();
  const psonTransferTime = Number(psonTransferEnd - psonStart) / 1000000;
  const psonParseTime = Number(psonEnd - psonParseStart) / 1000000;
  const psonSize = psonBuffer.length;

  const results = {
    json: {
      transferTime: jsonTransferTime,
      parseTime: jsonParseTime,
      totalTime: jsonTransferTime + jsonParseTime,
      size: jsonSize,
    },
    msgpack: {
      transferTime: msgpackTransferTime,
      parseTime: msgpackParseTime,
      totalTime: msgpackTransferTime + msgpackParseTime,
      size: msgpackSize,
    },
    protobuf: {
      transferTime: protobufTransferTime,
      parseTime: protobufParseTime,
      totalTime: protobufTransferTime + protobufParseTime,
      size: protobufSize,
    },
    pson: {
      transferTime: psonTransferTime,
      parseTime: psonParseTime,
      totalTime: psonTransferTime + psonParseTime,
      size: psonSize,
    },
  };

  console.log("Results:");
  console.log("-----------------");
  const formats = [
    { display: "JSON", key: "json" },
    { display: "MessagePack", key: "msgpack" },
    { display: "Protobuf", key: "protobuf" },
    { display: "PSON", key: "pson" },
  ];

  formats.forEach(({ display, key }) => {
    const { transferTime, parseTime, totalTime, size } = results[key];
    console.log(`\n${display}:`);
    console.log(`Transfer Time: ${transferTime.toFixed(2)}ms`);
    console.log(`Parse Time: ${parseTime.toFixed(2)}ms`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`Size: ${(size / 1024).toFixed(2)}KB`);
  });

  console.log("\nComparisons with JSON:");
  formats.slice(1).forEach(({ display, key }) => {
    const format = results[key];
    const json = results.json;
    console.log(`\n${display}:`);
    console.log(
      `Transfer Time gained: ${(
        json.transferTime - format.transferTime
      ).toFixed(2)}ms`
    );
    console.log(
      `Total Time gained: ${(json.totalTime - format.totalTime).toFixed(2)}ms`
    );
    console.log(
      `Size gained: ${((json.size - format.size) / 1024).toFixed(2)}KB`
    );
    console.log(
      `Size reduction: ${((1 - format.size / json.size) * 100).toFixed(2)}%`
    );
  });
}

runTest().catch(console.error);
