const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    
    return async (req, res, next) => {
        try {
            // Use jwt middleware directly here
            jwt({ secret, algorithms: ['HS256'] })(req, res, async (err) => {
                if (err) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                
                const account = await db.account.findByPk(req.auth.id);
                if (!account || (roles.length && !roles.includes(account.role))) {
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                
                req.auth.role = account.role;
                const refreshTokens = await account.getRefreshTokens();
                req.auth.ownsToken = token => !!refreshTokens.find(x => x.token === token);
                next();
            });
        } catch (error) {
            next(error);
        }
    };
}
