/*
    "enums"
*/

const MAX_STARS = 25;
const STAR = '★';
const FORMAT = '%PLACE) %SCORE %STARS %NAME (%SCHOOL)';
const PATHTOINDIVIDUALDATA = 'https://saturn.rochesterschools.org/python/AOCbot/data_file.json';
const PATHTOTEAMS = 'https://saturn.rochesterschools.org/python/AOCbot/team_file.json';
const PATHTOCSV = 'https://saturn.rochesterschools.org/python/AOCbot/users.json';

/*
    let Initlilzation
*/

let schoolData = {};
let CSVData;

window.addEventListener('load', async event => {
    /*
        No try/catch here, site is not functional without this data.
    */
    let res = await fetch(PATHTOCSV);
    CSVData = await res.json();

    /*
        Individual Section
    */

    try {
        let res = await fetch(PATHTOINDIVIDUALDATA); //get individual data
        let { members } = await res.json(); //parse as json
        members = Object.values(members); // turn into array
        members.sort((a, b) => b.stars - a.stars || b.local_score - a.local_score); // sort by amount of stars, then by local score
        //try to find the section we are going to put this data in
        const individualSectionElement = document
            .querySelector(`section[name="individual"]`)
            .querySelector('div');
        renderIndividualSection(members, individualSectionElement);
    } catch (e) {
        console.log('Individual Section failed to render\n', e);
    }

    /*
        Team Section
    */

    try {
        let res = await fetch(PATHTOTEAMS); //get team data
        let { members } = await res.json(); //parse as json
        members = Object.values(members); //object to array
        members.sort((a, b) => b.stars - a.stars || b.local_score - a.local_score); //sort by star count, then by local score
        const teamSectionElement = document
            .querySelector(`section[name="teams"]`)
            .querySelector('div');
        renderTeamSection(members, teamSectionElement);
    } catch (e) {
        console.log('Team Section failed to render\n', e);
    }

    /*
        School Section
    */

    try {
        const schoolSectionElement = document
            .querySelector(`section[name="schools"]`)
            .querySelector('div');
        let schoolNames = Object.keys(schoolData);
        schoolNames.sort((a, b) => schoolData[b].stars - schoolData[a].stars);
        renderSchoolSection(schoolNames, schoolSectionElement);
    } catch (e) {
        console.log('School Section failed to render\n', e);
    }

    /*
        Stats Section
    */
    try {
        const statisticsSectionElement = document
            .querySelector(`section[name="stats"]`)
            .querySelector('div');
        renderStats(statisticsSectionElement);
    } catch (e) {
        console.log('Statistics Section failed to render\n', e);
    }
});

/*
    Render functions
*/

function renderIndividualSection(members, sectionElement) {
    for (const [index, person] of Object.entries(members)) {
        if (person.stars <= 0) continue;
        const AOCUsername = person.name;
        let name = AOCUsername;
        let school = '?';
        if (CSVData[AOCUsername]) {
            name = CSVData[AOCUsername][`What is your first and last name?`];
            school = CSVData[AOCUsername][`Which school do you attend?`].trim();
            /*

                Statistics

            */
            if (!schoolData[school]) schoolData[school] = {}; // ensure this school's object exists
            if (!schoolData[school].participants) schoolData[school].participants = 0; //ensure this school's participant count exists
            schoolData[school].participants++; //count
            if (!schoolData[school].stars) schoolData[school].stars = 0; //ensure this school's star count exists
            schoolData[school].stars += person.stars;
        }
        const element = createPerson({
            name: name,
            place: +index + 1, //cast index to number, arrays start at 0 add 1
            score: person.local_score,
            stars: person.stars,
            school: school
        });
        sectionElement.appendChild(element);
    }
}

function renderSchoolSection(schoolNames, sectionElement) {
    for (i = 0; i < schoolNames.length; i++) {
        const schoolName = schoolNames[i];
        const starCount = schoolData[schoolName].stars;
        const playerCount = schoolData[schoolName].participants;
        const school = document.createElement('div');
        school.classList.add(schoolName, "person");
        school.innerText =
            + (i + 1) +
            ') ' +
            schoolName +
            ' Total Stars: ' +
            starCount +
            ', Total Participants: ' +
            playerCount;
        sectionElement.appendChild(school);
    }
}

