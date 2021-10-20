///@ts-check
const fs = require("fs");
const path = require("path");
// const fs_util = require("./fs_util");

const {forEachRule,forEachScenarioIn,forEachStep} = require("./Iterators");

module.exports = class Cucumber{
    constructor(reportPath, inputJsonPath, options){
        this.reportPath = reportPath;
        this.inputLocation = inputJsonPath;
        this.options = Object.assign({}, options, {
            screenshot : false
        })
    }

    /**
     * Read detailed result from cucumon runner work directory.
     * And generates cucmber reports based on the result
     */
    async report(){
        const files = fs.readdirSync(this.inputLocation); 
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            debug("Generating cucumber report for feature file: " + file);
            const feature = require( path.join( this.inputLocation, file) );
            //feature.fileName is an absolute path
            const reportPath = path.join(this.reportPath, i+".json") ;
            //debug("Report: " + reportPath);
            fs.writeFile( reportPath , JSON.stringify([reportFeature(feature)]), err => {
                if(err) {
                    console.error("Unable to write cucumber report for feature: " + feature.statement);
                    throw err;
                }else{
                    debug("Generated Cucumber Report for feature: " + feature.statement);
                }
            });
        }
    }
}


function reportFeature(feature){
    const featureReportObj =  {
        "keyword": "Feature",
        "type": "feature",
        "name": feature.statement,
        "description": feature.description,
        "line": feature.lineNumber,
        "id": feature.statement.replace(/ /g,"-"),
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
        "id": scenario.statement.replace(/ /g,"-"),
        //"keyword": scenario.keyword,
        "keyword": "Scenario",
        "type": "scenario",
        "line": scenario.lineNumber,
        "name": scenario.statement,
        "description": scenario.description,
        "tags": buildTagObject(scenario.tags, scenario.lineNumber -1),
        "steps": []
    }
    forEachStep(scenario, step => {
        if(step.status !== "skipped") scenarioReportObj.steps.push( reportStep(step) );
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
        "id": step.statement.replace(/ /g,"-"),
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
        
        
        
    }
    addEmbeded(step, stepReportObj);
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

function addEmbeded(step, stepReportObj){
    if(step.screenshot && this.options.screenshot){
        stepReportObj.embeddings = [
            {
                "mime_type": "image/png",
                "data": fs.readFileSync(step.screenshot).toString('base64')
            }
        ]
    }
}

const DEBUG_COLOR = "\x1b[38;5;129;1m";
const debug = msg => {
    if(process.env["DEBUG"] === "cytorus") console.log( DEBUG_COLOR, "DEBUG::" , msg,"\x1b[0m");
}