# Trip Planner API


### Overview

This project involves creating a Trip Planner API that interacts with a third-party service to search for trips between specified origins and destinations.
The API allows sorting the results based on the fastest or cheapest trips. Additionally, the system includes functionality to manage trips by saving, listing, and deleting them(Trip Manager Bonus).
This API offers also a bonus feature for calculating the carbon emissions of flights using the Carbon Interface API.

The project aims to demonstrate proficiency in building a Node.js application with clean architecture and best practices while meeting specific functional requirements.

*Functional Requirements:*

1. The API should allow users to search for trips based on the origin and destination provided.
2. The API should support sorting the search results by either the fastest or the cheapest trips.
3. The API should enable users to save selected trips for future reference.
4. The API should provide an endpoint to list all saved trips.
5. The API should allow users to delete a saved trip by its ID.

### Prerequisites
To run this project, you must have `Docker` and `Docker Compose` installed on your system. A convenient way to install both is by using `Docker Desktop`, which is available for various operating systems:

##### Docker Desktop Download: *https://www.docker.com/products/docker-desktop/*


### Getting Started

##### 1. Clone the Repository
Start by cloning the repository to your local machine:

```bash
git clone https://github.com/lisenpasha/trip-planner.git
cd trip-planner
```

##### 2. Setup Environment Variables

A  `.env.example`  file is included in this repository. You should create a .env file in the root directory of the project, following the format provided in the .env.example file.

###### Important:

You only need to change the `API_KEY` variable, which represents the API key provided in the email.
For the `CARBON_INTERFACE_API_KEY`, you can use my API key for testing purposes, which is already included in the `.env.example` file.

##### 3. Run the Containers
You can start the containers by running:

```bash
docker-compose up
```
This command will start both the application and MongoDB containers.

**Note:** Before the application is fully up and running, unit tests(15 total) will automatically execute as part of the Docker setup process. You can monitor the results of these tests in the terminal to ensure that everything is functioning correctly. Please ensure that the mongo-1 instance is running and available after tests are completed, before attempting to use the API routes.

**Bonus Feature:** Carbon Emission Calculation
This API includes an additional feature to calculate the carbon emissions for flights. This feature leverages the `Carbon Interface API` to provide users with insights into the environmental impact of their travel.

#### Available Routes
1. **Search Trips**
   - **Endpoint:** `/api/trips/search`
   - **Method:** GET
   - **Parameters:** `origin`, `destination`, `sort_by`
   - **Description:** Searches for trips between the specified origin and destination, sorted by the specified strategy (fastest or cheapest).

2. **Save Trip**
   - **Endpoint:** `/api/trips`
   - **Method:** POST
   - **Body:**

  
   ```bash
         {
           "origin": "JFK",
           "destination": "LAX",
           "cost": 200,
           "duration": 300,
           "type": "flight",
           "display_name": "NYC to LA",
           "id": "some-external-id"  // This will be saved as external_id in the database
         }
   ```
   
   
      #### Explanation:
      The `id` field in the request body is saved as `external_id` in the database. This design allows you to copy a ready object from the API mentioned in the task requirements and paste it directly without further changes. This makes it easy to integrate with other systems or to test the API with pre-existing data.

   - **Description:** Saves a new trip to the database.

3. **List Saved Trips**
   - **Endpoint:** `/api/trips`
   - **Method:** GET
   - **Description:** Lists all saved trips.

4. **Delete Saved Trip**
   - **Endpoint:** `/api/trips/:id`
   - **Method:** DELETE
   - **Description:** Deletes a saved trip by its ID.

5. **[Extra Feature] Trip Type Filtering and Aggregation**
   - **Endpoint:** `/api/trips/aggregate`
   - **Method:** GET
   - **Description:** This extra feature filters and aggregates trips based on the specified type (e.g., flights, cars, trains) between the given origin and destination. If a trip type is specified, the API will return the total number of trips, the average cost, and the average duration for that specific trip type.
   - **Parameteres:** 
            - `origin` (required): The IATA 3-letter code of the origin location.   
            - `destination` (required): The IATA 3-letter code of the destination location.   
            - `type` (required): The type of trip (flight, car, train).   
     
   - **Example Response:**
   ```bash
         {
         "origin": "SYD",
         "destination": "GRU",
         "type": "car",
         "total_trips": 3,
         "average_cost": 2412,
         "average_duration": 19.67
         }
   ```
6. **[Extra Feature] Best Value Trip**
   - **Endpoint:** `/api/trips/best-value`
   - **Method:** GET
   - **Description:** This extra feature calculates and returns the best value trip based on a combination of cost and duration. The `value score` is determined by dividing the cost by the duration, and the trip with the lowest value score is considered the best value.
   - **Parameteres:**
            - `origin` (required): The IATA 3-letter code of the origin location.   
            - `destination` (required): The IATA 3-letter code of the destination location.   



### Security and Best Practices
This API has been fortified with several security-focused middlewares to protect against common  vulnerabilities:

helmet: Helps secure your app by setting various HTTP headers.

express-mongo-sanitize: Prevents NoSQL injection attacks.

xss-clean: Sanitizes user input to prevent cross-site scripting (XSS) attacks.

express-rate-limit: Limits repeated requests to public APIs and endpoints, protecting against brute-force attacks.

hpp: Protects against HTTP parameter pollution attacks.


### Custom Middlewares
In addition to the security middlewares mentioned above, the API also includes custom middlewares that are specifically tailored for certain operations, such as:

**Delete Trip:** Custom middleware to validate and sanitize the trip ID before deletion.

**Create New Trip:** Custom middleware to validate and sanitize input data when creating a new trip, ensuring that only valid data is processed.

**Search Trips:** Custom middleware to validate and sanitize the search parameters, ensuring that the correct data is retrieved.
These custom middlewares are designed to handle specific validation and sanitization tasks for different API operations, making the API more organized and secure.
