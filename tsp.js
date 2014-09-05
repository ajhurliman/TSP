/*
Written by ajHurliman Aug 28 2014 after reading http://www.codeproject.com/Articles/792887/Travelling-Salesman-Genetic-Algorithm I haven't seen the code, but this is based off the description in the article

The travelling salesman starts out in the corner of a grid and has to travel to
each of the specified destinations exactly once. Typically the salesman starts out in the upper left-hand corner, but I'm starting with the lower right.

This is a genetic algorithm so it will randomly generate fill a population of salesmen
with guess at the fastest route. Then it sorts them by the distance each one travelled
and deletes the poorest performers. The poor performers are replaced by new, random guesses, everyone who didn't get cut undergoes a mutation and the cycle continues.
*/



/*variables*/
var population = [];
var nodeCount = 10; //this is the number of destinations to travel to
var popSize = 200; //each of these is a single 'guess' at the best route
var iterationCount = 20000; //number of generations to run through
var howManyLosers = Math.ceil(popSize*.05); //number of the poorest performers to cut
var mapSize = 100; //size of one leg of the grid system (x by x square)
var i;
var j;
var destinations = []; //these are the places to visit, they don't change after being seeded
var mainLoop;
var topScore = 999999;


/*objects*/


Array.prototype.swap = function(x, y) {
	var swapTemp = this[x];
	this[x] = this[y];
	this[y] = swapTemp;
	return this;
}

main();

/*functions*/

/*This determines which places the salesman has to go. The number of places is given by
the nodeCount variable. Each destination is a coordinate pair on a X-Y grid system*/

function main() {
	for (i = 0; i < popSize; i++) {
		population[i] = {
			route: [],
			routeDist: 0
		};
	}
	generatePop(0, popSize);
	destinations = generateDestinations(nodeCount);

	for (mainLoop = 0; mainLoop < iterationCount; mainLoop++) {
		console.log(mainLoop);
		getDist();
		sortPop();
		mutateWinners();
		//generatePop(popSize-howManyLosers, popSize);
	}

	console.log("The destinations: " + destinations);

	console.log("The top ten winners are...");
	for (i = 0; i < 10; i++) {
		console.log("Salesman #" + i + ":");
		console.log("route: " + population[i].route);
		console.log("routeDist: " + population[i].routeDist);
	}
	console.log("and the top score is: " + topScore);
};


function generateDestinations(nodeCount) {
	var tempDest = [];

	for (i = 0; i < nodeCount; i++) {
		tempDest[i] = [];
	}

	for (i = 0; i < nodeCount; i++) {
		tempDest[i][0] = Math.floor(Math.random()*mapSize); //sets x-coord
		tempDest[i][1] = Math.floor(Math.random()*mapSize); //sets y-coord
	}
	return tempDest;
};


/*replaces all elements from lowRange to highRange with freshly randomized arrays*/
function generatePop(lowRange, highRange) {
	for (var i = lowRange; i < highRange; i++) {
		population[i].route = generateSalesman(nodeCount);
	}
};


/*
makes a random route for each salesman. when one node is selected it's retired
from the options of selectable nodes so that every node is visited exactly once
*/
function generateSalesman(nodeCount) {
	var randomSalesman = [];
	var burnDownArray = [];
	var randKey;
	/*	burnDownArray gets filled with the list of destinations and randomly assigns them to generateSalesman. As burnDownArray 'burns down' generateSalesman fills up with the remaining contents of burnDownArray*/
	for (var i = 0; i < nodeCount; i++) {
		burnDownArray[i] = i;
	}
	for (var i = 0; i < nodeCount; i++) {
		randKey = Math.floor(Math.random()*burnDownArray.length);
		randomSalesman[i] = burnDownArray[randKey]; // randomly picks an element left in burnDownArray
		burnDownArray.splice(randKey, 1); //deletes the element from burnDownArray that just got assigned
	}
	return randomSalesman;
};


//calculates the distance of a route & assigns those to their respective objects
function getDist() {
	var i;
	var j;
	var xSquared = 0;
	var ySquared = 0;
	var dist = 0;
	var totDist = 0;
	for (i = 0; i < popSize; i++) {
		population[i].routeDist = 0; //resets routeDist
		// \/ \/ \/ this adds the distance from the [0,0] to the first node \/ \/ \/
		xSquared = Math.pow(destinations[population[i].route[0]][0],2);
		ySquared = Math.pow(destinations[population[i].route[0]][1],2);
		population[i].routeDist += Math.pow((xSquared + ySquared), 0.5);
		// \/ \/ \/ this for loop adds the distances between all the nodes \/ \/ \/
		for (j = 1; j < nodeCount; j++) {
			xSquared = Math.pow(destinations[population[i].route[j]][0] - destinations[population[i].route[j - 1]][0],2);
			ySquared = Math.pow(destinations[population[i].route[j]][1] - destinations[population[i].route[j - 1]][1],2);
			population[i].routeDist += Math.pow((xSquared + ySquared), 0.5);
		}
		// \/ \/ \/ this adds the distance from the last node back to [0,0] \/ \/ \/
		xSquared = Math.pow(destinations[population[i].route[nodeCount - 1]][0],2);
		ySquared = Math.pow(destinations[population[i].route[nodeCount - 1]][1],2);
		population[i].routeDist += Math.pow((xSquared + ySquared), 0.5);
	}
};

/*sorts the population by the distance it takes them to travel their route*/
function sortPop() {
	population.sort(compareNum);
	if (population[0].routeDist < topScore) {
		topScore = population[0].routeDist;
	}
/*	console.log(topScore);
	console.log(population[0].routeDist);*/
};

//used in sortPop to compare route sizes
function compareNum(a, b) {
	return a.routeDist - b.routeDist;
};

/*just makes a simple swap between two elements in each of the winners' routes
rev2: the top 25% doesn't get mutated so it keeps high scorers. this increased the scores and lowered the range of the final generation's top 10*/
function mutateWinners() {
	var swapElement1;
	var swapElement2;
	for (i = popSize/4; i < popSize - howManyLosers; i++) {
		swapElement1 = Math.floor(Math.random()*nodeCount);
		swapElement2 = Math.floor(Math.random()*nodeCount);
		// \/ \/ \/ the while element ensures the two elements aren't the same \/ \/ \/
		while (swapElement1 === swapElement2) {
			swapElement2 = Math.floor(Math.random()*nodeCount);
		}
		population[i].route.swap(swapElement1, swapElement2);
	}
};
