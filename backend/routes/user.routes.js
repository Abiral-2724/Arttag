import express from "express";
import { addUserAddress, deleteUserAddress, editUserProfile, getAllAddress, getUserProfile, modifyUserAddress, registerOrLoginUser } from "../controllers/user.controllers.js";

const router = express.Router() ; 

router.post('/login',registerOrLoginUser)

router.patch('/:userId/edit/profile' ,editUserProfile)
router.get('/:userId/get/profile' ,getUserProfile)

router.post('/:userId/add/address' ,addUserAddress)
router.patch('/:userId/modify/address' ,modifyUserAddress)
router.delete('/:userId/delete/address' ,deleteUserAddress)
router.get('/:userId/get/address' ,getAllAddress)
export default router ; 