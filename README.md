# JavaScript Data Serialization Benchmark

A benchmark comparing different data serialization formats in JavaScript: JSON, MessagePack, Protocol Buffers, and PSON.

## Overview

This project provides a simple server and client to benchmark the performance of different data serialization formats by:

- Generating large datasets
- Serializing/deserializing data
- Measuring transfer times
- Comparing payload sizes

## Formats Tested

- JSON (native)
- MessagePack (using msgpack5)
- Protocol Buffers (using protobufjs)
- PSON (using pson)
