jest.setTimeout(30000); // 30 seconds
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Trip = require('../models/Trip');



beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Search Funcionality', () => {
  it('should search for trips and sort by cheapest', async () => {
    const res = await request(app).get('/api/trips/search?origin=SYD&destination=GRU&sort_by=cheapest');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);

    // Ensure the trips are sorted by cost in ascending order
    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].cost).toBeLessThanOrEqual(res.body[i + 1].cost);
    }
  });

  it('should search for trips and sort by fastest', async () => {
    const res = await request(app).get('/api/trips/search?origin=SYD&destination=GRU&sort_by=fastest');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);

    // Ensure the trips are sorted by duration in ascending order
    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].duration).toBeLessThanOrEqual(res.body[i + 1].duration);
    }
  });

  it("should return 400 and 'Invalid origin parameter' if origin is invalid", async () => {
    const res = await request(app).get('/api/trips/search?origin=AM&destination=GRU&sort_by=cheapest');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Invalid origin parameter.');
  });

  it("should return 400 and 'Invalid destination parameter' if destination is invalid", async () => {
    const res = await request(app).get('/api/trips/search?origin=SYD&destination=GR&sort_by=cheapest');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Invalid destination parameter.');
  });

  it("should return 400 if sort_by is not equal to 'fastest' or 'cheapest' ", async () => {
    const res = await request(app).get('/api/trips/search?origin=SYD&destination=GRU&sort_by=invalid_sort');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Invalid sort_by value. Must be "fastest" or "cheapest".');
  });

  it("should return 400 and 'Missing origin parameter' if origin is missing", async () => {
    const res = await request(app).get('/api/trips/search?destination=GRU&sort_by=cheapest');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Missing origin parameter.');
  });

  it("should return 400 and 'Missing destination parameter' if destination is missing", async () => {
    const res = await request(app).get('/api/trips/search?origin=SYD&sort_by=cheapest');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Missing destination parameter.');
  });

  it("should return 400 and 'Missing sort_by parameter' if sort_by is missing", async () => {
    const res = await request(app).get('/api/trips/search?origin=SYD&destination=GRU');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Missing sort_by parameter.');
  });

});


describe("Trip Manager", () => {

  it('should save a trip', async () => {
    const tripData = {
      id: 'test-trip-1',
      origin: 'SYD',
      destination: 'GRU',
      cost: 500,
      duration: 15,
      type: 'flight',
      display_name: 'Test Trip'
    };

    const res = await request(app).post(`/api/trips`).send(tripData);
    expect(res.statusCode).toEqual(201);
    expect(res.body.newTrip.external_id).toEqual('test-trip-1');

    // Verify that the trip is actually saved in the database
    const savedTrip = await Trip.findOne({ external_id: 'test-trip-1' });
    expect(savedTrip).not.toBeNull();
    expect(savedTrip.origin).toBe('SYD');
    expect(savedTrip.destination).toBe('GRU');
  
  });

  it('should return 400 if a required field is missing', async () => {
    const tripData = {
      id: 'test-trip-1',
      origin: 'SYD',
      destination: 'GRU',
      cost: 500,
      // Missing duration field
      type: 'flight',
      display_name: 'Test Trip with Missing Duration'
    };

    const res = await request(app).post(`/api/trips`).send(tripData);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('All fields are required.');
  });
  
  it('should return 400 if a number field has a string value', async () => {
    const tripData = {
      id: 'test-trip-2',
      origin: 'SYD',
      destination: 'GRU',
      cost: 'five hundred', // Invalid data type, should be a number
      duration: 15,
      type: 'flight',
      display_name: 'Test Trip with Invalid Cost'
    };

    const res = await request(app).post(`/api/trips`).send(tripData);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Cost and duration must be numbers.');
  });

  it('should return 400 if a string field has a number value', async () => {
    const tripData = {
      id: 'test-trip-3', 
      origin: 'SYD',
      destination: 'GRU',
      cost: 500,
      duration: 15,
      type: 15, // Invalid data type, should be a string
      display_name: 'Test Trip with Numeric ID'
    };

    const res = await request(app).post(`/api/trips`).send(tripData);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Origin, destination, type, and display_name must be strings.');
  });


  it('should list saved trips', async () => {
    const res = await request(app).get(`/api/trips`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should delete a trip by ID', async () => {
    const savedTrip = await Trip.findOne({ external_id: 'test-trip-1' });
    const res = await request(app).delete(`/api/trips/${savedTrip._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Trip deleted successfully.');

    // Verify that the trip is actually deleted from the database
    const deletedTrip = await Trip.findOne({ _id: savedTrip._id });
    expect(deletedTrip).toBeNull();
  });

})