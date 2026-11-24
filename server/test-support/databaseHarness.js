function setupDatabaseApp(){
 jest.resetModules();
 const db=require('../db');
 db.query.mockResolvedValue([[{id:13,role:'student'}]]);
 return{app:require('../app'),access:require('../middleware/session'),db};
}
module.exports={setupDatabaseApp};
