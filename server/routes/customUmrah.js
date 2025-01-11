import express from 'express';
import { CustomUmrahHotelModel, CustomUmrahServiceModel, CustomUmrahPriceModel } from '../models/index.js';

const router = express.Router();

// Get all custom packages for a lead
router.get('/leads/:leadId/custom-umrah', async (req, res) => {
  try {
    const packages = await CustomUmrahHotelModel.findAll(req.params.leadId);
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching custom packages', error });
  }
});

// Create new custom package
router.post('/leads/:leadId/custom-umrah', async (req, res) => {
  const { hotels, services, prices } = req.body;
  const { leadId } = req.params;

  try {
    // Start a transaction
    const { data: transaction } = await supabase.rpc('begin_transaction');

    try {
      // Create hotels and collect their IDs
      const createdHotels = [];
      for (const hotel of hotels) {
        const hotelData = await CustomUmrahHotelModel.create({
          ...hotel,
          lead_id: leadId
        });
        createdHotels.push(hotelData);

        // Create services for each hotel
        if (services?.length) {
          for (const service of services) {
            await CustomUmrahServiceModel.create({
              ...service,
              custom_umrah_hotel_id: hotelData.id
            });
          }
        }

        // Create price record for each hotel
        if (prices) {
          await CustomUmrahPriceModel.create({
            ...prices,
            custom_umrah_hotel_id: hotelData.id
          });
        }
      }

      await supabase.rpc('commit_transaction');
      res.status(201).json(createdHotels);
    } catch (error) {
      await supabase.rpc('rollback_transaction');
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating custom package', error });
  }
});

// Update custom package
router.patch('/custom-umrah/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { hotel, services, prices } = req.body;

    // Update hotel
    const updatedHotel = await CustomUmrahHotelModel.update(hotelId, hotel);

    // Update services and prices if provided
    if (services?.length) {
      // First delete existing services
      await CustomUmrahServiceModel.deleteByHotelId(hotelId);
      // Then create new ones
      for (const service of services) {
        await CustomUmrahServiceModel.create({
          ...service,
          custom_umrah_hotel_id: hotelId
        });
      }
    }

    if (prices) {
      await CustomUmrahPriceModel.update(hotelId, prices);
    }

    res.json(updatedHotel);
  } catch (error) {
    res.status(500).json({ message: 'Error updating custom package', error });
  }
});

// Delete custom package
router.delete('/custom-umrah/:hotelId', async (req, res) => {
  try {
    await CustomUmrahHotelModel.delete(req.params.hotelId);
    res.json({ message: 'Custom package deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting custom package', error });
  }
});

export default router; 