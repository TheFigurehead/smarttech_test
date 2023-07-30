import test, {describe, it} from 'node:test';
import assert from 'node:assert/strict';

import {
    compareNonSemanticVersions,
    isSemanticVersion,
    compareSemanticVersions,
    generateRandomSemanticVersion,
    generateNonSemanticVersion
} from './src/utils';

import { MainProcess } from './src/MainProcess';
import { PartialJSONDecoder } from './src/PartialJSONDecoder';
import {fail} from "assert";

// semantic versions test
describe('Versioning test', () => {

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

});

// partial json decoding

describe('Partial Json Decoder', () => {

    it('should get all valid objects', async () => {
        const decoder = new PartialJSONDecoder();
        const chunk = '{"name": "John Doe"}, {"name": "Jane ';
        const jsonObjects = decoder.decode(new Buffer(chunk));
        assert.deepEqual(jsonObjects, [{name: 'John Doe'}]);
    });

    it('should get empty object on empty buffer', async () => {
        const decoder = new PartialJSONDecoder();
        const chunk = '';
        const jsonObjects = decoder.decode(new Buffer(chunk));
        assert.deepEqual(jsonObjects, []);
    });

    it('should not handle incomplete JSON objects', async () => {
        const decoder = new PartialJSONDecoder();
        const chunk = '{"name": "John Doe"';
        const jsonObjects = decoder.decode(new Buffer(chunk));
        assert.deepEqual(jsonObjects, []);
    });

    it('should handle multiple JSON objects', async () => {
        const decoder = new PartialJSONDecoder();
        const chunksWithResults = [
            {
                buffer: '[{"name": "John Doe"},{"name": "John',
                expected: [{name: 'John Doe'}]
            },
            {
                buffer: ' Carmack"},{"name": "Jane Doe"}]',
                expected: [{name: 'John Carmack'}, {name: 'Jane Doe'}]
            }
        ];
        chunksWithResults.forEach(({buffer, expected}) => {
            const jsonObjects = decoder.decode(new Buffer(buffer));
            assert.deepEqual(jsonObjects, expected);
        });
    });
});

// main process
// sorry, I don't know how to test it properly

describe('Main Process', () => {

    it('should run', async () => {
        const mainProcess = new MainProcess();
        try{
            console.log('Waiting for main process to finish...');
            await mainProcess.init();
            assert.equal(true, true);
        }catch (e) {
            fail(e);
        }
    });

});