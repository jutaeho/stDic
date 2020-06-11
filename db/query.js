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
 * @name: singl
 * @param: request {Object}
 * @param: response {Object}
 * @return:
 * @description: setting query
 */
const singl = (request, response) => {
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

    const _q1 = `%${decodeURI(params['text'].toLowerCase())}%`;
    const _q2 = `${((params['page'] - 1) * 5)}`;

    run(response, sql, [_q1, _q2]);
};

/**
 * @name: detail
 * @param: request {Object}
 * @param: response {Object}
 * @return:
 * @description: setting query
 */
const detail = (request, response) => {
    var params = [];
    var sql = "select se, word_ko, word_en, word_ab, thema, count(*) over() as total from std_dic_t where ";

    request.url.split('?')[1].split('&').forEach(n => {
        var key = n.split('=')[0];
        var val = n.split('=')[1];

        params[key] = val;
    });


    let queries = [];

    let idx = 1;
    let kor = decodeURI(params['kor'].toLowerCase());
    let eng = decodeURI(params['eng'].toLowerCase());
    let cat = decodeURI(params['cat'].toLowerCase());

    let _q1 = `%${kor}%`;
    let _q2 = `%${eng}%`;
    let _q3 = `%${cat}%`;
    let _q4 = `${((params['page'] - 1) * 5)}`;


    if(kor.length != 0) {
        sql += 'word_ko like $' + idx;
        queries.push(_q1);
        idx++;
    }
    if(eng.length != 0) {
        sql += " and lower(word_en) like $" + idx;
        queries.push(_q2);
        idx++;
    }
    if(cat.length != 0) {
        sql += " and thema like $"  + idx;
        queries.push(_q3);
        idx++;
    }

    sql += " limit 5 offset $"  + idx;
    queries.push(_q4);

    run(response, sql, queries);
};

/**
 * @name: run
 * @param: response {Object}
 * @param: query {String}
 * @return:
 * @description: run query
 */
const run = (response, sql, params) => {

    client
    .query(sql, params)
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
module.exports = {
    singl: singl,
    detail: detail
};
