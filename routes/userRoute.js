import express from "express";
import { createUser, loginUser, getCurrentUserProfile } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import { calculateTripDetails, deleteTripData, getTripdata, getTripDataPagination, uploadTrip } from '../controllers/tripController.js'
import multer from "multer";

const router = express.Router()

const upload = multer({ dest: 'uploads/' })

router.post('/register', createUser)
router.post('/login', loginUser)
router.get('/profile', protect, getCurrentUserProfile)
router.post('/tripdata', protect, upload.single('file'), uploadTrip)
router.get('/tripdetails', protect, getTripdata)
router.get('/trips', protect, getTripDataPagination)
router.delete('/delete', protect, deleteTripData)
router.post('/calculate-trip-details', protect, calculateTripDetails)

export default router