import jwt from 'jsonwebtoken';

const SECRET_KEY = 'votre_clé_secrète';

export default (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        
        if (decoded.role === 'admin') {
            return next();  // Laisser passer l'admin vers le admin-service
        } else {
            return res.status(403).json({ message: 'Accès interdit aux utilisateurs non-admin' });
        }
    } catch (err) {
        return res.status(403).json({ message: 'Token invalide' });
    }
};
