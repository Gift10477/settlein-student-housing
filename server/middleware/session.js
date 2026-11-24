const crypto=require('crypto');
const sessions=new Map();
const digest=token=>crypto.createHash('sha256').update(token).digest('hex');
function issueSession(userId){
 const now=Date.now();for(const [key,value]of sessions)if(value.expiresAt<=now)sessions.delete(key);
 const token=crypto.randomBytes(32).toString('hex');sessions.set(digest(token),{userId:String(userId),expiresAt:now+3600000});return token;
}
function currentUser(req){
 const match=/^Bearer ([a-f0-9]{64})$/.exec(req.get('Authorization')||'');
 const session=match&&sessions.get(digest(match[1]));return session&&session.expiresAt>Date.now()?session.userId:null;
}
function requireUser(req,res,next){req.userId=currentUser(req);return req.userId?next():res.status(401).json({error:'Please sign in.'});}
function requireOwner(getId){return(req,res,next)=>{const id=currentUser(req);if(!id)return res.status(401).json({error:'Please sign in.'});if(String(getId(req))!==id)return res.status(403).json({error:'Access denied.'});req.userId=id;next();};}
async function requireAdmin(req,res,next){
 req.userId=currentUser(req);if(!req.userId)return res.status(401).json({error:'Please sign in.'});
 try{const [rows]=await require('../db').query('SELECT role FROM users WHERE id = ?',[req.userId]);if(rows[0]?.role!=='admin')return res.status(403).json({error:'Administrator access required.'});next();}catch(error){next(error);}
}
function revokeUserSessions(userId){for(const[key,session]of sessions)if(session.userId===String(userId))sessions.delete(key);}
function requireRoles(...roles){return async(req,res,next)=>{
 req.userId=currentUser(req);if(!req.userId)return res.status(401).json({error:'Please sign in.'});
 try{const [rows]=await require('../db').query('SELECT role FROM users WHERE id = ?',[req.userId]);if(!roles.includes(rows[0]?.role))return res.status(403).json({error:'Landlord access required.'});next();}catch(error){next(error);}
};}
module.exports={issueSession,requireUser,requireOwner,requireAdmin,requireRoles,revokeUserSessions};
