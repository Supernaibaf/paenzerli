/**
 * Created by reiem on 12.05.2017.
 */
const constant = require('./const');
const regression = require('./regression.min');

const calculateLandscapePoint = function calculateLandscapePoint(x, lambdas) {
    let sum = 0;
    for (let i = 0; i < lambdas.length; i++) {
        sum += lambdas[i] * Math.pow(x, i);
    }
    return sum;
};

const generateLandscapeLambdas = function generateLandscapeLambdas(landscape) {
    let coordinates = [];
    let counter = 0;
    for (let i = 0; i <= constant.WIDTH; i += landscape.randomPointDistance) {
        let x = i;
        let y = Math.random() * landscape.randomSize + landscape.topDistance;
        coordinates[counter] = [x, y];
        counter++;
    }

    return regression("polynomial", coordinates, landscape.degreesOfFreedom)["equation"];
};

const newLandscape = function newLandscape() {
    let landscapeOptions = constant.LANDSCAPES[Math.floor(Math.random() * constant.LANDSCAPES.length)];
    let landscapePoints = [];
    while (landscapePoints.length === 0) {
        let lambdas = generateLandscapeLambdas(landscapeOptions);
        for (let i = 0; i <= constant.WIDTH; i+=10) {
            let point = calculateLandscapePoint(i, lambdas);
            if (point > constant.HEIGHT || point < 300) {
                landscapePoints = [];
                break;
            }
            landscapePoints.push(point);
        }
    }
    return {
        name: landscapeOptions.name,
        color: landscapeOptions.color,
        points: landscapePoints
    };
};

module.exports.newLandscape = newLandscape;
