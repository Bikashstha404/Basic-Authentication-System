const {z} = require("zod");

const signupSchema = z.object({
    name: z
    .string({required_error: "Name is required"})
    .trim()
    .min(3, {message: "Name must be atleast of 3 characters."})
    .max(255, {message: "Name must not be more than 255 characters."}),

    email: z
    .string({required_error: "Email is required."})
    .trim()
    .email({message: "Invalid Email Address."})
    .min(3, {message: "Email must be atleast of 3 characters."})
    .max(255, {message: "Email must not be more than 255 characters."}),

    password: z
    .string({required_error: "Password is required."})
    .min(7, {message: "Password must be atleast of 6 characters."})
    .max(1024, {message: "Password can't be more than 1024 characters."}),

    role: z
    .string()
    .trim()
    .default("user")
})

module.exports = {
    signupSchema
}