import bcrypt from 'bcrypt'

const hashPassword = async () => {
    //   recieve the password from console 
    const password = process.argv[2]
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log(hashedPassword)
}

hashPassword()