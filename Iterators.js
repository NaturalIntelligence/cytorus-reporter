
function forEachFeature(featureObj, cb){
    for(let f_i=0; f_i < featureObj.length; f_i++){
        const feature = featureObj[f_i];
        cb(feature);
    }
}
function forEachRule(feature, cb){
    for(let rules_i=0; rules_i < feature.rules.length; rules_i++){
        const rule = feature.rules[rules_i];
        cb(rule);
    }
}

function forEachStep(scenario, cb){
    for(let scenario_i=0; scenario_i < scenario.steps.length; scenario_i++){
        const step = scenario.steps[scenario_i];
        cb(step);
    }
}

function forEachScenarioIn(rule, cb){
    for(let scenario_i=0; scenario_i < rule.scenarios.length; scenario_i++){
        const scenario = rule.scenarios[scenario_i];
        if(scenario.examples){
            for(let expanded_i=0; expanded_i < scenario.expanded.length; expanded_i++){
                cb(scenario.expanded[expanded_i], scenario.examples);
            }
        }else{
            cb(scenario);
        }
    }
}

module.exports = {
    forEachFeature: forEachFeature,
    forEachRule: forEachRule,
    forEachScenarioIn: forEachScenarioIn,
    forEachStep: forEachStep
}