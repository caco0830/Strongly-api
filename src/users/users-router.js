const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const {password, username, fullname} = req.body;
        
        //Check required fields are present
        for(const field of ['fullname', 'username', 'password'])
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });
            }
        
        //validate password, if it fails, display an error
        const passwordError = UsersService.validatePassword(password);

        if(passwordError){
            return res.status(400).json({error: passwordError});
        }
        
        //checks if the username already exists
        UsersService.hasUserWithUserName(
            req.app.get('db'),
            username
        )
        .then(hasUserWithUserName => {
            if(hasUserWithUserName){
                return res.status(400).json({error: `Username already taken`});
            }

            return UsersService.hashPassword(password)
                .then(hashedPassword => {
                    const newUser = {
                        username,
                        password: hashedPassword,
                        fullname,
                        date_created: 'now()',
                    }
         
                    return UsersService.insertUser(
                        req.app.get('db'),
                        newUser
                    )
                    .then(user => {
                        res
                            .status(201)
                            .location(path.posix.join(req.originalUrl, `/${user.id}`))
                            .json(UsersService.serializeUser(user));
                    });
            });
        })
        .catch(next);
    });

module.exports = usersRouter;