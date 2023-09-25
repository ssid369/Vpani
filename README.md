#E-Commerce App Backend


Welcome to the backend repository of the E-Commerce app! This Node.js application, built with TypeScript, serves as the backend for your e-commerce platform , Zod was employed for backend validation of user inputs. MongoDB is used as the database, and JSON Web Tokens (JWT) are employed for user authentication and authorization.
Table of Contents


Getting Started

To get started with the E-Commerce app backend on your local machine, follow these steps:

    Clone the repository to your local machine using Git:

    bash


Project Structure

There are two main files one for admin routes that deals with all th e backend api routes for ADMIN functionlities and a User files for User functionalities , the authentication logic is done in middleware.ts file and db schemas are defined inside the db folder

Features

The E-Commerce app backend provides various features, including:

    User Authentication: Users can register, log in, and maintain secure sessions using JWT.
    Product Management: Admins can add, update, and delete products.
    Shopping Cart: Users can add products to their cart and proceed to checkout.
    Order Processing: Orders are created, processed, and tracked.
    Product Reviews: Users can leave reviews for products.
    Search and Filtering: Users can search for products and apply filters.
    Category and Brand Management: Admins can manage product categories and brands.
    User Profile: Users can view and update their profile information.
    Security: User data and transactions are protected with proper security measures.

Authentication

The E-Commerce app backend uses JSON Web Tokens (JWT) for authentication. To authenticate API requests, include the JWT token in the Authorization header of your HTTP requests with the Bearer scheme. For example:
