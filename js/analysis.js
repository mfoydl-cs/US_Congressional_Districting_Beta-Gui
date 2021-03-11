// calculate dot product of district scores and weights
function getScore(d, weights) {
	let score = 0
	for (let s in weights) {
		score += d['scores'][s] * weights[s]
	}
	return score
}