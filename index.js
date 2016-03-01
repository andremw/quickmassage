'use strict';

function raffler (previouslySelectedUsers) {
    var allEntries = [];
    previouslySelectedUsers = previouslySelectedUsers || [];

    return {
        addUser: addUser,
        entries: entries
    };

    function addUser(user) {
        // if the user has already been selected in the last raffle he can't be selected now
        if (previouslySelectedUsers.indexOf(user.name) >= 0) {
            return;
        }
        var entry = createEntryForUser(user);
        addToAllEntries(entry);
    };

    function createEntryForUser(user) {
        var entry = {};
        var userEntry = allEntries.find(el => el[user.name] != null);
        var userEntries = user.times;

        if (userEntry) {
            // get the previous time entries for this user
            // concat with the current entry times
            // and filter it to remove duplicates in the times
            userEntries = userEntries
                .concat(userEntry[user.name])
                .filter((entry, index, array) => array.indexOf(entry) === index);
        }

        entry[user.name] = userEntries;

        return entry;
    }

    function addToAllEntries(userEntry) {
        var userName = Object.keys(userEntry)[0];
        var entryIndex = allEntries.findIndex(entry => entry[userName] != null);

        if (entryIndex < 0) {
            allEntries.push(userEntry);
            return;
        }

        // if the user has another entry, just replace it with all the selected times.
        allEntries.splice(entryIndex, 1, userEntry);
    }

    function entries() {
        return allEntries;
    };
}

module.exports = raffler;
