///@ts-check
const path = require("path");

const {forEachRule,forEachScenarioIn,forEachStep} = require("./Iterators");

module.exports = class Cucumber{
    constructor(reportPath){
        this.reportPath = reportPath;
    }

    report(feature){
        const reportJson = [reportFeature(feature)];
        //TODO: what if there are 2 feature files with same name in different folders
        const reportName = path.join(this.reportPath, path.basename( this.fileName(feature.fileName), ".feature")) + ".json";
        cy.task("cucumon_runner_debug", "Writing to " + reportName);
        cy.writeFile( reportName , reportJson);
    }

    fileName(featureFileName){
        return featureFileName.substr(__featuresPath.length).replace("/", "_");
    }
}


function reportFeature(feature){
    const featureReportObj =  {
        "keyword": "Feature",
        "name": feature.statement,
        "description": feature.description,
        "line": feature.lineNumber,
        "id": feature.statement.replace(/ /,"-"),
        "tags": buildTagObject(feature.tags, feature.lineNumber -1),
        "uri": feature.fileName,
        "elements": []
    }

    forEachRule(feature, rule => {
        forEachScenarioIn(rule, (scenario, examples) => {
            let scenarioReportObj = reportScenario(scenario);
            // if(examples){
            //     scenarioReportObj.examples = reportExamples(examples);
            // }
            featureReportObj.elements.push(scenarioReportObj);
        });
    });
    return featureReportObj;
}

function reportScenario(scenario){
    const scenarioReportObj = {
        "id": scenario.statement.replace(/ /,"-"),
        //"keyword": scenario.keyword,
        "keyword": "Scenario",
        "line": scenario.lineNumber,
        "name": scenario.statement,
        "description": scenario.description,
        "tags": buildTagObject(scenario.tags, scenario.lineNumber -1),
        "type": "scenario",
        "steps": []
    }
    forEachStep(scenario, step => {
        scenarioReportObj.steps.push( reportStep(step) );
    })
    return scenarioReportObj;
}

function reportExamples(examples){
    const examplesReportObj = [];
    for (let e_i = 0; e_i < examples.length; e_i++) {
        const example = examples[e_i];
        const id = "examples_"+e_i;
        const exampleReportObj = {
            "keyword": "Examples", 
            "name": id, 
            "line": example.lineNumber, 
            "description": "", 
            "id": id, 
            "rows": []
        }
        for (let row_i = 0; row_i < example.rows.length; row_i++) {
            const row = example.rows[row_i];
            exampleReportObj.rows.push({
                cells: row.cells,
                line: row.lineNumber,
                id: id+ "_" + row_i
            })
        }
        examplesReportObj.push(exampleReportObj);
    }
    return examplesReportObj;
}

function reportStep(step){
    const stepReportObj = {
        "arguments": [],
        "id": step.statement.replace(/ /,"-"),
        "keyword": step.keyword + " ",
        "line": step.lineNumber,
        "name": step.statement,
        "result": {
          "status": step.status,
          "duration": step.duration,
        }

        // "match": { //
        //     "location": "features/step_definitions/steps.rb:1"
        // },
        // "doc_string": {
        //     "content_type": "",
        //     "value": "a string",
        //     "line": 5
        // },
        // "embeddings": [ //to embed a screen shot within the report
        //     {
        //       "mime_type": "image/png",
        //       "data": "Zm9v"
        //     }
        // ],
    }
    if(step.arg){
        const content = step.arg.raw || step.arg.content;
        if(step.arg.type === 'DocString'){
            stepReportObj.arguments = [{
                //"content_type": step.arg_md.type,
                //"content_type": "xml",
                "content": content, //TODO:it can be replaced by instruction processor
                "line": step.arg.lineNumber
            }]
        }else{
            const dt_rows = [];
            for (let r_i = 0; r_i < content.length; r_i++) {
                const row = content[r_i];
                dt_rows.push({cells: row})
            }
            stepReportObj.arguments = [{
                "rows": dt_rows
            }]
        }
    }
    if(step.error_message){
        if(typeof step.error_message === "string"){
            stepReportObj.result.error_message = step.error_message;
        }else if(step.error_message.sourceMappedStack ){
            stepReportObj.result.error_message = step.error_message.sourceMappedStack;
        }else{
            stepReportObj.result.error_message = step.error_message.message;
        }
        // stepReportObj.embeddings = [
        //     {
        //       "mime_type": "image/jpeg",
        //       "data": fs.readFileSync(step.scrShotPath)
        //     }
        //   ],
    }
    return stepReportObj;
}
function buildTagObject(arr, lineNum){
    const arrOp = [];
    for(let i=0; i< arr.legth; i++){
        arrOp.push({
            name: arr[i],
            line: lineNum
        })
    }
}