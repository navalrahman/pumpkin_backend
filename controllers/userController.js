import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import createToken from "../utils/createToken.js";


const createUser = async (req, res) => {
    const { username, email, password, role } = req.body


    if (!username || !email || !password) {
        return res.status(400).send("Please fill all fields")
    }

    try {
        const userExist = await User.findOne({ email })
        if (userExist) {
            return res.status(400).send("User already exists")
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({ username, email, password: hashedPassword, role })

        await newUser.save()

        return res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });

    } catch (error) {
        console.error("error", error.message);
        return res.status(500).send("Server error");
    }

}


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('All fields need to be filled');
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = createToken(user._id);

            return res.status(200).json({
                token,
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            });
        } else {
            return res.status(400).send('Invalid email or password');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Server error');
    }
};


const getCurrentUserProfile = async (req, res) => {
    console.log(req.user);

    try {
        const user = await User.findOne({ _id: req.user._id })
        
        if (user) {
            return res.json({ _id: user._id, username: user.username, email: user.email, role: user.role })
        }

    } catch (error) {
        console.log("error", error);
        return res.status(404).send("user not found")

    }
}



export {
    createUser,
    loginUser,
    getCurrentUserProfile
}