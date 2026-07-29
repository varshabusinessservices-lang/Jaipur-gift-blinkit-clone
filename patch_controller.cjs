const fs = require('fs');
let code = fs.readFileSync('server/src/modules/categories/category.controller.ts', 'utf8');

code += `

export const createParentCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateCategoryDto = req.body;
    dto.parentId = null;
    dto.level = 1;
    dto.categoryType = 'PARENT';
    const category = await categoryService.createCategory(dto, user?.id);
    res.status(201).json({ success: true, message: 'Parent Category created successfully', data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create parent category' });
  }
};

export const createChildCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateCategoryDto = req.body;
    if (!dto.parentId) throw new Error('Parent ID is required for a Child Category.');
    
    const parent = await categoryService.getCategoryById(dto.parentId);
    if (parent.level !== 1 || parent.categoryType !== 'PARENT') {
       throw new Error('Child Category must belong to a LEVEL 1 Parent Category.');
    }
    
    dto.level = 2;
    dto.categoryType = 'CHILD';
    const category = await categoryService.createCategory(dto, user?.id);
    res.status(201).json({ success: true, message: 'Child Category created successfully', data: category });
  } catch (error: any) {
    res.status(422).json({ success: false, message: error.message || 'Failed to create child category' });
  }
};

export const createSubChildCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const dto: CreateCategoryDto = req.body;
    if (!dto.parentId) throw new Error('Parent ID is required for a Sub-Child Category.');
    
    const parent = await categoryService.getCategoryById(dto.parentId);
    if (parent.level !== 2 || parent.categoryType !== 'CHILD') {
       throw new Error('Sub-Child Category must belong to a LEVEL 2 Child Category.');
    }
    
    dto.level = 3;
    dto.categoryType = 'SUB_CHILD';
    const category = await categoryService.createCategory(dto, user?.id);
    res.status(201).json({ success: true, message: 'Sub-Child Category created successfully', data: category });
  } catch (error: any) {
    res.status(422).json({ success: false, message: error.message || 'Failed to create sub-child category' });
  }
};

export const getParentCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories({ ...req.query, level: 1 } as any);
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getChildCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategories({ ...req.query, level: 2 } as any);
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const moveCategory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id;
    const { parentId } = req.body;
    
    // basic validation
    if (id === parentId) throw new Error('Category cannot be its own parent.');
    
    const dto: any = { parentId };
    const category = await categoryService.updateCategory(id, dto, user?.id);
    res.status(200).json({ success: true, message: 'Category moved successfully', data: category });
  } catch (error: any) {
    res.status(422).json({ success: false, message: error.message });
  }
};
`;

fs.writeFileSync('server/src/modules/categories/category.controller.ts', code);
console.log('Controller updated');
