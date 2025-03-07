const jwt = require('jsonwebtoken');

exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ message: 'Token manquant' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token invalide ou expiré' });
            }

            const { userId, roles } = decoded;

            const hasRole = roles.some(role => allowedRoles.includes(role));

            if (!hasRole) {
                return res.status(403).json({ message: "Accès refusé. Rôle non autorisé." });
            }

            req.user = { userId, roles };
            next(); 
        });
    };
};
