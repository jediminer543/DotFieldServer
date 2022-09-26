DotField server
=============

Server component for an interactive art exhibit displaying on a 8x8x8 RGB LED cube. Serves a web-based user interface for controlling dot particles flying through the cube. Requires the `dotfield.py` pattern to be running on the main Python cube code in [pbrook/pycubedemo](https://github.com/pbrook/pycubedemo).

# Dependencies

Tested on Node 0.10

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


# Run

```
cd server
npm start
```
