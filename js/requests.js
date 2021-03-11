function retrieveDistricts(state, weights){
    switch(state){
        case "AL":
            return [AL_CD_116, AL_CD_113]
        case "AR":
            return [AR_CD_116, AR_CD_113]
        case "MI":
            return [MI_CD_116, MI_CD_113]
    }
}

function getJobsSummary(state){
    return { 
        "jobs-summary": [
            { "name": "Job 01", "rounds": "200", "cooling-period": "50" }, 
            { "name": "Job 02", "rounds": "100,000", "cooling-period": "50" }, 
            { "name": "Job 03", "rounds": "100,000", "cooling-period": "100" }
        ]
    }
}

function constrainJob(constraints){
    return {
        'count': { 'label': 'Districtings Returned: ', 'value': '1,000' },
        'avg-compactness': { 'label': 'Avg. Compactness: ', 'type': 'Polsby-Popper', 'value': '.92' },
        'avg-maj-min': { 'label': 'Avg. Majority-Minority Districts: ', 'value': '2' },
        'population-diff': { 'label': 'Avg. Population Difference: ', 'type': 'Total Population', 'value': '1.2%' },
    }
}