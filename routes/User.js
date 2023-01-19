const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../routes/encryption');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    try{

        const user = await helper(req.body.email);

        if(user) {
            res.status(400).send("User already exists");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const payload = {
            fullName: encrypt(req.body.fullName),
            phoneNumber: encrypt(req.body.phoneNumber),
            email: encrypt(req.body.email),
            password: hashedPassword
        }

        const newUser = new User(payload);
        await newUser.save();

        res.status(200).send("User signed up successfully");
        return;

    } catch (err) {
        res.status(400).send(err);
        return;
    }
});

router.post('/login', async (req, res) => {
    try{
        
        const user = await helper(req.body.email);

        if(!user) {
            res.status(400).send("User not found");
            return;
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) {
            res.status(400).send("Invalid password");
            return;
        }

        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        const resUser = {
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            token: token
        }

        res.status(200).send(resUser);
        return;

    } catch (err) {
        res.status(400).send(err);
        return;
    }
});

router.put('/forgot-password', async (req, res) => {
    try{
        const user = await helper(req.body.email);
        
        console.log(user);
        if(!user) {
            res.status(400).send("User not found");
            return;
        }

        const validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
        if(!validPassword) {
            res.status(400).send("Invalid password");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

        const updatedUser = await User.findOneAndUpdate({_id: user._id}, {password: hashedPassword});

        res.status(200).send("Password updated successfully");
        return;

    } catch (err) {

        res.status(400).send(err);
        return;
    }
});

router.put('/update', async (req, res) => {
    try{
        const user = await helper(req.body.email);

        if(!user) {
            res.status(400).send("User not found");
            return;
        }

        if(req.body.fullName) {
            const updatedUser = await User.findOneAndUpdate({_id: user._id}, {fullName: encrypt(req.body.fullName)});
        }

        if(req.body.phoneNumber) {
            const updatedUser = await User.findOneAndUpdate({_id: user._id}, {phoneNumber: encrypt(req.body.phoneNumber)});
        }

        res.status(200).send("User updated successfully");
        return;
    }
    catch (err) {
        res.status(400).send(err);
        return;
    }
});

const helper = async (email) => {
    try{
        const users = await User.find({});

        const decryptedUsers = users.map(user => {
            return {
                _id: user._id,
                fullName: decrypt(user.fullName),
                phoneNumber: decrypt(user.phoneNumber),
                email: decrypt(user.email),
                password: user.password
            }
        });

        const user = decryptedUsers.find(user => user.email === email);

        return user;
    } catch (err) {
        return err;
    }
}

module.exports = router;