DotField server
=============

Server component for an interactive art exhibit displaying on a 8x8x8 RGB LED cube. Serves a web-based user interface for controlling dot particles flying through the cube. Requires the `dotfield.py` pattern to be running on the main Python cube code in [leedshackspace/pycubedemo](https://github.com/leedshackspace/pycubedemo).

# Dependencies

Tested on Node 0.10 and Node 16

# Installation

```
cd server
npm install
```

# Configuration

Network connections

```
                   ┌──────────────────┐
    :listenWebPort │                  │  :listenCubePort
         ┌────────►│  DotFieldServer  │◄───┐
         │         │                  │    │
         │         └──────────────────┘    │
         │                                 │
         │                                 │
         │                                 │
         │                                 │
         │                                 │
         │                                 │
         │                           ┌─────┴──────┐
  ┌──────┴──────────┐                │            │
  │                 │                │  cube.py   │
  │  Web browser    │                │  dotfield  │
  │                 │                │  pattern   │
  └─────────────────┘                │            │
                                     └────────────┘
```

Copy `config.json.example` to `config.json` and edit it to set your config values.


# How to run

This server works in conjunction with the `dotfield` cube Python pattern. Responsibilities are shared as follows:
* `DotFieldServer`
  * Serves the interactive UI to web clients (default port 47284)
  * Handles websocket connections from web clients
  * Collects and relays commands from web clients to the `dotfield` pattern
  * Listens for connections from `dotfield` pattern (default port 47285)
* `dotfield` pattern
  * Graphics
  * Plays sounds using `pygame`
  * Receives commands from `DotFieldServer` via websocket
  * Establishes websocket connection with `DotFieldServer`


Running the node server:
```
cd server
npm start
```

Running the cube pattern (displaying pattern on local [simulator](https://github.com/ultrafez/ledcube-webgl)):
```
python3 cube.py -P localhost:3000 -p "dotfield:localhost:47285"
                 ^                    ^        ^
                 |                    |        └- host+port for DotFieldServer
                 |                    |
                 |                    └- name of pattern
                 |
                 └- serial port OR network connection for simulator
```
