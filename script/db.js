/**
 * Created by reiem on 09.05.2017.
 */
const psql= require('pg');

const config = {
    user: "tankadmin",
    database: "tank",
    password: "tankadmin",
    host: "localhost",
    port: 5432,
    max: 1,
    idleTimeoutMillis: 30000
};

const pool = new psql.Pool(config);

pool.on("error", function(err, client) {
    console.error("idle client error", err.message, err.stack);
});

module.exports.query = function (text, values, callback) {
    return pool.query(text, values, callback);
};

module.exports.connect = function(callback) {
    return pool.connect(callback);
};
