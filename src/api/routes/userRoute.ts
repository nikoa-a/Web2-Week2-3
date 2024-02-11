import express from 'express';
import {
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  checkToken,
} from '../controllers/userController';
import {authenticate} from '../../middlewares';

const router = express.Router();

router
  .route('/')
  .get(userListGet)
  .post(userPost)
  .put(authenticate, userPutCurrent)
  .delete(authenticate, userDeleteCurrent);

router.get('/token', authenticate, checkToken);

router.route('/:id').get(userGet);

export default router;
