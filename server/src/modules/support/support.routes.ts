import { Router } from 'express';
import { SupportController } from './support.controller';

const router = Router();
const controller = new SupportController();

router.post('/', controller.createTicket);
router.get('/', controller.listTickets);
router.get('/:id', controller.getTicket);
router.post('/:id/messages', controller.addMessage);
router.patch('/:id/status', controller.updateTicketStatus);

export { router as supportRoutes };
