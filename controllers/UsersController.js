import dbClient from '../utils/db';
class UsersController {
    static postNew(req, res) {
        const email = req.body.email;
        const password = req.body.password;
        if (!email) {
            res.statusCode = 400;
            res.end('Missing email');
        }
        if (!password) {
            res.statusCode = 400;
            res.end('Missing password');
        }   
    }
}
export default UsersController;