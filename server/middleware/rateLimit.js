function rateLimit({ windowMs, max })
{
    const hits = new Map(); //key -> {count, resetAt}
    return (req, res, next) =>
    {
        const id = req.apiKey || req.ip;
        const now = Date.now();
        let entry = hits.get(id);

        if (!entry || now >= entry.resetAt){
            entry = { count:0, resetAt:now + windowMs};
            hits.set(id,entry);
        }
        entry.count += 1;
        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.set('Retry-After', retryAfter);
            return res.status(429).json({ message: 'Too many requests, please try again later.' });
        }
        next();
    };
}

module.exports = { rateLimit };