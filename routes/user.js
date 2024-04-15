const express = require("express")
const router = express.Router()
const {handleHomePage,
    handleRegistrationPage,
    handleRegistrationData,
    handleLoginPage,
    handleLoginProcess,
    handleProfilePage,
    handleAdminRoute,
    handleModeratorRoute,
    handleLogOut
} = require("../controllers/user")

const {
    authenticate, 
    isAdmin,
    isModerator
}= require("../middlewares/user")


router
    .route("/")
    .get(handleHomePage)

router
    .route("/register")
    .get(handleRegistrationPage)
    .post(handleRegistrationData)

router
    .route("/login")
    .get(handleLoginPage)
    .post(handleLoginProcess)

router
    .route("/profile")
    .get(authenticate, handleProfilePage)

router
    .route("/admin")
    .get(authenticate, isAdmin, handleAdminRoute)

router
    .route("/moderator")
    .get(authenticate, isModerator, handleModeratorRoute)

router
    .route("/logout")
    .get(handleLogOut)

module.exports = router;