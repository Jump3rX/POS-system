# README: POS System Project

## **Project Name:** GetItRight POS System

## **Overview**

The GetItRight POS System is a robust and user-friendly Point of Sale (POS) solution designed to streamline retail operations. It is built to handle sales, inventory management, customer interactions, and multi-location store operations. This system is developed in multiple phases, starting with the Bronze Package (basic sales and inventory features) and scaling up to advanced features like multi-store support and reporting.

---

## **Tech Stack**

### **Frontend:**

- React.js
- HTML5, CSS3, JavaScript
- Chart.js (for data visualization)

### **Backend:**

- Django (REST framework)
- Python

### **Database:**

- MySQL

### **Other Tools:**

- Git (Version Control)

---

## **Setup Instructions**

### **1. Requirements:**

- Python 3.8 or higher
- Node.js 14 or higher
- MySQL Server (XAMPP)

### **2. Clone the Repository:**

```bash
git clone https://github.com/Jump3rX/POS-system.git
cd POS-system
```

### **3. Backend Setup:**

```bash
cd POS-system
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### **4. Frontend Setup:**

```bash
cd frontend
npm install
npm start
```

### **5. Database Configuration:**

- No database setup is required
