import test from 'node:test'
import assert from 'node:assert/strict'
import { parseTokenCount, tokenCost } from '../src/lib/token-cost.mjs'

test('token counts accept plain integers and properly grouped commas', () => {
  assert.equal(parseTokenCount('0'), 0)
  assert.equal(parseTokenCount('1,000,000'), 1_000_000)
  assert.equal(parseTokenCount(' 2500 '), 2500)
})

test('token counts reject ambiguous or unsafe input', () => {
  for (const value of ['', '1,00', '1 000', '1.5', '-1', '9007199254740992']) {
    assert.equal(parseTokenCount(value), null, value)
  }
})

test('input and output rates combine into a USD estimate', () => {
  assert.equal(tokenCost(2000, 500, 3, 15), 0.0135)
  assert.equal(tokenCost(0, 500, 3, 15), 0.0075)
})
