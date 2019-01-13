# Supercavitation UI

** TECHNICAL DEMO ONLY DO NOT USE FOR SIGNIFICANT VALUE **

This is the User Interface component of the [Supercavitations Swaps](https://github.com/lncm/supercavitation-swaps) service.

It's a react web app that:

* Reads contract registry from EVM and lists SwapOfferings (not implemented)
* Communicates with Supercavitation Server instances
* Allows users to request swap creation
* Displays LN invoices for users to pay
* Shows swap status at various stages
* Handles swap settlment in case server goes offline

## Usage

### Prerequisites

* For production, a registry address (TODO)
* For development, a Supercavitation Server configured (running locally or remotely)

### Install

* Clone this repo
* `npm i`

### Configure

Edit `src/config.js`

### Develop

Use `npm run dev` with environment variables

```bash
# example
DEV_SERVER='http://localhost8081' DEV_CONTRACT='0x123' GANACHE=1 npm run dev;
```

All of the env vars are optional:

* `DEV_SERVER` uri of Supercavitation Server (overrides contract-specified URL)
* `DEV_CONTRACT` add this contract contract to top of the registry
* `GANACHE` to use a localhost evm & skip invoice validation 

### Build

* `npm run build`

## TODOs

### Now

* renderAccountBalance
* disable auto-populate alice
* deploy to ipfs
* rename `GANACHE` to `EVM_URI`, add `NO_INVOICE_VERIFICATION`

### Later (Icebox)

* Registry
* Timeouts
* Sign messages from alice
* Testing for edge cases
* ...
