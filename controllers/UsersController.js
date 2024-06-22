import dbclient from '../utils/db';
import sha1 from 'sha1'
class UsersController {
    static postNew(req, res) {
        const email = req.body.email;
        const password = req.body.password;
        if (!email) {
            return res.status(400).end({'error':'Missing email'});
        }
        else if (!password) {
            return res.status(400).end({'error': 'Missing password'});
        }
        else if (dbclient.findByEmail(email)) {
            return res.status(400).end({'error': 'Already exist'})
        }
        hashed_pwd = sha1(password)
        new_id = dbclient.store(email, hashed_pwd).id
        return res.status(201).end({'id': new_id, 'email': email})
    }
}
export default UsersController;