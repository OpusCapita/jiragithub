const http = require("superagent");

let gitToken = process.argv[2];
let jiraUser = "oc.bn.automation@gmail.com";
let jiraToken = process.argv[3];

// iterate columns in business network project on OpusCapita level
// GET /projects/:project_id/columns

async function run() {

    let project = null;
    try {
        /*
        project = await getProject("BusinessNetwork");
        let columns = await getColumns(project.id, ['Requested', 'Ready', 'On Hold', 'In Progress', 'Review']);
        console.log("columns: ", columns);
        for(let columnName in columns) {
            // now get all cards in column
            let cards = await getCards(columns[columnName].id);
            console.log("got cards in " + columnName + ": ", cards.map( (card) => {return card["content_url"] }));
        }
        */
        let board = await getJIRABoard("TB board");
        console.log("got JIRA board:", board);
        let columns = await getJIRAColumns(board.id, ['Requested', 'Ready', 'On Hold', 'In Progress', 'Review']);
        console.log("columns: ", columns);
        for(let columnName in columns) {
            // now get all cards in column
            //let cards = await getCards(columns[columnName].id);
            //console.log("got cards in " + columnName + ": ", cards.map( (card) => {return card["content_url"] }));
        }        
    }
    catch(err) {
        console.log("error getting project: ", err);
        process.exit(1);
    }
    //console.log("id = ", project.id);
}

/**
 *  Iterates all OpusCapita projects
 */
async function getProject(name) {
    console.log("getProject(" + name + ")");
    let response = null;
    try {
        console.log("going to get request");
        response = await http.get("https://api.github.com/orgs/OpusCapita/projects")
	      .set("Accept", "application/vnd.github.inertia-preview+json")
        .auth(gitToken, "");
        
        //console.log("ocProjects= ", response.body);
    }
    catch (err) {
        console.error("caught: ", err);
    }
    let project = response.body.find( (p) => { return p.name == name; } );
    return project;
}

/**
 *  Iterates all OpusCapita projects
 */
async function getJIRABoard(name) {
    console.log("getJIRABoard(" + name + ")");
    let response = null;
    try {
        response = await http.get("https://opuscapita.atlassian.net/rest/agile/latest/board?name=" + encodeURI(name))
	      .set("Accept", "application/json")
        .auth(jiraUser, jiraToken);
        
        console.log("jiraBoards= ", response.body);
        let projectId = response.body.values.find( (p) => { return p.name == name; } ).id;
        response = await http.get("https://opuscapita.atlassian.net/rest/agile/latest/board/" + projectId + "/configuration")
	      .set("Accept", "application/json")
        .auth(jiraUser, jiraToken);
        
        console.log("jiraBoard= ", response.body);
        
    }
    catch (err) {
        console.error("caught: ", err);
    }
    let project = response.body;
    return project;
}

/**
 *  Iterates all OpusCapita projects
 */
async function getJIRAColumns(boardId, filterNames) {
    console.log("getJIRABoard(" + boardId + ")");
    let response = null;
    try {
        response = await http.get("https://opuscapita.atlassian.net/rest/agile/latest/board/" + boardId + "/configuration")
	      .set("Accept", "application/json")
        .auth(jiraUser, jiraToken);
        
        console.log("project config= ", response.body);
        
        let result = {};
        let filteredColumns = response.body.columnConfig.columns
        .filter( (column) => {return !filterNames || filterNames.indexOf(column.name) > -1} );
        
        console.log("filtered columns= ", filteredColumns);
        
        filteredColumns.map( (column) => {result[column.name] = column});
                
        return result;
        
    }
    catch (err) {
        console.error("caught: ", err);
    }
}

run();

/**
 */
async function getCards(columnId) {
    let response = null;
    try {
        response = await http.get("https://api.github.com/projects/columns/" + columnId + "/cards")
	      .set("Accept", "application/vnd.github.inertia-preview+json")
        .auth(gitToken, "");
    }
    catch (err) {
        console.error("caught: ", err);
    }
    return response.body;
}

/**
 */
async function getColumns(projectId, filterNames) {
    let response = null;
    try {
        response = await http.get("https://api.github.com/projects/" + projectId + "/columns")
	      .set("Accept", "application/vnd.github.inertia-preview+json")
        .auth(gitToken, "");
    }
    catch (err) {
        console.error("caught: ", err);
    }
    let result = {};
    let filteredColumns = response.body
        .filter( (column) => {return !filterNames || filterNames.indexOf(column.name) > -1} )
        .map( (column) => {result[column.name] = column});
    return result;
}

