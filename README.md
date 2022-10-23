# Bananagrams

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/domsleee/bananagrams/tree/main.svg?style=shield&circle-token=40296ea105c633306ed58fb1f26706b4f4c6568c)](https://dl.circleci.com/status-badge/redirect/gh/domsleee/bananagrams)

[Live link](https://domsleee.github.io/bananagrams/)

## What dictionary is used?

This uses the Collins Scrabble Words (2019) dictionary.

See: https://boardgames.stackexchange.com/questions/38366/latest-collins-scrabble-words-list-in-text-file

## Test cases

The URL can be used to inject parameters.

For example, to setup a multiplayer game with four tiles (AAAA), and each player starting with two tiles:

http://localhost:4200/?tiles=AAAA&numTiles=2

To setup a local game (single player), similar parameters can be used:

http://localhost:4200/local?tiles=AA&numTiles=1

