const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const PORT = process.env.PORT || 3000;

const bcrypt = require('bcrypt')
const saltRounds = 10;

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Welcome to Invoicing App');
});

app.post('/register', function(req, res) {
    const {name, email, company_name, password} = req.body;
    // check to make sure none of the fields are empty
    const isEmptyBody = !name || !email || !company_name || !password;

    if (isEmptyBody) {
        return res.json({
            'status': false,
            'message': 'All fields are required'
        })
    }

    bcrypt.hash(password, saltRounds, function (err, hash) {
        const db = new sqlite3.Database('./database/InvoicingApp.db');
        const sql = `INSERT INTO users(name,email,company_name,password) VALUES('${
          name
        }','${email}','${company_name}','${hash}')`;

        db.run(sql, function (err) {
            if (err) {
                throw err;
            } else {
                return res.json({
                    status: true,
                    message: 'User Created'
                });
            }
        });

        db.close();
    });
});

app.post('/login', function (req, res) {
    const db = new sqlite3.Database("./database/InvoicingApp.db");
    const sql = `SELECT * from users where email='${req.body.email}'`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        db.close();
        if (!rows.length) {
            return res.json({
                status: false,
                message: "Sorry, wrong email"
            });
        }

        const user = rows[0];
        const authenticated = bcrypt.compareSync(req.body.password, user.password);
        delete user.password;
        if (authenticated) {
            return res.json({
                status: true,
                user
            });
        }
        return res.json({
            status: false,
            message: "Wrong Password, please retry"
        });
    });
});

app.post('/invoice', multipartMiddleware, function (req, res) {
    const { name, user_id, txn_names, txn_prices } = req.body;
    if (!name) {
        return res.json({
            status: false,
            message: "Invoice needs a name"
        });
    }

    const db = new sqlite3.Database('./database/InvoicingApp.db');
    const sql = `INSERT INTO invoices(name,user_id,paid) VALUES(
        '${name}',
        '${user_id}',
        0
    )`;

    db.serialize(function () {
        db.run(sql, function (err) {
            if (err) {
                throw err;
            }
            const invoice_id = this.lastID;

            for (let i = 0; i < req.body.txn_names.length; i++) {
                const query = `INSERT INTO transactions(name,price,invoice_id) VALUES(
                '${txn_names[i]}',
                '${txn_prices[i]}',
                '${invoice_id}'
            )`;
                db.run(query);
            }

            return res.json({
                status: true,
                message: "Invoice created"
            });
        });
    })
});

app.get('/invoice/user/:user_id', multipartMiddleware, function (req, res) {
    const db = new sqlite3.Database("./database/InvoicingApp.db");
    const sql = `SELECT * FROM invoices LEFT JOIN transactions ON invoices.id=transactions.invoice_id WHERE user_id='${req.params.user_id}'`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        return res.json({
            status: true,
            transactions: rows
        });
    });
});

app.get("/invoice/user/:user_id/:invoice_id", multipartMiddleware, function (req, res) {
    let db = new sqlite3.Database("./database/InvoicingApp.db");
    let sql = `SELECT * FROM invoices LEFT JOIN transactions ON invoices.id=transactions.invoice_id WHERE user_id='${
        req.params.user_id
      }' AND invoice_id='${req.params.invoice_id}'`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        return res.json({
            status: true,
            transactions: rows
        });
    });
});

app.listen(PORT, function () {
    console.log(`App running on localhost:${PORT}`);
});



