# Bananagrams

[![CircleCI](https://circleci.com/gh/domsleee/bananagrams/tree/main.svg?style=shield)](https://circleci.com/gh/domsleee/bananagrams/tree/main)

[Live link](https://domsleee.github.io/bananagrams/)

## What dictionary is used?

This uses the Collins Scrabble Words (2019) dictionary.

See: https://boardgames.stackexchange.com/questions/38366/latest-collins-scrabble-words-list-in-text-file

## Test cases

The URL can be used to inject parameters.

For example, to setup a multiplayer game with four tiles (AAAA), and each player starting with two tiles:

http://localhost:4200/bananagrams/?tiles=AAAA&numTiles=2

To setup a local game (single player), similar parameters can be used:

http://localhost:4200/bananagrams/local?tiles=AA&numTiles=1

