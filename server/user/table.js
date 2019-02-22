const pool = require('../../pool');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserTable {
    static storeUser(user) {
        const { name, email, companyName, password } = user;
        console.log(user);

        bcrypt.hash(password, saltRounds, (err, hash) => {
            return new Promise((resolve, reject) => {
                pool.query(
                    `INSERT INTO users(name, email, "companyName", password)
                VALUES($1, $2, $3 $4)`,
                    [name, email, companyName, hash],
                    (err, res) => {
                        if (err) return reject(err);
    
                        resolve({
                            user: res.rows[0]
                        });
                    }
                );
            });
        });
    }
}

module.exports = UserTable;