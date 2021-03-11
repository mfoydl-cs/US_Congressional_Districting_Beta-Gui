import json
def parseFiles():
    states = ["AL","AR","MI"]
    jsonFile = open('incumbents.js', 'w')
    jsonObj = {}
    for state in states:
        #open(state+"_Representatives.txt")
        jsonObj[state] = {"senators":[],'representatives':[]}
        with open(state+"_Senators.txt") as reader:
            line = reader.readline()
            while line!='':
                split = line.split(':')
                sen = {}
                sen['name'] = split[0]
                sen['party'] = decodeParty(split[1])
                sen['since'] = split[2]
                sen['next'] = split[3].strip()
                #print(sen)
                jsonObj[state]['senators'].append(sen)
                line = reader.readline()
        with open(state+"_Representatives.txt") as reader:
            line = reader.readline()
            while line!='':
                split = line.split(':')
                rep = {}
                rep['name'] = split[0]
                rep['party'] = decodeParty(split[1])
                rep['district'] = split[2]
                rep['since'] = split[3].strip()
                jsonObj[state]['representatives'].append(rep)
                line = reader.readline()
    #print(json)
    jsonObject = json.dumps(jsonObj,indent=4)
    jsonFile.write("var incumbentsJson = ")
    jsonFile.write(jsonObject)
    jsonFile.close()

def decodeParty(l):
    parties = {
        'D':"Democrat",
        'R':'Republican'
    }
    return parties.get(l,"N/A")

parseFiles()

                
