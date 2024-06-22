import dbclient from '../utils/db';
import sha1 from 'sha1'
class UsersController {
    static postNew(req, res) {
        const email = req.body.email;
        const password = req.body.password;
        res.statusCode = 400;
        if (!email) {
            return res.end({'error':'Missing email'});
        }
        else if (!password) {
            return res.end({'error': 'Missing password'});
        }
        else if (dbclient.findByEmail(email)) {
            return res.end({'error': 'Already exist'})
        }
        hashed_pwd = sha1(password)
        new_id = dbclient.store(email, hashed_pwd)
        res.statusCode = 201;
        return res.end({'id': new_id, 'email': email})
    }
}
export default UsersController;