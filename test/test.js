'use strict';

const test = require('tape');
const quickMassageShuffler = require('../index');

test('should add a user and the times he chose', (t) => {
    t.plan(1);
    var raffler = quickMassageShuffler();

    raffler.addUser({
        name: 'someone@somewhere.com',
        times: ['9h20', '11h20']
    });

    t.equal(raffler.entries().length, 1);
    t.end();
});

test('should eliminate duplicate users', (t) => {
    t.plan(1);
    var raffler = quickMassageShuffler();

    raffler.addUser({
        name: 'someone@somewhere.com',
        times: ['9h20', '11h20']
    });
    raffler.addUser({
        name: 'someone@somewhere.com',
        times: ['9h20', '11h20']
    });

    t.equal(raffler.entries().length, 1);

    t.end();
});

test('should eliminate duplicate times for a user', (t) => {
    t.plan(1);
    var raffler = quickMassageShuffler();

    raffler.addUser({
        name: 'someone@somewhere.com',
        times: ['9h20', '11h20']
    });
    raffler.addUser({
        name: 'someone@somewhere.com',
        times: ['9h20', '11h20', '13h20']
    });

    var userEntries = raffler.entries().find(entry => entry['someone@somewhere.com'])['someone@somewhere.com'];

    t.deepEqual(userEntries, ['9h20', '11h20', '13h20']);

    t.end();
});

test('should not include user in the list if he has already been sorted in the previous week', (t) => {
    t.plan(2);
    var previouslySelectedUsers = ['someone@somewhere.com'];
    var raffler = quickMassageShuffler(previouslySelectedUsers);

    raffler.addUser({
        name: 'someone@somewhere.com',
        times: ['9h20', '11h20']
    });

    raffler.addUser({
        name: 'a@b',
        times: ['12h30']
    });

    var entries = raffler.entries();
    var invalidEntry = entries.find(entry => entry['someone@somewhere.com']);
    t.notOk(invalidEntry, 'should be undefined');
    t.equal(entries.length, 1);

    t.end();
});

function initRaffler() {
    return Object.create(quickMassageShuffler);
}
