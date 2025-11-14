# Inventory System

An inventory management application designed specifically to **help small businesses** who struggle to track their products, manage stock, and oversee staff operations. It provides a simple yet effective solution for product control, logging, and reporting.

---

## About

This project was built to **support small businesses** that can't afford or manage complex ERP systems. With a clean UI and powerful backend, it allows business owners to:

The manager can have a staff with limit of 3 and also the manager only can create a product and update the information of the products.
The staff only can do is to delete and update the product stock.

the purpose of the deletion is if the product is wrong details or not anymore part of the inventory.

- Track their inventory in real-time
- Monitor staff activities
- View logs of every stock change or deletion
- Improve accountability and reduce product loss

---

## Features

-  Authentication and role-based access (manager and staff)
-  Add, edit, delete products with image support
-  Background removal integration via PhotoRoom or remove.bg
-  Real-time product and deletion logs
-  Stock management and audit logs
-  Responsive UI with React, Zustand state management
-  Automatic Remove background in the images but only limited (using a free tier api) for removing backgound
-  Send to Email it self when reset the password and implement the email send to the owner of IMS when the user requesting to create/manage products


---

## Tech Stack

| Layer        | Tools & Libraries           |
|--------------|-----------------------------|
| Backend      | Node.js, Express, Supabase  |
| Auth         | JWT + Supabase middleware   |
| Image Upload | Cloudinary, PhotoRoom API   |
| Frontend     | React.js, Zustand           |
| UI           | Tailwind CSS, Radix UI      |
| Animations   | Framer Motion               |

---
