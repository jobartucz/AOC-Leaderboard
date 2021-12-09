const REPLIT = False
const MAX_STARS = 25
const STAR = "★"
const FORMAT = "%PLACE) %SCORE %STARS %NAME (%SCHOOL)"
const PATHTOINDIVIDUAL = REPLIT?"/data.json":"https://saturn.rochesterschools.org/python/AOCbot/data_file.json"
const PATHTOTEAMS = REPLIT?"/data_teams.json":"https://saturn.rochesterschools.org/python/AOCbot/team_file.json"
const PATHTOCSV = REPLIT?"/csv.json":"https://saturn.rochesterschools.org/python/AOCbot/users.json"

var schools = {}
var schoolsParticipation = {}

window.addEventListener("load", async (event)=>{

    var res = await fetch(PATHTOCSV)
    const nameSchoolData = await res.json()


    var res = await fetch(PATHTOINDIVIDUAL)
    var {members} = await res.json()
    members = Object.values(members)
    members.sort((a, b) => b.local_score - a.local_score)

    const INVIDIUALGROUP = document.querySelector(`section[name="individual"]`).querySelector("div")

    for(const [index, person] of Object.entries(members)) {
        if(person.stars <= 0) continue
        const AOCUsername = person.name
        var name = AOCUsername
        var school = "?"
        if(nameSchoolData[AOCUsername]){
            name = nameSchoolData[AOCUsername][`What is your first and last name?`]
            school = nameSchoolData[AOCUsername][`Which school do you attend?`].trim()
            if(!schoolsParticipation[school]) schoolsParticipation[school] = 0
            schoolsParticipation[school] += 1
            if(!schools[school]) schools[school] = 0
            schools[school] += person.stars 
        }
        const element = createPerson({name:name,place:index,score:person.local_score,stars:person.stars,school:school})
        INVIDIUALGROUP.appendChild(element)
    }

    const SCHOOLGROUP = document.querySelector(`section[name="schools"]`).querySelector("div")

    const schoolNames = Object.keys(schools)

    for(i=0;i<schoolNames.length;i++) {
        const schoolName = schoolNames[i]
        const starCount = schools[schoolName]
        const playerCount = schoolsParticipation[schoolName]
        const school = document.createElement("person")
        school.classList.add(schoolName)
        school.innerText = i+") "+schoolName+" Total Stars: "+starCount+", Total Participants: "+playerCount
        SCHOOLGROUP.appendChild(school)
    }

    var res = await fetch(PATHTOTEAMS)
    var {members} = await res.json()
    members = Object.values(members)
    members.sort((a, b) => b.local_score - a.local_score)

    var highestGroups = {}

    const TEAMGROUP = document.querySelector(`section[name="teams"]`).querySelector("div")

    for(const [index, person] of Object.entries(members)) {
        if(person.stars <= 0) continue
        const AOCUsername = person.name
        var name = AOCUsername
        var skhools = []

        if(nameSchoolData[AOCUsername]){
            if(nameSchoolData[AOCUsername][`Are you participating as part of a team or as an individual?`] != "Team") continue
            name = nameSchoolData[AOCUsername][`What is your team name?`].trim()
            if(highestGroups[name]) continue
            highestGroups[name] = true
            for(participant of Object.values(nameSchoolData)) {
                if(participant[`What is your team name?`].trim() == name){
                    skhools.push(participant[`Which school do you attend?`])
                }
            }
            school = nameSchoolData[AOCUsername][`Which school do you attend?`].trim()
        }
        const element = createPerson({name:name,place:index,score:person.local_score,stars:person.stars,school:skhools.join("/")})
        TEAMGROUP.appendChild(element)
    }
    
})

function createPerson({name,place,score,stars,school}){
    const person = document.createElement("person")
    const spaces = 3-`${place}`.length
    const scorespaces = 5-`${score}`.length
    const firstHalf = document.createTextNode(" ".repeat(spaces)+place+")"+" ".repeat(scorespaces)+score+" ")
    person.appendChild(firstHalf)

    const fullStars = document.createElement("span")
    fullStars.classList.add("goldStar")
    fullStars.innerText = STAR.repeat(Math.floor(stars/2))
    person.appendChild(fullStars)

    const silverStars = document.createElement("span")
    silverStars.classList.add("silverStar")
    silverStars.innerText = STAR.repeat(stars%2)
    person.appendChild(silverStars)

    const incompleteStars = document.createElement("span")
    incompleteStars.classList.add("incompleteStar")
    incompleteStars.innerText = STAR.repeat(MAX_STARS-Math.ceil(stars/2))
    person.appendChild(incompleteStars)

    const secondHalf = document.createElement("span")
    secondHalf.innerText = " "+name+" ("+school+")"
    secondHalf.classList.add(school)
    
    person.appendChild(secondHalf)

    return person
}
