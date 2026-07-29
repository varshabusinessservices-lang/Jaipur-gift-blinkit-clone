const fs = require('fs');
let code = fs.readFileSync('server/src/modules/categories/category.routes.ts', 'utf8');

code = code.replace("categoryRouter.get('/', categoryController.getCategories);", 
`categoryRouter.get('/', categoryController.getCategories);
categoryRouter.get('/parents', categoryController.getParentCategories);
categoryRouter.get('/children', categoryController.getChildCategories);
categoryRouter.post('/parent', categoryController.createParentCategory);
categoryRouter.post('/child', categoryController.createChildCategory);
categoryRouter.post('/sub-child', categoryController.createSubChildCategory);`);

code = code.replace("categoryRouter.post('/:id/restore', categoryController.restoreCategory);",
`categoryRouter.post('/:id/restore', categoryController.restoreCategory);
categoryRouter.post('/:id/move', categoryController.moveCategory);`);

fs.writeFileSync('server/src/modules/categories/category.routes.ts', code);
console.log('Routes updated');
