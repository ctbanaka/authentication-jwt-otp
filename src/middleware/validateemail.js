const validateEmail = (req, res, next)=>{
    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    
       
      next();
    }
    
    module.exports = {validateEmail};
