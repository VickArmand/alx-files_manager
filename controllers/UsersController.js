import sha1 from 'sha1';
import dbclient from '../utils/db';

class UsersController {
  static postNew(req, res) {
    const { email } = req.body;
    const { password } = req.body;
    if (!email) {
      return res.status(400).end({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).end({ error: 'Missing password' });
    }
    if (dbclient.findByEmail(email)) {
      return res.status(400).end({ error: 'Already exist' });
    }
    const hashedPwd = sha1(password);
    const newId = dbclient.store(email, hashedPwd).id;
    return res.status(201).end({ id: newId, email });
  }
}
export default UsersController;
