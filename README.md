# Bananagrams

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/domsleee/bananagrams/tree/main.svg?style=shield)](https://app.circleci.com/pipelines/github/domsleee/bananagrams)

[Live link](https://domsleee.github.io/bananagrams/)

## Usage

This project uses `yarn`, to get started:
```bash
yarn
yarn start
```

## What dictionary is used?

This uses the Collins Scrabble Words (2019) dictionary.

See: https://boardgames.stackexchange.com/questions/38366/latest-collins-scrabble-words-list-in-text-file

## Test cases

The URL can be used to inject parameters.

For example, to setup a multiplayer game with four tiles (AAAA), and each player starting with two tiles:

http://localhost:4200/?tiles=AAAA&numTiles=2

To setup a local game (single player), similar parameters can be used:

http://localhost:4200/local?tiles=AA&numTiles=1

## Running circleci locally
After you have installed docker, the guide [from here](https://github.com/CircleCI-Public/circleci-cli/issues/449) is helpful:

```bash
curl -fLSs https://raw.githubusercontent.com/CircleCI-Public/circleci-cli/master/install.sh | sudo bash
circleci local execute --job build-and-test
```
