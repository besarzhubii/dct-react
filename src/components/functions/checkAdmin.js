const checkAdmin = () => {
    const user =  JSON.parse(localStorage.getItem('user'));
    return user;
}

export default checkAdmin;