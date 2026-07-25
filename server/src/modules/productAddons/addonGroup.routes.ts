import { Router } from 'express';
import * as controller from './addonGroup.controller';

export const addonGroupRouter = Router();

addonGroupRouter.get('/', controller.listGroups);
addonGroupRouter.post('/', controller.createGroup);

addonGroupRouter.get('/:id', controller.getGroupById);
addonGroupRouter.patch('/:id', controller.updateGroup);
addonGroupRouter.put('/:id/items', controller.updateGroupItems);
addonGroupRouter.delete('/:id', controller.deleteGroup);
addonGroupRouter.post('/:id/restore', controller.restoreGroup);
