import Trip from '../models/tripModel.js';
import fs from 'fs';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';
import path from 'path';
import geolib from 'geolib'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadTrip = async (req, res) => {
    const results = [];
    const userId = req.body.userId;

    if (!req.file) return res.status(400).send('No file uploaded.');

    const filePath = path.join(__dirname, '../uploads', req.file.filename);

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))

        .on('end', async () => {
            try {
                const insertResult = await Trip.insertMany(results.map(item => ({
                    userID: userId,
                    tripName: req.body.tripName,
                    gpsData: item,
                    createdAt: new Date(),
                })));

                const tripIds = insertResult.map(trip => trip._id);
                res.status(200).json({ message: 'Trip uploaded successfully!', tripIds });
            } catch (err) {
                return res.status(500).send('Error saving to database: ' + err.message);
            }
        })

        .on('error', (error) => {
            console.error('Error processing file:', error);
            return res.status(500).send('Error processing file.');
        });
};

const getTripdata = async (req, res) => {
    try {
        const userId = req.user._id
        console.log(userId)

        const trips = await Trip.find({ userID: userId })

        res.status(200).json(trips);
    } catch (err) {
        return res.status(500).send('Error fetching trips: ' + err.message);
    }
};


const getTripDataPagination = async (req, res) => {
    const userId = req.user._id
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip)

        const Trips = await Trip.find({ userID: userId })

        const paginatedTrips = Trips.slice(skip, skip + limit)

        return res.status(200).json({
            product: paginatedTrips,
            total: Trips.length,
            skip,
            limit,
            page
        })


    } catch (error) {

    }
}

const deleteTripData = async (req, res) => {
    const userId = req.user._id
    console.log(userId);
    const { selectedTrips } = req.body
    console.log(selectedTrips);
    try {
        if (userId && selectedTrips.length > 1) {
            await Trip.deleteMany({ _id: { $in: selectedTrips } })
            return res.status(200).json({ message: "Trips deleted successfully" })
        } else if (userId && selectedTrips.length === 1) {
            await Trip.findByIdAndDelete({ _id: selectedTrips })
            return res.status(200).json({ message: 'Trip deleted successfully' })
        } else {
            return res.status(400).json({ message: 'No trips selected for deletion.' });
        }
    } catch (error) {
        console.error('Error deleting trips:', error);
        return res.status(500).json({ message: 'Error deleting trips' });
    }
}


const calculateTripDetails = async (req, res) => {
    const { ids } = req.body;

    try {
        const trips = await Trip.find({ '_id': { $in: ids } });

        const gpsDataArray = trips.map(trip => trip.gpsData).flat();

        if (gpsDataArray.length < 2) {
            return res.status(200).json({
                totalDistance: 0,
                totalDuration: 0,
                totalOverspeedingDuration: 0,
                totalOverspeedingTimeInMinutes: "0.00",
                totalIdlingDuration: 0,
                totalStoppageDuration: 0,
            });
        }

        let totalDistance = 0;
        let totalDuration = 0;
        let totalOverspeedingDuration = 0;
        let totalIdlingDuration = 0;
        let totalStoppageDuration = 0;

        for (let i = 0; i < gpsDataArray.length - 1; i++) {
            const pointA = {
                latitude: parseFloat(gpsDataArray[i].latitude),
                longitude: parseFloat(gpsDataArray[i].longitude),
            };
            const pointB = {
                latitude: parseFloat(gpsDataArray[i + 1].latitude),
                longitude: parseFloat(gpsDataArray[i + 1].longitude),
            };

            const distance = geolib.getDistance(pointA, pointB)
            totalDistance += distance

            const timeA = new Date(gpsDataArray[i].timestamp).getTime()
            const timeB = new Date(gpsDataArray[i + 1].timestamp).getTime()

            const duration = (timeB - timeA) / 1000
            totalDuration += duration

            const speed = geolib.getPreciseDistance(pointA, pointB, duration)
            const speedKmH = speed * 3.6

            if (speedKmH > 80) {
                totalOverspeedingDuration += duration
            }

            const ignitionStateA = gpsDataArray[i].ignition
            const ignitionStateB = gpsDataArray[i + 1].ignition
            if (ignitionStateA === 'off') {
                totalIdlingDuration += duration
            }

            if (speedKmH === 0) {
                totalStoppageDuration += duration
            }
        }

        const totalOverspeedingTimeInMinutes = (totalOverspeedingDuration / 60).toFixed(2);
        const totalIdlingTimeInMinutes = (totalIdlingDuration / 60).toFixed(2);
        const totalStoppageTimeInMinutes = (totalStoppageDuration / 60).toFixed(2);

        return res.status(200).json({
            trips: trips,
            totalDistance: totalDistance,
            totalDuration: totalDuration,
            totalOverspeedingDuration: totalOverspeedingDuration,
            totalOverspeedingTimeInMinutes: totalOverspeedingTimeInMinutes,
            totalIdlingDuration: totalIdlingDuration,
            totalIdlingTimeInMinutes: totalIdlingTimeInMinutes,
            totalStoppageDuration: totalStoppageDuration,
            totalStoppageTimeInMinutes: totalStoppageTimeInMinutes
        });

    } catch (error) {
        console.error('Error calculating trip details:', error);
        res.status(500).json({ error: 'An error occurred while calculating trip details.' });
    }

};


export {
    uploadTrip,
    getTripdata,
    getTripDataPagination,
    deleteTripData,
    calculateTripDetails
};
