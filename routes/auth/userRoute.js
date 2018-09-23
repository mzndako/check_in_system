var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var passport = require("passport");
var permissions = require('../repository/users_permission');
var users = require('../repository/users');
/**
 * @swagger
 * definitions:
 *   Users:
 *     properties:
 *       username:
 *         type: string
 *       password:
 *         type: string
 *       email:
 *         type: string
 *       firstname:
 *         type: string
 *       lastname:
 *         type: string
 *       phone:
 *         type: string
 *       enabled:
 *         type: enum {'yes' , 'no'} default 'yes'
 *       isadmin:
 *         type: enum {'yes' , 'no'} default 'no'
 *   UsersPermission:
 *     properties:
 *       permission_id:
 *         type: integer
 *       user_id:
 *         type: integer
 *       enable:
 *         type: enum {'yes' , 'no'} default 'yes'
 *
 */
/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns all Users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of Users
 *         schema:
 *           $ref: '#/definitions/Users'
 */

router.get('/' , users.getAll);

router.post('/update' , users.update);

router.post('/updatePassword' , users.updatePassword);
router.post('/adminpassword' , users.changePassAdmin);

/**
 * @swagger
 * /api/v1/user/permissions:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns all Users permissions
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of Users permissions
 *         schema:
 *           $ref: '#/definitions/UsersPermission'
 */

router.get('/permissions' , permissions.getAll);
/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: User's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A single User
 *         schema:
 *           $ref: '#/definitions/Users'
 */
router.get('/:id' , users.getById);
/**
 * @swagger
 * /api/v1/user/permissions/{id}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single  permissions
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: permissions's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A single  permissions
 *         schema:
 *           $ref: '#/definitions/UsersPermission'
 */
router.get('/permissions/:id' , permissions.getPermissionById);
/**
 * @swagger
 * /api/v1/user/permissions/enable/{users_id}/{permissions_id}:
 *   get:
 *     tags:
 *       - Users
 *     description: Enable a single user's permission
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: users_id
 *         description: User id
 *         in: path
 *         required: true
 *         type: integer
 *       - name: permissions_id
 *         description: Permissions id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A success statements
 *         schema:
 *           $ref: '#/definitions/UsersPermission'
 */
router.post('/permissions/enable' , permissions.enable);
/**
 * @swagger
 * /api/v1/user/permissions/disable/{users_id}/{permissions_id}:
 *   get:
 *     tags:
 *       - Users
 *     description: disable a single user's permission
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: users_id
 *         description: User id
 *         in: path
 *         required: true
 *         type: integer
 *       - name: permissions_id
 *         description: Permissions id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A success statements
 *         schema:
 *           $ref: '#/definitions/UsersPermission'
 */
router.post('/permissions/disable' , permissions.disable);

/**
 * @swagger
 * /api/v1/user/disable/{id}:
 *   get:
 *     tags:
 *       - Users
 *     description: disable a single user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Users id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A success statements
 *         schema:
 *           $ref: '#/definitions/Users'
 */
router.get('/disable/:id' , users.disable);
/**
 * @swagger
 * /api/v1/user/recover/{email}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single  User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: user's email
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A single  users password recovery
 *         schema:
 *           $ref: '#/definitions/Users'
 */
router.get('/recover/:email' , users.recover);

/**
 * @swagger
 * /api/v1/user/enable/{id}:
 *   get:
 *     tags:
 *       - Users
 *     description: enable a single user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: Users id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A success statements
 *         schema:
 *           $ref: '#/definitions/Users'
 */
router.get('/enable/:id' , users.enable);

/**
 * @swagger
 * /api/v1/user/permissions/users/{user_id}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single users  permissions
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user_id
 *         description: user's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A single user  permissions
 *         schema:
 *           $ref: '#/definitions/UsersPermission'
 */
router.get('/permissions/users/:user_id' , permissions.getAllUsersPermissions);


/**
 * @swagger
 * /api/v1/user/permissions/userspermission/{permission_id}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns Permission Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: permission_id
 *         description: permission's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Permissions Users
 *         schema:
 *           $ref: '#/definitions/UsersPermission'
 */
router.get('/permissions/userspermission/:permission_id' , permissions.getALlPermissionsUsers);


/**
 * @swagger
 * /api/v1/user/permissions:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new User permission
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: loan
 *         description: User permission object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UsersPermission'
 *     responses:
 *       201:
 *         description: User permission created successfully
 *         schema:
 *           $ref: '#/definitions/UsersPermission'
 */
router.post('/permissions' , permissions.create);
/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     tags: 
 *       - Users
 *     description: Creates a new User
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: loan
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Users'
 *     responses: 
 *       201:
 *         description: User created successfully
 *         schema:
 *           $ref: '#/definitions/Users'
 */
router.post('/' , users.registerUser);
module.exports = router; 