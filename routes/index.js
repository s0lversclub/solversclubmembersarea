const express = require('express');

const router = express.Router();
const appController = require('../controllers/appController');
const userController = require('../controllers/userController');
const dataController = require('../controllers/dataController');

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
router.get('/members', userController.isLoggedIn, userController.buildDirectory, appController.getMembersDirectory);
router.get('/discovery', userController.isLoggedIn, userController.buildDiscovery, appController.getDiscovery);
router.get('/update', userController.isLoggedIn, appController.getMembersUpdate);
router.get('/resources', userController.isLoggedIn, appController.getResources);
router.get('/delete', userController.isLoggedIn, appController.getDelete);
router.get('/thankyou', appController.getThankyou);
router.get('/tc', appController.getTC);
router.get('/privacy', appController.getPrivacy);
router.get('/membersarea', appController.getHome);
router.get('/newsletter', appController.getSubscribe);
router.get('/unsubscribe', appController.getUnsubscribe);

router.post(
  '/user/add',
  userController.addUser,
  userController.storePassword,
  appController.getThankyou
);
router.post(
  '/user/auth',
  userController.checkUser,
  userController.authenticate,
);
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
router.post(
  '/user/dirprof',
  userController.buildProfile,
  userController.authenticate,
);
router.post(
  '/user/dirchallenge',
  userController.buildChallenge,
  userController.authenticate,
);
router.post(
  '/user/request',
  userController.sendRequest,
  appController.getThankyou
);
router.post(
  '/user/subscribe',
  userController.mailSubscribe,
  appController.getThankyou
);
router.post(
  '/user/unsubscribe',
  userController.mailUnsubscribe,
  appController.getThankyou
);
module.exports = router;
