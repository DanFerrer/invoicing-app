const { Router } = require('express');
const UserTable = require('../user/table');

const router = new Router();

router.post('/register', (req, res, next) => {
    UserTable.storeDragon(req.body)
        .then((user) => {
            res.json(user);
        })
        .catch(error =>  console.log(error));
});

module.exports = router;

