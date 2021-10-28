const express = require('express');

const router = express.Router();
const appController = require('../controllers/appController');
const userController = require('../controllers/userController');

/* GET home page. */
router.get('/', appController.getIndex);
router.get('/register', appController.getRegister);
router.get('/join', appController.getJoin);
router.get('/login', appController.getLogin);
router.get('/logout', userController.logout);
router.get('/profile', userController.isLoggedIn, appController.getProfile);
router.get('/forgot', appController.getForgetPassword);
router.get('/activate', appController.getActivate);
router.get('/login/resetlink/:token', appController.getResetPassword);
router.get('/activate/activatelink/:token', appController.getConfirmActivate);
router.get('/members', userController.isLoggedIn, appController.getMembersDirectory);
router.get('/discovery', userController.isLoggedIn, appController.getDiscovery);
router.get('/update', userController.isLoggedIn, appController.getMembersUpdate);
router.get('/resources', userController.isLoggedIn, appController.getResources);
router.get('/delete', userController.isLoggedIn, appController.getDelete);
router.get('/thankyou', appController.getApplied);
router.get('/tc', appController.getTC);
router.get('/privacy', appController.getPrivacy);

router.post(
  '/user/add',
  userController.addUser,
  userController.storePassword,
  appController.getApplied
);
router.post(
  '/user/auth',
  userController.authenticate);
router.post(
  '/user/forgot',
  userController.addToken,
  userController.sendPasswordResetEmail
);
router.post(
  '/user/reset',
  userController.confirmToken,
  userController.storePassword,
  userController.sendConfirmResetEmail
);
router.post(
  '/user/activate',
  userController.addActivationToken,
  userController.sendActivationEmail
);
router.post(
  '/user/confirmactivate',
  userController.confirmToken,
  userController.storePassword,
  userController.sendConfirmActivationEmail
);

module.exports = router;
