import test from 'node:test';
import assert from 'node:assert/strict';

import {
    compareNonSemanticVersions,
    isSemanticVersion,
    compareSemanticVersions,
    generateRandomSemanticVersion,
    generateNonSemanticVersion
} from './src/utils';

import { MainProcess } from './src/MainProcess';
import { SecondaryProcess } from './src/SecondaryProcess';
import { PartialJSONDecoder } from './src/PartialJSONDecoder';

// semantic versions test

test('Is semantic version', () => {
    assert.equal(isSemanticVersion('1.2.3'), true);
    assert.equal(isSemanticVersion('1.2.3-lol'), false);
    assert.equal(isSemanticVersion('1.2'), false);
});

test('Compare semantic versions', () => {
    assert.equal(compareSemanticVersions('1.2.3', '1.2.3'), 0);
    assert.equal(compareSemanticVersions('1.2.3', '1.2.4'), -1);
    assert.equal(compareSemanticVersions('1.2.3', '1.2.2'), 1);
    assert.equal(compareSemanticVersions('1.2.3', '1.3.3'), -1);
    assert.equal(compareSemanticVersions('1.2.3', '1.1.3'), 1);
    assert.equal(compareSemanticVersions('1.2.3', '2.2.3'), -1);
    assert.equal(compareSemanticVersions('1.2.3', '0.2.3'), 1);
});

// non semantic versions test

test('Compare non semantic versions', () => {
    assert.equal(compareNonSemanticVersions('1.2.3-2018-09-10', '1.2.3-2018-09-10'), 0);
    assert.equal(compareNonSemanticVersions('1.2.3-2018-10-10', '1.2.3-2018-09-10'), 1);
    assert.equal(compareNonSemanticVersions('1.2.3-2018-1-10', '1.2.3-2018-09-10'), -1);
    assert.equal(compareNonSemanticVersions('1.4.3-2018-10-10', '1.2.3-2018-10-10'), 1);
    assert.equal(compareNonSemanticVersions('1.1.3-2018-10-10', '1.2.3-2018-10-10'), -1);
});

test('Generate random semantic version', () => {
    const version = generateRandomSemanticVersion('0.0.1');
    assert.equal(isSemanticVersion(version), true);
});

test('Generate random non semantic version', () => {
    const version = generateNonSemanticVersion('0.0.1-2020-10-10');
    assert.equal(isSemanticVersion(version), false);
});