function renderTeamSection(members, sectionElement) {
    let highestGroups = {};
    let renderedTeams = 0;

    for (person of members) {
        if (person.stars <= 0) continue;
        const AOCUsername = person.name;
        let name = AOCUsername;
        let skhools = [];

        if (CSVData[AOCUsername]) {
            if (
                CSVData[AOCUsername][
                    `Are you participating as part of a team or as an individual?`
                ] != 'Team'
            )
                continue;
            const school = CSVData[AOCUsername][`Which school do you attend?`].trim();
            /*

                Statistics

            */
            if (!schoolData[school]) schoolData[school] = {}; // ensure this school's object exists
            if (!schoolData[school].participants) schoolData[school].participants = 0; //ensure this school's participant count exists
            schoolData[school].participants++; //count
            if (!schoolData[school].stars) schoolData[school].stars = 0; //ensure this school's star count exists
            schoolData[school].stars += person.stars;
            name = CSVData[AOCUsername][`What is your team name?`].trim();
            if (highestGroups[name]) continue;
            highestGroups[name] = true;
            for (participant of Object.values(CSVData)) {
                if (participant[`What is your team name?`].trim() == name) {
                    skhools.push(school);
                }
            }
        }
        const element = createPerson({
            name: name,
            place: renderedTeams + 1,
            score: person.local_score,
            stars: person.stars,
            school: skhools.join('/')
        });
        renderedTeams++;
        sectionElement.appendChild(element);
    }
}

function renderStats(sectionElement) {
    /*
        Data Collection
    */
    let schools = Object.values(schoolData);
    let totalParticipants = 0;
    let totalStars = 0;
    for (school of schools) totalParticipants += school.participants;
    for (school of schools) totalStars += school.stars;
    /*
        Render Data
    */
    //total players
    const totalPlayersElement = document.createElement('div');
    totalPlayersElement.innerText = 'Total Participants: ' + totalParticipants;
    totalPlayersElement.classList.add("stat");
    sectionElement.appendChild(totalPlayersElement);
    //total stars
    const totalStarsElement = document.createElement('div');
    totalStarsElement.innerText = 'Total Stars: ' + totalStars;
    totalStarsElement.classList.add("stat");
    sectionElement.appendChild(totalStarsElement);

    /*
        Time til competition end
    */
    const countDownDate = new Date('Jan 1, 2022 0:0:01').getTime();

    const TTE = document.createElement('div');
    TTE.setAttribute('id', 'TTE');
    TTE.classList.add("person");
    function init() {
        // Get today's date and time
        let now = new Date().getTime();

        // Find the distance between now and the count down date
        let distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
        let minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
        let seconds = Math.floor(distance % (1000 * 60) / 1000);

        // Output the result in an element with id="clock"
        TTE.innerHTML =
            'Time left: ' + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';

        // If the count down is over, write some text
        if (distance < 0) {
            clearInterval(x);
            TTE.innerHTML = 'EXPIRED';
        }
    }

    let x = setInterval(init, 1000);

    init();
    
    sectionElement.appendChild(TTE);
}

function createPerson({ name, place, score, stars, school }) {
    const person = document.createElement('div');
    person.classList.add("person");
    const spaces = 2 - `${place}`.length;
    const scorespaces = 4 - `${score}`.length;
    const firstHalf = document.createTextNode(
        '0'.repeat(spaces) + place + ') ' + '0'.repeat(scorespaces) + score + ' '
    );
    person.appendChild(firstHalf);

    const fullStars = document.createElement('span');
    fullStars.classList.add('goldStar');
    fullStars.innerText = STAR.repeat(Math.floor(stars / 2));
    person.appendChild(fullStars);

    const silverStars = document.createElement('span');
    silverStars.classList.add('silverStar');
    silverStars.innerText = STAR.repeat(stars % 2);
    person.appendChild(silverStars);

    const incompleteStars = document.createElement('span');
    incompleteStars.classList.add('incompleteStar');
    incompleteStars.innerText = STAR.repeat(MAX_STARS - Math.ceil(stars / 2));
    person.appendChild(incompleteStars);

    const secondHalf = document.createElement('span');
    secondHalf.innerText = ' ' + name + ' (' + school + ')';
    if(school){
        secondHalf.classList.add(school);
    }

    person.appendChild(secondHalf);

    return person;
}
