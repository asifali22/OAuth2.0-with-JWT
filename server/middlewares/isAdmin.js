export default (req, res, next) => {
    // Check if the user is admin - remember it's piped so requesting user details are present in req.user
    req.isAdmin = true;
    next();
};