// retrieve all sheets in the spreadsheet
var allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets(),
    sheetSemanaAnterior = allSheets[0],
    sheetSorteados = allSheets[1],
    sheetForm = allSheets[2];

// array of all selected hours - with no duplicate days.
var selectedHours = [];

// main function
function raffleIt() {
  fillSemanaAnteriorSheet();
  clearSorteados();
  fillSelectedHours();
  raffleUsersByHour();
}

function wasChosenPreviousWeek(login) {
  var sorteados = getSemanaAnteriorData(),
      sLen = sorteados.length;

  for (var i = 0; i < sLen; i++) {
    if (sorteados[i][0] === login)
      return true;
  }
  return false;
}

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}

function getRandomLogin(logins) {
  var chosenIndex = getRandomNumber(logins.length);
  return logins[chosenIndex][1];
}

function getUniqueUsers(usersPerHour) {
  var uniqueUsers = [];
  var usersLength = usersPerHour.length;

  while (--usersLength >= 0) {
    var user = usersPerHour[usersLength];

    var userAlreadyAdded = uniqueUsers.some(function (u) {
      return u[1] === user[1];
    });

    if (!userAlreadyAdded) {
      uniqueUsers.push(user);
    }
  }
  
  return uniqueUsers;
}

function raffleUsersByHour() {
  var hoursLen = selectedHours.length,
      sortedUsers = null,
      usersPerHour = null,
      formData = getFormData(),

      // to be removed
      msgSorteado = [],
      chosenPeople = [],
      hour = null,
      chosenIndex = null,
      chosenLogin = null,
      previouslyChosen = null;

  for (var i = 0; i < hoursLen; i++) {
    hour = selectedHours[i];

    usersPerHour = formData.filter(function(dataRow) {
      return dataRow[2].indexOf(hour) !== -1;
    });
    usersPerHour = getUniqueUsers(usersPerHour);
    msgSorteado.push('\n\n=======' + hour + '======\n');

    do {
      chosenIndex = getRandomNumber(usersPerHour.length);
      chosenLogin = usersPerHour[chosenIndex][1];
      previouslyChosen = (wasChosenPreviousWeek(chosenLogin) || chosenPeople.some(wasAlreadyChosen(chosenLogin, chosenPeople)));
      if (!previouslyChosen) {
        msgSorteado.push('Sorteado: ' + chosenLogin);
        chosenPeople.push({'hour': hour, 'login': chosenLogin});
      } else {
        usersPerHour.splice(chosenIndex, 1);
      }
    } while (previouslyChosen && usersPerHour.length);

  }
  Logger.log(msgSorteado.join(''));
  Logger.log('\n\nchosenLogins: ' + JSON.stringify(chosenPeople));

  fillChosenPeopleSheet(chosenPeople);
}

function wasAlreadyChosen(login, chosenLogins) {
  return function (hourLogin) {
    return hourLogin.login === login;
  };
}

function fillSelectedHours() {
  var rows = getFormData(),
      rowsLen = rows.length,
      hours = null,
      hLength = null,
      hour = null;

  // i = 1 to ignore the column header
  for (var i = 1; i < rowsLen; i++) {
    hours = rows[i][2].split(',');
    hLength = hours.length;
    for (var j = 0; j < hLength; j++) {
      hour = hours[j].trim();
      if (selectedHours.indexOf(hour) === -1) {
        selectedHours.push(hour);
      }
    }
  }
  selectedHours.sort();
}

function fillChosenPeopleSheet(chosen) {
  var cLen = chosen.length;

  for (var i = 0; i < cLen; i++) {
    sheetSorteados.getRange('A' + (i + 1)).setValue(chosen[i].hour);
    sheetSorteados.getRange('B' + (i + 1)).setValue(chosen[i].login);
  }
}

/*
 * In the moment of the raffling, this function gets the filled data of the chosen people
 * from previous week and send to the sheetSemanaAnterior.
 */
function fillSemanaAnteriorSheet() {
  var lines = getSorteadosData(),
      linesLen = lines.length;

  clearSemanaAnterior();

  for (var i = 0; i < linesLen; i++) {
    sheetSemanaAnterior.getRange('A' + (i + 1)).setValue(lines[i][1]);
  }
}

function getSorteadosData() {
  return sheetSorteados.getDataRange().getValues();
}

function getSemanaAnteriorData() {
  return sheetSemanaAnterior.getDataRange().getValues();
}

// return user input data from the form sheet
function getFormData() {
  return sheetForm.getDataRange().getValues();
}

function clearSemanaAnterior() {
  sheetSemanaAnterior.clear();
}

function clearSorteados() {
  sheetSorteados.clear();
}

/**
 * Adds a custom menu to the active spreadsheet, containing a single menu item
 * for invoking the readRows() function specified above.
 * The onOpen() function, when defined, is automatically invoked whenever the
 * spreadsheet is opened.
 * For more information on using the Spreadsheet API, see
 * https://developers.google.com/apps-script/service_spreadsheet
 */
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Sortear!",
    functionName : "raffleIt"
  }];
  spreadsheet.addMenu("Sorteio", entries);
};
