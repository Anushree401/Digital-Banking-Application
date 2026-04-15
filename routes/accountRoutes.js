const express = require('express');
const router = express.Router();

const { Account, AccountHolder, Customer } = require('../database/models');

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get user accounts
 *     description: Returns all bank accounts linked to the logged-in user
 *     tags:
 *       - Accounts
 *     responses:
 *       200:
 *         description: List of user accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   acc_no:
 *                     type: string
 *                   acc_type:
 *                     type: string
 *                   balance:
 *                     type: number
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized (user not logged in)
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const accountHolders = await AccountHolder.findAll({
      where: { customer_id: customer.id },
      include: [
        { model: Account, as: 'fromAccount' },
        { model: Account, as: 'toAccount' }
      ]
    });

    const accounts = accountHolders.map(ah => ah.Account);

    res.json(accounts);

  } catch (err) {
    console.error("ACCOUNTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;