export default (req, res, next) => {
    // Authenticate user here - URAM request
    console.log(`at auth middleware`);
    req.user_id = '123';
    req.app_name = 'docx';
    next();
};