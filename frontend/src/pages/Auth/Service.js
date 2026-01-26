import axios from "axios";

export const handleSignin = async ({
    password = "",
    username = "",
}) => {
    try {
        let data = {
            password: password,
            username: username,
        };
        let result = await axios({
            method: 'post',
            maxBodyLength: Infinity,
            url: `http://localhost:3001/api/v1/auth/signin`,
            data: data,
        });
        return result.data;
    } catch (error) {
        console.log(error);
    };
};
