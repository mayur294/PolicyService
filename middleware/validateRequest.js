const validateRequest = (requiredFields) => (req, res, next) => {
    const bodyFields = requiredFields.filter((field) => !req.body[field]);

    if (bodyFields.length > 0) {
        return res.status(400).json({ error: `Missing fields: ${bodyFields.join(', ')}` });
    }

    next();
};

module.exports = validateRequest;
