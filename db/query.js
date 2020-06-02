require('dotenv').config();

const { Client } = require('pg');

const client = new Client({
    user: process.env.db_user,
    host: process.env.db_host,
    database: process.env.db_name,
    password: process.env.db_pswd,
    post: process.env.db_port
});

client.connect();

/**
 * @name: set
 * @param: request {Object}
 * @param: response {Object}
 * @return:
 * @description: setting query
 */
const set = (request, response) => {
    var params = [];
    var sql = "select se, word_ko, word_en, word_ab, thema, count(*) over() as total from std_dic_t";



    request.url.split('?')[1].split('&').forEach(n => {
        var key = n.split('=')[0];
        var val = n.split('=')[1];

        params[key] = val;
    });

    var type = decodeURI(params['category']);

    if(type == '국문명') sql += " where word_ko like $1 limit 5 offset $2";
    else if(type == '영문명') sql += " where lower(word_en) like $1 limit 5 offset $2";
    else sql += " where thema like $1 limit 5 offset $2";

    run(response, sql, params);
};

/**
 * @name: run
 * @param: response {Object}
 * @param: query {String}
 * @return:
 * @description: run query
 */
const run = (response, sql, params) => {

    const _q1 = `%${decodeURI(params['text'].toLowerCase())}%`;
    const _q2 = `${((params['page'] - 1) * 5)}`;

    client
    .query(sql, [_q1, _q2])
    .then(result => {
        end(response, 200, result.rowCount, result.rows, 'completed');
    })
    .catch(e => {
        end(response, 500, 0, [], 'failed');
    })
    .then(() => {
        console.log(`${sql}::query end`);
    })
};

/**
 * @name: end
 * @param: response {Object}
 * @param: status {Integer}
 * @param: total {Integer}
 * @param: items {Array}
 * @param: msg {String}
 * @return:
 * @description: end query
 */
const end = (response, status, total, items, msg) => {

    const res = {
        status: status,
        total: total,
        items: items,
        message: msg
    };

    response.statusCode = status;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(res));
};

// export modules
module.exports = { set: set };
