const tasksResultsArray = [
[1,0,1,1],
[0,0,0,1],
[1,1,1,1]
]

function countingResults(tasksResultsArray) {
    let results = [];

    function addPoints(winnersIndexes, points) {
        for (let winnerIndex of winnersIndexes) {
            if (!results[winnerIndex]) {
                results[winnerIndex] = points;
            } else {
                results[winnerIndex] += points;
            }
        }
    }

    function studentIndexToWord(studentIndex) {
        switch(studentIndex) {
            case 0:
                return 'первый'
            case 1:
                return 'второй'
            case 2:
                return 'третий'
            case 3:
                return 'четвёртый'
            case 4:
                return 'пятый'
            case 5:
                return 'шестой'
        }
    }

    const taskCount = tasksResultsArray[0].length;
    const studentsCount = tasksResultsArray.length;

    for (let taskIndex = 0; taskIndex < taskCount; taskIndex++) {
        let taskPoints = studentsCount + 1;
        let winnersIndexes = [];

        for (let studentIndex = 0; studentIndex < studentsCount; studentIndex ++) {
            if (tasksResultsArray[studentIndex][taskIndex] == 1) {
                taskPoints -= 1;
                winnersIndexes.push(studentIndex);
            }
        }
        
        addPoints(winnersIndexes, taskPoints)
    }
    return results.map((points, index) => String(points) + `, - набрал ${studentIndexToWord(index)} ученик`);
}

console.log(countingResults(tasksResultsArray))

