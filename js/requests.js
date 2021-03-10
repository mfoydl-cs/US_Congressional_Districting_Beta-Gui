function retrieveDistricts(){
    return [AL_CD_116,AL_CD_113]
    //return [AL_CD_116, AL_CD_113, AR_CD_116, AR_CD_113, AR_CD_116, AR_CD_113]
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